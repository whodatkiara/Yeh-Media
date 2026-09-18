#!/usr/bin/env python3
"""
Audits every .mp4 under public/ for the two things that have repeatedly
made videos "not play" on this site, and fixes them in place:

  1. Not "fast-start" — the `moov` atom (duration, seek table, codec
     info) written after `mdat` instead of before it. A browser needs
     moov before it can do much with the file; when it's at the end,
     playback can silently fail or hang depending on the browser, with
     no console error to point at. This has come from Higgsfield's own
     renders and from this project's own AVFoundation export script
     (scripts/slowtrim.swift) alike — it's not tied to one source.

  2. HEVC (`hvc1`) video instead of H.264 (`avc1`). HEVC plays fine on
     Apple's own stack but is NOT reliably supported in <video> across
     browsers/platforms (spotty-to-absent on Chrome/Firefox on
     Windows/Linux and much of Android) — a video can be perfectly
     valid and still just not play for a chunk of visitors. This has
     shown up on videos uploaded straight from an iPhone, which shoots
     HEVC by default.

Also strips the `com.apple.quarantine` / `com.apple.provenance` extended
attributes from every file it touches (and, once, everything under
public/) — harmless residue from files that started life downloaded or
uploaded rather than authored locally, but one more thing worth ruling
out rather than leaving sitting on an asset.

Both of the two main issues are silent failure modes — the file looks
fine, opens fine in QuickLook/Preview, even plays fine in Safari — so
they don't get caught by just eyeballing a video. Hence a script
instead of a one-off fix.

Fixing either re-encodes through macOS's built-in `avconvert`:
  - fast-start-only fix: PresetPassthrough (lossless remux, no
    re-encode — same bitrate/dimensions/duration, just reordered).
  - HEVC fix: re-encoded to H.264/AAC via an auto-picked preset sized
    to the source's longer edge (capped at 1080p-equivalent — if
    something oversized like a 4K export lands in public/, this also
    quietly saves you from a 400MB+ video file). This one does change
    bytes, so quality is spot-checked by dimension/duration match after
    (a real visual check still belongs to a human for anything that
    matters).

Run this:
  - right after adding ANY new video file to public/ — generated,
    uploaded, exported, trimmed, whatever produced it
  - any time "a video won't play" comes up again, as the first check,
    before assuming it's something else

Usage:
  python3 scripts/fix-videos.py            # scan + fix, in place
  python3 scripts/fix-videos.py --check    # scan only, no changes (exit 1 if anything needs fixing)
"""
import json
import os
import struct
import subprocess
import sys
import tempfile

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")
PROBE_SWIFT = os.path.join(SCRIPT_DIR, "probe-video.swift")

# Longer-edge caps, smallest first — H.264-guaranteed AVFoundation
# presets. Anything whose longer edge exceeds the last one gets capped
# there rather than exported at full size (see module docstring).
PRESETS = [
    (480, "Preset640x480"),
    (540, "Preset960x540"),
    (720, "Preset1280x720"),
    (1080, "Preset1920x1080"),
]


def pick_preset(long_edge):
    for cap, preset in PRESETS:
        if long_edge <= cap:
            return preset
    return PRESETS[-1][1]  # cap at 1080p-equivalent


def scan_top_atoms(path):
    size = os.path.getsize(path)
    atoms = []
    with open(path, "rb") as f:
        pos = 0
        while pos < size - 8:
            f.seek(pos)
            header = f.read(8)
            if len(header) < 8:
                break
            atom_size, atom_type = struct.unpack(">I4s", header)
            if atom_size == 1:
                f.seek(pos + 8)
                atom_size = struct.unpack(">Q", f.read(8))[0]
            if atom_size == 0:
                atom_size = size - pos
            atoms.append(atom_type.decode("latin1"))
            pos += atom_size
    return atoms


def is_faststart(path):
    atoms = scan_top_atoms(path)
    if "moov" not in atoms or "mdat" not in atoms:
        return None
    return atoms.index("moov") < atoms.index("mdat")


def probe(path):
    result = subprocess.run(
        ["swift", PROBE_SWIFT, path], capture_output=True, text=True, timeout=60
    )
    if result.returncode != 0:
        return None
    # swift's compiler prints deprecation warnings to stdout ahead of our
    # actual JSON line in some toolchain versions — the JSON is always
    # the last non-empty line.
    lines = [l for l in result.stdout.strip().splitlines() if l.strip()]
    if not lines:
        return None
    try:
        return json.loads(lines[-1])
    except json.JSONDecodeError:
        return None


def find_videos():
    found = []
    for root, _dirs, files in os.walk(PUBLIC_DIR):
        for name in files:
            if name.lower().endswith(".mp4"):
                found.append(os.path.join(root, name))
    return sorted(found)


def strip_quarantine(path):
    """Best-effort — most files won't have these set, that's fine."""
    for attr in ("com.apple.quarantine", "com.apple.provenance"):
        subprocess.run(["xattr", "-d", attr, path], capture_output=True)


def remux_passthrough(src, dst):
    subprocess.run(
        ["avconvert", "-s", src, "-o", dst, "-p", "PresetPassthrough", "--replace"],
        check=True, capture_output=True,
    )


def reencode_h264(src, dst, long_edge):
    preset = pick_preset(long_edge)
    subprocess.run(
        ["avconvert", "-s", src, "-o", dst, "-p", preset, "--replace"],
        check=True, capture_output=True,
    )


def fix_file(path, info, faststart):
    """Returns (ok: bool, detail: str)."""
    needs_transcode = info["videoCodec"] != "avc1"
    fd, tmp_path = tempfile.mkstemp(suffix=".mp4")
    os.close(fd)
    os.remove(tmp_path)
    try:
        if needs_transcode:
            long_edge = max(info["width"], info["height"])
            reencode_h264(path, tmp_path, long_edge)
        else:
            remux_passthrough(path, tmp_path)
    except subprocess.CalledProcessError as e:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        return False, "avconvert failed: %s" % (e.stderr.decode("utf-8", "replace")[:300])

    new_info = probe(tmp_path)
    new_faststart = is_faststart(tmp_path)
    if new_info is None:
        os.remove(tmp_path)
        return False, "couldn't probe the fixed file — not applied"
    if new_faststart is not True:
        os.remove(tmp_path)
        return False, "fixed file still isn't fast-start — not applied"
    if new_info["videoCodec"] != "avc1":
        os.remove(tmp_path)
        return False, "fixed file is still %s, not avc1 — not applied" % new_info["videoCodec"]
    if abs(new_info["durationSeconds"] - info["durationSeconds"]) > 0.5:
        os.remove(tmp_path)
        return False, "duration changed (%.1fs -> %.1fs) — not applied" % (
            info["durationSeconds"], new_info["durationSeconds"],
        )
    if not needs_transcode:
        before_size = os.path.getsize(path)
        after_size = os.path.getsize(tmp_path)
        if after_size < before_size * 0.9 or after_size > before_size * 1.1:
            os.remove(tmp_path)
            return False, "passthrough size changed >10%% (%d -> %d) — not applied" % (
                before_size, after_size,
            )

    os.replace(tmp_path, path)
    detail = "now %dx%d %s" % (new_info["width"], new_info["height"], new_info["videoCodec"])
    return True, detail


def main():
    check_only = "--check" in sys.argv
    videos = find_videos()
    if not videos:
        print("No .mp4 files found under %s" % PUBLIC_DIR)
        return 0

    needs_fix = []
    for path in videos:
        rel = os.path.relpath(path, PUBLIC_DIR)
        if not check_only:
            strip_quarantine(path)
        info = probe(path)
        if info is None:
            print("UNKNOWN   %s (couldn't probe — inspect manually)" % rel)
            continue
        faststart = is_faststart(path)
        problems = []
        if info["videoCodec"] != "avc1":
            problems.append(info["videoCodec"] + " video (needs H.264)")
        if faststart is False:
            problems.append("not fast-start")
        elif faststart is None:
            problems.append("no moov/mdat found")
        if problems:
            needs_fix.append((path, info, faststart, problems))
            print("NEEDS FIX %s — %s" % (rel, ", ".join(problems)))
        else:
            print("OK        %s (%dx%d avc1)" % (rel, info["width"], info["height"]))

    if not needs_fix:
        print("\nAll %d video(s) are fast-start H.264. Nothing to do." % len(videos))
        return 0

    print("\n%d file(s) need fixing." % len(needs_fix))
    if check_only:
        return 1

    print()
    failures = []
    for path, info, faststart, _problems in needs_fix:
        rel = os.path.relpath(path, PUBLIC_DIR)
        ok, detail = fix_file(path, info, faststart)
        print(("FIXED     %s (%s)" if ok else "FAILED    %s (%s)") % (rel, detail))
        if not ok:
            failures.append(rel)

    if failures:
        print("\n%d file(s) could not be fixed automatically: %s" % (len(failures), ", ".join(failures)))
        return 1

    print("\nAll fixed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
