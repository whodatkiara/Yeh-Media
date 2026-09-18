// Prints one line of JSON describing a video file's track info — used by
// fix-videos.py, which has no direct way to ask AVFoundation about codecs
// on its own. Run directly for debugging: `swift scripts/probe-video.swift <path>`.
import AVFoundation
import Foundation

func fourCCString(_ code: FourCharCode) -> String {
    let bytes = [
        UInt8((code >> 24) & 0xff), UInt8((code >> 16) & 0xff),
        UInt8((code >> 8) & 0xff), UInt8(code & 0xff),
    ]
    return String(bytes: bytes, encoding: .ascii) ?? "????"
}

guard CommandLine.arguments.count > 1 else {
    FileHandle.standardError.write("usage: probe-video.swift <path>\n".data(using: .utf8)!)
    exit(1)
}
let path = CommandLine.arguments[1]
let asset = AVAsset(url: URL(fileURLWithPath: path))

var videoCodec = ""
var width = 0.0
var height = 0.0
if let t = asset.tracks(withMediaType: .video).first {
    width = Double(t.naturalSize.width)
    height = Double(t.naturalSize.height)
    if let desc = t.formatDescriptions.first {
        let fd = desc as! CMFormatDescription
        videoCodec = fourCCString(CMFormatDescriptionGetMediaSubType(fd))
    }
}

var audioCodec = ""
if let t = asset.tracks(withMediaType: .audio).first, let desc = t.formatDescriptions.first {
    let fd = desc as! CMFormatDescription
    audioCodec = fourCCString(CMFormatDescriptionGetMediaSubType(fd))
}

let json = """
{"width":\(width),"height":\(height),"videoCodec":"\(videoCodec)","audioCodec":"\(audioCodec)","durationSeconds":\(asset.duration.seconds),"playable":\(asset.isPlayable)}
"""
print(json)
