"use client";

import { useEffect, useState } from "react";

type Phase = "typing" | "holding" | "deleting";

export default function RotatingWord({
  words,
  typeMs = 85,
  deleteMs = 40,
  holdMs = 1400,
  onChange,
}: {
  words: string[];
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  onChange?: (word: string) => void;
}) {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    onChange?.(words[i]);
  }, [i, words, onChange]);

  useEffect(() => {
    const current = words[i];
    let t: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < current.length) {
        t = setTimeout(() => setText(current.slice(0, text.length + 1)), typeMs);
      } else {
        t = setTimeout(() => setPhase("holding"), holdMs);
      }
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("deleting"), holdMs);
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText(text.slice(0, -1)), deleteMs);
      } else {
        // Pick a random next word different from the current one
        let next = i;
        if (words.length > 1) {
          while (next === i) {
            next = Math.floor(Math.random() * words.length);
          }
        }
        setI(next);
        setPhase("typing");
        return;
      }
    }

    return () => clearTimeout(t);
  }, [text, phase, i, words, typeMs, deleteMs, holdMs]);

  return (
    <span className="rotating-word" aria-live="polite">
      <span className="rotating-word__text">{text}</span>
      <span className="rotating-word__caret" aria-hidden="true" />
      <span className="rotating-word__text" aria-hidden="true">?</span>
    </span>
  );
}
