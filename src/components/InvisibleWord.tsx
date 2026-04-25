"use client";

import { useEffect, useRef, useState } from "react";
import UncertainGlitch from "./UncertainGlitch";

type WordState = "invisible" | "uncertain" | "unwritten";

const FLOW: Record<WordState, WordState> = {
  invisible: "uncertain",
  uncertain: "unwritten",
  unwritten: "invisible",
};

export default function InvisibleWord() {
  const ref = useRef<HTMLSpanElement>(null);
  const [word, setWord] = useState<WordState>("invisible");
  const [forced, setForced] = useState(false);
  // Set on mouseleave (after a real hover); the next mouseenter consumes it
  // and advances the cycle. No auto-timers — every transition needs a hover.
  const pendingAdvanceRef = useRef(false);
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
      setCursor(e);
      // If the user previously hovered & left, advance to the next word now,
      // before the new state's hover effect plays.
      if (pendingAdvanceRef.current) {
        pendingAdvanceRef.current = false;
        setWord((curr) => FLOW[curr]);
      }
      hasHoveredRef.current = true;
    };

    const onLeave = () => {
      if (hasHoveredRef.current) {
        hasHoveredRef.current = false;
        pendingAdvanceRef.current = true;
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
