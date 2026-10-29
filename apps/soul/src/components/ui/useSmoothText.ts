import { useEffect, useRef, useState } from "react";

/**
 * Reveal streamed text at a steady, readable pace instead of in network-sized bursts.
 *
 * Streamed replies arrive in uneven chunks (a word, then a sentence at once), which reads
 * as choppy. This paces the reveal in characters per SECOND rather than per frame: a
 * per-frame budget is really a frame-rate multiplier, so "at least one character a frame"
 * is already 60 c/s on a normal display, and faster on a 120Hz one.
 *
 * The rate eases up when the stream gets ahead — otherwise a long reply would finish
 * arriving long before it finished appearing — but it is capped, so it never turns back
 * into a burst. Fractional characters carry over between frames; rounding them away each
 * frame would silently floor the pace at one character per frame again.
 */

/** Resting pace. Close to brisk human typing; comfortable to read along with. */
const BASE_CPS = 26;
/** Ceiling once the stream is well ahead. Fast, but still legibly a reveal. */
const MAX_CPS = 85;
/** Share of the outstanding backlog added to the pace each second. */
const CATCH_UP = 0.4;

export function useSmoothText(target: string): string {
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);

  useEffect(() => {
    // Someone who asked for less motion wants the text, not the performance.
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      shownRef.current = target;
      setShown(target);
      return;
    }

    // A new turn, or a stream reset: start over rather than appending to stale text.
    if (!target.startsWith(shownRef.current)) {
      shownRef.current = "";
      setShown("");
    }

    let frame = 0;
    let last = performance.now();
    let carry = 0;

    const step = (now: number) => {
      const current = shownRef.current;
      if (current.length >= target.length) return;

      // Clamp dt so a backgrounded tab doesn't return and dump the whole backlog at once.
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      const hidden = target.length - current.length;
      const cps = Math.min(MAX_CPS, BASE_CPS + hidden * CATCH_UP);

      carry += cps * dt;
      const add = Math.floor(carry);
      if (add > 0) {
        carry -= add;
        const next = target.slice(0, current.length + add);
        shownRef.current = next;
        setShown(next);
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return target === "" ? "" : shown;
}
