"use client";

import { useMemo, useState } from "react";

const N_PATHS = 100;
const T_STEPS = 50;
const WIDTH = 1000;
const HEIGHT = 360;
const MID = HEIGHT / 2;
const STEP_SIGMA = 5;

type Band = { start: number; end: number }; // 1-indexed rank bounds, inclusive

const BAND_BY_WORD: Record<string, Band> = {
  catastrophic: { start: 1, end: 7 },
  regrettable: { start: 8, end: 27 },
  ok: { start: 26, end: 75 },
  exceptional: { start: 92, end: 100 },
};

const CAPTION_BY_WORD: Record<string, (n: number) => string> = {
  catastrophic: (n) => `${n} of 100 futures end in ruin`,
  regrettable: (n) => `${n} of 100 futures are regrettable`,
  ok: (n) => `${n} of 100 futures are ok`,
  exceptional: (n) => `${n} of 100 futures are exceptional`,
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
      // Box-Muller → unit normal
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

export default function MonteCarloChart({ activeWord }: { activeWord: string }) {
  const [seed, setSeed] = useState(42);

  const trajectories = useMemo(() => generateTrajectories(seed), [seed]);

  // Rank each trajectory 1..N by its final y ascending (rank 1 = lowest final, worst outcome).
  const ranks = useMemo(() => {
    const indexed = trajectories.map((ys, idx) => ({ idx, final: ys[ys.length - 1] }));
    indexed.sort((a, b) => a.final - b.final);
    const out = new Array<number>(N_PATHS);
    indexed.forEach((item, i) => {
      out[item.idx] = i + 1;
    });
    return out;
  }, [trajectories]);

  const pathsD = useMemo(() => trajectories.map(buildPathD), [trajectories]);

  const band = BAND_BY_WORD[activeWord];
  const count = band ? band.end - band.start + 1 : 0;
  const caption = CAPTION_BY_WORD[activeWord]?.(count) ?? `${count} of 100 futures`;

  return (
    <div className="mc-chart">
      <svg
        className="mc-chart__svg"
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
              className={"mc-path" + (on ? " mc-path--on" : "")}
            />
          );
        })}
        <circle cx={0} cy={MID} r={5} className="mc-chart__start" />
      </svg>

      <div className="mc-chart__axis">
        <span className="mono-up">NOW</span>
        <span className="mono-up">HORIZON</span>
      </div>

      <div className="mc-chart__caption">{caption}</div>

      <button
        type="button"
        className="mc-chart__resample"
        onClick={() => setSeed((s) => s + 1)}
        aria-label="Regenerate Monte Carlo trajectories"
      >
        Resample
      </button>
    </div>
  );
}
