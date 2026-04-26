"use client";

import { useEffect, useRef, useState } from "react";
import UncertainGlitch from "./UncertainGlitch";
import UnwrittenStroke from "./UnwrittenStroke";

export type InvisibleWordState = "invisible" | "uncertain" | "unwritten";

const FLOW: Record<InvisibleWordState, InvisibleWordState> = {
  invisible: "uncertain",
  uncertain: "unwritten",
  unwritten: "invisible",
};

// Long enough for the previous state's fade to finish before the next word's
// styles take over (fog reveal fades ~520ms; handwrite ends faded already).
const SWAP_DELAY_MS = 560;

// Auto-cycle phase durations (ms). `rest` = quiet stretch where nothing is
// revealed (just the corner brackets), `reveal` = how long the force-reveal
// effect plays for that state.
const AUTO_PHASES: Record<
  InvisibleWordState,
  { rest: number; reveal: number }
> = {
  invisible: { rest: 1500, reveal: 1100 },
  uncertain: { rest: 1200, reveal: 2000 },
  unwritten: { rest: 700, reveal: 4000 },
};

export default function InvisibleWord({
  onProgress,
}: {
  // Fires when a word becomes "seen" — either via the auto-cycle reveal or a
  // real hover. Lets the parent gate things (like scroll) on progress.
  onProgress?: (word: InvisibleWordState) => void;
} = {}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [word, setWord] = useState<InvisibleWordState>("invisible");
  const [forced, setForced] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const hasHoveredRef = useRef(false);
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mirror the latest word + onProgress into refs so the listeners (attached
  // once with empty deps) always see the current values.
  const wordRef = useRef(word);
  useEffect(() => {
    wordRef.current = word;
  }, [word]);
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  // Manual hover/leave behaviour
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const clearSwap = () => {
      if (swapTimerRef.current) {
        clearTimeout(swapTimerRef.current);
        swapTimerRef.current = null;
      }
    };

    const setCursor = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", px + "%");
      el.style.setProperty("--my", py + "%");
    };

    const onEnter = (e: MouseEvent) => {
      hasHoveredRef.current = true;
      // First user interaction stops the auto-cycle.
      setAutoMode(false);
      // If the auto-cycle had us in a forced reveal, hand the visual back over
      // to CSS :hover cleanly.
      setForced(false);
      clearSwap();
      setCursor(e);
      onProgressRef.current?.(wordRef.current);
    };

    const onLeave = () => {
      // After a real hover, advance to the next word on a delay.
      if (hasHoveredRef.current) {
        hasHoveredRef.current = false;
        clearSwap();
        swapTimerRef.current = setTimeout(() => {
          setWord((curr) => FLOW[curr]);
          swapTimerRef.current = null;
        }, SWAP_DELAY_MS);
      }
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", setCursor);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      clearSwap();
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", setCursor);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Auto-cycle: rest → force-reveal → fade → swap → next word, calmly looping.
  // Cancelled the moment the user mouse-enters.
  useEffect(() => {
    if (!autoMode) return;
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // The fog mask reveals from (--mx, --my). For auto reveals we want the
    // fog to bloom from the centre of the word.
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");

    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(t);
    };

    const runStep = (current: InvisibleWordState) => {
      if (cancelled) return;
      setWord(current);
      setForced(false);
      const { rest, reveal } = AUTO_PHASES[current];

      schedule(() => {
        if (cancelled) return;
        // Reveal phase
        setForced(true);
        // Mark this word as seen (lets scroll-lock unlock without manual hover)
        onProgressRef.current?.(current);

        schedule(() => {
          if (cancelled) return;
          setForced(false);
          schedule(() => {
            runStep(FLOW[current]);
          }, SWAP_DELAY_MS);
        }, reveal);
      }, rest);
    };

    runStep(wordRef.current);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [autoMode]);

  const modeClass =
    word === "uncertain"
      ? " invisible-word--glitch"
      : word === "unwritten"
        ? " invisible-word--handwrite"
        : "";

  return (
    <span
      ref={ref}
      className={"invisible-word" + modeClass + (forced ? " force-reveal" : "")}
      onClick={() => {
        setAutoMode(false);
        setForced((v) => !v);
      }}
    >
      {word === "uncertain" ? (
        <UncertainGlitch text={word} />
      ) : word === "unwritten" ? (
        <>
          <span className="ghost">{word}</span>
          <UnwrittenStroke />
        </>
      ) : (
        <>
          <span className="ghost">{word}</span>
          <span className="outline" aria-hidden="true">
            {word}
          </span>
        </>
      )}
      <span className="scaffold">
        <span className="bracket tl" />
        <span className="bracket tr" />
        <span className="bracket bl" />
        <span className="bracket br" />
      </span>
    </span>
  );
}
