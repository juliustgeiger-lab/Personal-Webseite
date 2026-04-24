"use client";

import { useEffect, useRef, useState } from "react";

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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setCursor = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 100;
      const py = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mx", px + "%");
      el.style.setProperty("--my", py + "%");
    };

    const onEnter = (e: MouseEvent) => {
      hasHoveredRef.current = true;
      setCursor(e);
    };

    const onLeave = () => {
      // After the user has hovered once and fully left, swap the initial word
      // for the alt word. The next hover reveals it with the glitch effect.
      if (hasHoveredRef.current && word === initialWord) {
        setWord(altWord);
      }
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", setCursor);
    el.addEventListener("mouseleave", onLeave);
    return () => {
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
