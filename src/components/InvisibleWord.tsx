"use client";

import { useEffect, useRef, useState } from "react";

// Must match the fog-reveal opacity transition duration in globals.css so the
// outline fully fades back out before we swap the word — otherwise the alt word
// (rendered with different, solid styles) flashes briefly during the fade.
const SWAP_DELAY_MS = 560;

export default function InvisibleWord({
  initialWord = "invisible",
  altWord = "uncertain",
}: {
  initialWord?: string;
  altWord?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [word, setWord] = useState(initialWord);
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
      // If the user re-enters during the fade, cancel the pending swap.
      clearSwap();
      setCursor(e);
    };

    const onLeave = () => {
      // After the user has hovered once and fully left, schedule the swap so the
      // fog reveal has time to fade out completely. A re-enter cancels it.
      if (hasHoveredRef.current && word === initialWord) {
        clearSwap();
        swapTimerRef.current = setTimeout(() => {
          setWord(altWord);
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
  }, [word, initialWord, altWord]);

  const isGlitch = word !== initialWord;

  return (
    <span
      ref={ref}
      className={
        "invisible-word" +
        (forced ? " force-reveal" : "") +
        (isGlitch ? " invisible-word--glitch" : "")
      }
      onClick={() => setForced((v) => !v)}
    >
      <span className="ghost">{word}</span>
      {/* Colored offset layers — only visible in glitch mode */}
      <span className="outline-glitch outline-glitch--r" aria-hidden="true">
        {word}
      </span>
      <span className="outline-glitch outline-glitch--c" aria-hidden="true">
        {word}
      </span>
      {/* Main letterform: fog-glass by default, ink + shake in glitch mode */}
      <span className="outline" aria-hidden="true">
        {word}
      </span>
      <span className="scaffold">
        <span className="bracket tl" />
        <span className="bracket tr" />
        <span className="bracket bl" />
        <span className="bracket br" />
      </span>
    </span>
  );
}
