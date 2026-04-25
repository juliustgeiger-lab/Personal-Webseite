"use client";

import { useEffect, useMemo, useState } from "react";

// Self-contained version of the original landing-page futures animation:
// a typewriter rotating-word "In how many futures are your decisions X?" plus
// a 100-trajectory Monte Carlo whose rank-based band lights up to match the
// active word. Embedded in the futures-of-decisions blog post.

const N_PATHS = 100;
const T_STEPS = 50;
const WIDTH = 1000;
const HEIGHT = 360;
const MID = HEIGHT / 2;
const STEP_SIGMA = 5;

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

type Band = { start: number; end: number };

const BAND_BY_WORD: Record<string, Band> = {
  catastrophic: { start: 1, end: 7 },
  regrettable: { start: 8, end: 27 },
  mediocre: { start: 25, end: 45 },
  ok: { start: 26, end: 75 },
  acceptable: { start: 40, end: 65 },
  good: { start: 55, end: 80 },
  great: { start: 76, end: 92 },
  exceptional: { start: 92, end: 100 },
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateTrajectories(seed: number): number[][] {
  const rand = mulberry32(seed);
  const paths: number[][] = [];
  for (let p = 0; p < N_PATHS; p++) {
    const ys: number[] = [MID];
    let y = MID;
    for (let t = 1; t <= T_STEPS; t++) {
      const u1 = Math.max(rand(), 1e-10);
      const u2 = rand();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      y += z * STEP_SIGMA;
      ys.push(y);
    }
    paths.push(ys);
  }
  return paths;
}

function buildPathD(ys: number[]): string {
  const stepX = WIDTH / T_STEPS;
  let d = `M 0 ${ys[0].toFixed(2)}`;
  for (let t = 1; t < ys.length; t++) {
    d += ` L ${(t * stepX).toFixed(2)} ${ys[t].toFixed(2)}`;
  }
  return d;
}

const TYPE_MS = 85;
const DELETE_MS = 40;
const HOLD_MS = 1400;

type Phase = "typing" | "holding" | "deleting";

export default function FuturesSimulation() {
  const [seed, setSeed] = useState(42);
  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  // Typewriter cycle through the rotating word
  useEffect(() => {
    const current = WORDS[wordIndex];
    let t: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < current.length) {
        t = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          TYPE_MS,
        );
      } else {
        t = setTimeout(() => setPhase("holding"), HOLD_MS);
      }
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("deleting"), HOLD_MS);
    } else {
      if (text.length > 0) {
        t = setTimeout(() => setText(text.slice(0, -1)), DELETE_MS);
      } else {
        let next = wordIndex;
        if (WORDS.length > 1) {
          while (next === wordIndex) {
            next = Math.floor(Math.random() * WORDS.length);
          }
        }
        setWordIndex(next);
        setPhase("typing");
        return;
      }
    }

    return () => clearTimeout(t);
  }, [text, phase, wordIndex]);

  const trajectories = useMemo(() => generateTrajectories(seed), [seed]);

  // Rank by final y descending — largest final y (bottom of chart) = rank 1 =
  // catastrophic. Positive outcomes end at the top.
  const ranks = useMemo(() => {
    const indexed = trajectories.map((ys, idx) => ({
      idx,
      final: ys[ys.length - 1],
    }));
    indexed.sort((a, b) => b.final - a.final);
    const out = new Array<number>(N_PATHS);
    indexed.forEach((item, i) => {
      out[item.idx] = i + 1;
    });
    return out;
  }, [trajectories]);

  const pathsD = useMemo(() => trajectories.map(buildPathD), [trajectories]);

  const activeWord = WORDS[wordIndex];
  const band = BAND_BY_WORD[activeWord];

  return (
    <div className="fs-wrap">
      <p className="fs-question">
        In how many futures are your <strong>decisions</strong>{" "}
        <span className="fs-word">
          <span className="fs-word__text">{text}</span>
          <span className="fs-word__caret" aria-hidden="true" />
          <span className="fs-word__text" aria-hidden="true">
            ?
          </span>
        </span>
      </p>

      <svg
        className="fs-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {pathsD.map((d, idx) => {
          const rank = ranks[idx];
          const on = band && rank >= band.start && rank <= band.end;
          return (
            <path
              key={idx}
              d={d}
              className={"fs-path" + (on ? " fs-path--on" : "")}
            />
          );
        })}
        <circle cx={0} cy={MID} r={5} className="fs-start" />
      </svg>

      <div className="fs-axis">
        <span className="mono-up">NOW</span>
        <span className="mono-up">HORIZON</span>
      </div>

      <button
        type="button"
        className="fs-resample"
        onClick={() => setSeed((s) => s + 1)}
        aria-label="Regenerate trajectories"
      >
        Resample
      </button>
    </div>
  );
}
