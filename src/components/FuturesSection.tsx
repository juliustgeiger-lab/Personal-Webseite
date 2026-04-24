"use client";

import { useState } from "react";
import RotatingWord from "./RotatingWord";
import MonteCarloGrid from "./MonteCarloGrid";

const WORDS = ["great", "exceptional", "ok", "acceptable", "regrettable", "catastrophic"];

const PERCENT_BY_WORD: Record<string, number> = {
  great: 18,
  exceptional: 5,
  ok: 42,
  acceptable: 68,
  regrettable: 20,
  catastrophic: 3,
};

export default function FuturesSection() {
  const [word, setWord] = useState<string>(WORDS[0]);
  const percent = PERCENT_BY_WORD[word] ?? 0;

  return (
    <section className="futures">
      <h2 className="futures-headline">
        In how many futures are your <em className="emph">decisions</em>{" "}
        <RotatingWord words={WORDS} onChange={setWord} />
      </h2>
      <MonteCarloGrid percent={percent} />
    </section>
  );
}
