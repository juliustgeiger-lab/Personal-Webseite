"use client";

import { useMemo } from "react";
import TypewriterText from "./TypewriterText";

const ENDINGS = [
  "the face of uncertainty.",
  "many parallel universes.",
  "futures we didn't predict.",
  "systems we don't control.",
  "the tails of distributions.",
];

const VIEW_W = 760;
const VIEW_H = 300;
const START_X = 70;
const END_X = 720;
const START_Y = 200;
const PERFORM_TARGET = 90; // upper region — "performing" outcomes
const N_THREADS = 9;
const STEPS = 70;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ManyWorldsSection() {
  // Each thread is one possible world. Same starting decision; bounded
  // random walks with a gentle pull toward the "performing" target so most
  // threads land above the start line — different paths, similar quality.
  const threads = useMemo(() => {
    const rand = mulberry32(11);
    const stepX = (END_X - START_X) / STEPS;
    const out: string[] = [];
    for (let t = 0; t < N_THREADS; t++) {
      let y = START_Y;
      let d = `M ${START_X.toFixed(2)} ${y.toFixed(2)}`;
      for (let i = 1; i <= STEPS; i++) {
        // Box-Muller for unit normal
        const u1 = Math.max(rand(), 1e-10);
        const u2 = rand();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        y += z * 2.4;
        // Soft mean-reversion toward the performing target
        y += (PERFORM_TARGET - y) * 0.045;
        d += ` L ${(START_X + i * stepX).toFixed(2)} ${y.toFixed(2)}`;
      }
      out.push(d);
    }
    return out;
  }, []);

  return (
    <section className="many-worlds">
      <h2 className="many-worlds-headline">
        <span className="many-worlds-headline__lead">Yet…</span>
        Some decisions <em className="emph">perform</em> in
        <br />
        <TypewriterText phrases={ENDINGS} />
      </h2>

      <svg
        className="many-worlds-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {threads.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={100}
            className="mw-thread"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
        <circle cx={START_X} cy={START_Y} r={5.5} className="mw-decision-dot" />
      </svg>
    </section>
  );
}
