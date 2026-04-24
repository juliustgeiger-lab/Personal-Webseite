"use client";

import { useEffect, useState } from "react";

const N_PATHS = 7;
const ROTATE_MS = 2000;
const VIEW_W = 760;
const VIEW_H = 320;
const START_X = 220;
const START_Y = 160;
const END_X = 720;
const SPREAD = 220;

function forkPath(sx: number, sy: number, ex: number, ey: number): string {
  const mid = (ex - sx) * 0.45;
  return `M ${sx} ${sy} C ${sx + mid} ${sy}, ${ex - mid} ${ey}, ${ex} ${ey}`;
}

export default function PresentSection() {
  const [active, setActive] = useState<number>(Math.floor(N_PATHS / 2));

  useEffect(() => {
    const id = setInterval(() => {
      setActive((curr) => {
        let next = curr;
        while (next === curr) {
          next = Math.floor(Math.random() * N_PATHS);
        }
        return next;
      });
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const branches = Array.from({ length: N_PATHS }, (_, i) => {
    const frac = i / (N_PATHS - 1);
    const endY = START_Y - SPREAD / 2 + SPREAD * frac;
    return { d: forkPath(START_X, START_Y, END_X, endY), endY };
  });

  return (
    <section className="present">
      <h2 className="present-headline">
        The present <em className="emph">demands</em> decisions.
      </h2>

      <svg
        className="present-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Past — single incoming line */}
        <line
          x1={0}
          y1={START_Y}
          x2={START_X}
          y2={START_Y}
          className="present-line"
        />

        {/* Future branches */}
        {branches.map((b, i) => (
          <g
            key={i}
            className={"present-branch" + (i === active ? " present-branch--on" : "")}
          >
            <path d={b.d} className="present-path" />
            <circle cx={END_X} cy={b.endY} r={3} className="present-end" />
          </g>
        ))}

        {/* NOW — pulsing dot */}
        <g transform={`translate(${START_X} ${START_Y})`}>
          <circle cx={0} cy={0} r={20} className="present-pulse" />
          <circle cx={0} cy={0} r={5.5} className="present-dot" />
        </g>
      </svg>
    </section>
  );
}
