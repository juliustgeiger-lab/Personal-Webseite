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

// How long after the last interaction the auto-cycle resumes.
const RESUME_IDLE_MS = 5000;

// Map progress through the invisible reveal (0..1) to a (--mx, --my) pair.
// Simulates a ghost cursor entering from off-screen left, hovering near the
// middle of the word, then drifting off to the right — partial reveals so the
// user gets curious and tries to see the full word themselves.
function ghostCursorAt(t: number): [number, number] {
  if (t <= 0) return [-50, 50];
  if (t < 0.28) {
    const local = t / 0.28;
    const eased = 1 - Math.pow(1 - local, 3); // ease-out
    return [-50 + (40 - -50) * eased, 50];
  }
  if (t < 0.7) {
    const local = (t - 0.28) / 0.42;
    // Tiny breathing drift while "hovering"
    const dx = Math.sin(local * Math.PI * 2) * 5;
    const dy = Math.cos(local * Math.PI * 2) * 4;
    return [40 + dx, 50 + dy];
  }
  if (t < 1) {
    const local = (t - 0.7) / 0.3;
    const eased = local * local * local; // ease-in
    return [40 + (150 - 40) * eased, 50];
  }
  return [150, 50];
}

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
    let raf = 0;

    const schedule = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(t);
    };

    const animateGhost = (durationMs: number) => {
      const start = performance.now();
      const tick = (now: number) => {
        if (cancelled) return;
        const t = Math.min((now - start) / durationMs, 1);
        const [mx, my] = ghostCursorAt(t);
        el.style.setProperty("--mx", `${mx}%`);
        el.style.setProperty("--my", `${my}%`);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const runStep = (current: InvisibleWordState) => {
      if (cancelled) return;
      setWord(current);
      setForced(false);
      const { rest, reveal } = AUTO_PHASES[current];

      schedule(() => {
        if (cancelled) return;
        // Reveal phase
        if (current === "invisible") {
          // Start fully off-screen so the reveal builds in, then animate.
          el.style.setProperty("--mx", "-50%");
          el.style.setProperty("--my", "50%");
          animateGhost(reveal);
        } else {
          // Centre the (unused) cursor variables for other states.
          el.style.setProperty("--mx", "50%");
          el.style.setProperty("--my", "50%");
        }
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
      if (raf) cancelAnimationFrame(raf);
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
