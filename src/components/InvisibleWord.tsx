"use client";

import { useEffect, useRef, useState } from "react";

export default function InvisibleWord({ word = "invisible" }: { word?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [forced, setForced] = useState(false);

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

    el.addEventListener("mouseenter", setCursor);
    el.addEventListener("mousemove", setCursor);
    return () => {
      el.removeEventListener("mouseenter", setCursor);
      el.removeEventListener("mousemove", setCursor);
    };
  }, []);

  return (
    <span
      ref={ref}
      className={"invisible-word" + (forced ? " force-reveal" : "")}
      onClick={() => setForced((v) => !v)}
    >
      <span className="ghost">{word}</span>
      <span className="outline" aria-hidden="true">
        {word}
      </span>
      <span className="hint-underline" />
      <span className="scaffold">
        <span className="bracket tl" />
        <span className="bracket tr" />
        <span className="bracket bl" />
        <span className="bracket br" />
      </span>
    </span>
  );
}
