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
  invisible: { rest: 2000, reveal: 2400 },
  uncertain: { rest: 1700, reveal: 3200 },
  unwritten: { rest: 700, reveal: 4000 },
};

// How long after the last interaction the auto-cycle resumes.
const RESUME_IDLE_MS = 5000;

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
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Manual hover/leave behaviour. Stops auto-cycle on enter; schedules a
  // resume after RESUME_IDLE_MS of no interaction following a leave.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const clearSwap = () => {
      if (swapTimerRef.current) {
        clearTimeout(swapTimerRef.current);
        swapTimerRef.current = null;
      }
    };
    const clearResume = () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = null;
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
      // First user interaction interrupts the auto-cycle; resume timer paused.
      setAutoMode(false);
      setForced(false);
      clearSwap();
      clearResume();
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

        // Resume the auto-cycle after some idle time with no interaction.
        clearResume();
        resumeTimerRef.current = setTimeout(() => {
          setAutoMode(true);
          resumeTimerRef.current = null;
        }, RESUME_IDLE_MS);
      }
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", setCursor);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      clearSwap();
      clearResume();
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", setCursor);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // Auto-cycle: rest → force-reveal → fade → swap → next word, calmly looping.
  useEffect(() => {
    if (!autoMode) return;
    const el = ref.current;
    if (!el) return;

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

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
        // Auto reveals always centre the cursor variables — fog blooms from
        // the middle of the word.
        el.style.setProperty("--mx", "50%");
        el.style.setProperty("--my", "50%");
        setForced(true);
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
