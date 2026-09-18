"use client";

import { useEffect, type RefObject } from "react";

/**
 * Local file:// video loads on this project have shown intermittent
 * failures on files independently verified — byte-for-byte, codec,
 * fast-start atom order — to be correct: "sometimes it works, sometimes
 * it doesn't" on the exact same file, the exact same page. Since a plain
 * `.load()` retry has reliably resolved it when that's happened, this
 * silently retries a few times (with a short backoff) on the video's
 * `error` event, instead of leaving the browser's broken-media icon up
 * for good after one bad attempt.
 */
export function useVideoErrorRetry(
  ref: RefObject<HTMLVideoElement | null>,
  maxRetries = 3,
) {
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    function onError() {
      if (attempts >= maxRetries) return;
      attempts += 1;
      timer = setTimeout(() => {
        v?.load();
      }, 400 * attempts);
    }
    v.addEventListener("error", onError);
    return () => {
      v.removeEventListener("error", onError);
      clearTimeout(timer);
    };
  }, [ref, maxRetries]);
}
