"use client";

import { useMemo } from "react";

const TOTAL = 100;

export default function MonteCarloGrid({ percent }: { percent: number }) {
  // Stable shuffled ranks 1..TOTAL. Cells with rank <= percent light up.
  const ranks = useMemo(() => {
    const arr = Array.from({ length: TOTAL }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const clamped = Math.max(0, Math.min(TOTAL, Math.round(percent)));

  return (
    <div className="mc-grid">
      <div className="mc-grid__cells" role="img" aria-label={`${clamped} of 100 futures`}>
        {ranks.map((rank, i) => (
          <span
            key={i}
            className={"mc-cell" + (rank <= clamped ? " mc-cell--on" : "")}
            style={{ transitionDelay: `${(rank % 20) * 8}ms` }}
          />
        ))}
      </div>
      <div className="mc-grid__stats">
        <span className="mono-up">{clamped} of 100 futures</span>
        <span className="mono-up mc-grid__pct">{clamped}%</span>
      </div>
    </div>
  );
}
