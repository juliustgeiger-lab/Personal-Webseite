"use client";

import { useState } from "react";
import RotatingWord from "./RotatingWord";
import MonteCarloChart from "./MonteCarloChart";

const WORDS = [
  "exceptional",
  "great",
  "good",
  "acceptable",
  "ok",
  "mediocre",
  "regrettable",
  "catastrophic",
];

export default function FuturesSection() {
  const [word, setWord] = useState<string>(WORDS[0]);

  return (
    <section className="futures">
      <h2 className="futures-headline">
        In how many futures are your <em className="emph">decisions</em>{" "}
        <RotatingWord words={WORDS} onChange={setWord} />
      </h2>
      <MonteCarloChart activeWord={word} />
    </section>
  );
}
