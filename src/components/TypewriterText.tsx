"use client";

import { useEffect, useState } from "react";

type Phase = "typing" | "holding" | "deleting";

export default function TypewriterText({
  phrases,
  typeMs = 70,
  deleteMs = 32,
  holdMs = 2000,
}: {
  phrases: string[];
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
}) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    const current = phrases[i];
    let t: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < current.length) {
        t = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          typeMs,
        );
      } else {
        t = setTimeout(() => setPhase("holding"), holdMs);
      }
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("deleting"), holdMs);
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText(text.slice(0, -1)), deleteMs);
      } else {
        // Walk the phrases in order; loop back to the start at the end.
        setI((curr) => (curr + 1) % phrases.length);
        setPhase("typing");
        return;
      }
    }

    return () => clearTimeout(t);
  }, [text, phase, i, phrases, typeMs, deleteMs, holdMs]);

  return (
    <span className="typewriter" aria-live="polite">
      <span className="typewriter__text">{text}</span>
      <span className="typewriter__caret" aria-hidden="true" />
    </span>
  );
}
