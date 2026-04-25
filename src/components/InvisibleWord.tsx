"use client";

import { useEffect, useRef, useState } from "react";
import UncertainGlitch from "./UncertainGlitch";

type WordState = "invisible" | "uncertain" | "unwritten";

const FLOW: Record<WordState, WordState> = {
  invisible: "uncertain",
  uncertain: "unwritten",
  unwritten: "invisible",
};

// Long enough for the previous state's fade-out to complete before swapping in
// the next word. The fog fade is ~520ms; handwrite ends at opacity 0 already.
const SWAP_DELAY_MS = 560;

export default function InvisibleWord() {
  const ref = useRef<HTMLSpanElement>(null);
  const [word, setWord] = useState<WordState>("invisible");
  const [forced, setForced] = useState(false);
  const hasHoveredRef = useRef(false);
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // Cancel a pending swap if the user re-enters before it fires.
      clearSwap();
      setCursor(e);
    };

    const onLeave = () => {
      if (hasHoveredRef.current) {
        hasHoveredRef.current = false;
        clearSwap();
        // Wait for the current state's fade to finish before swapping in the
        // next word — otherwise the new word (with different styles) flashes.
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
      onClick={() => setForced((v) => !v)}
    >
      {word === "uncertain" ? (
        <UncertainGlitch text={word} />
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
