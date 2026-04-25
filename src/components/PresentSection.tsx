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

// Concrete decisions someone is actually facing — not abstract introspection.
// Mostly binary: do this or don't, take the leap or hold. Mix of investing,
// business, relationship, family, life. Cycle in chat-bubble style.
const QUESTIONS = [
  "Buy the company, or pass?",
  "Stay in the relationship, or leave?",
  "Sell now, or hold through the dip?",
  "Take the job, or turn it down?",
  "Quit the corporate job and chase the dream, or stay the course?",
  "Have the hard conversation tonight, or let it slide?",
  "Move in together, or keep your own place?",
  "Move abroad, or stay where your roots are?",
  "Have a kid now, or wait?",
  "Take the buyout, or keep building?",
  "Propose, or wait another year?",
  "Cut your losses, or double down?",
  "Tell them the truth, or protect them from it?",
  "Trade the salary for the calling, or keep both feet in?",
];

const QUESTION_DISPLAY_MS = 4800;
const QUESTION_FADE_MS = 380;

function forkPath(sx: number, sy: number, ex: number, ey: number): string {
  const mid = (ex - sx) * 0.45;
  return `M ${sx} ${sy} C ${sx + mid} ${sy}, ${ex - mid} ${ey}, ${ex} ${ey}`;
}

export default function PresentSection() {
  const [active, setActive] = useState<number>(Math.floor(N_PATHS / 2));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionVisible, setQuestionVisible] = useState(true);

  // Branch rotation
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

  // Question rotation: fade out, swap, fade back in
  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      setQuestionVisible(false);
      fadeTimer = setTimeout(() => {
        setQuestionIndex((i) => (i + 1) % QUESTIONS.length);
        setQuestionVisible(true);
      }, QUESTION_FADE_MS);
    }, QUESTION_DISPLAY_MS + QUESTION_FADE_MS);
    return () => {
      clearInterval(interval);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []);

  const branches = Array.from({ length: N_PATHS }, (_, i) => {
    const frac = i / (N_PATHS - 1);
    const endY = START_Y - SPREAD / 2 + SPREAD * frac;
    return { d: forkPath(START_X, START_Y, END_X, endY), endY };
  });

  // Position the bubble's anchor over the NOW dot. Because the SVG uses
  // preserveAspectRatio="none", the dot's pixel position scales linearly with
  // the SVG's CSS dimensions — so we can express it as a percentage.
  const dotLeftPct = (START_X / VIEW_W) * 100;
  const dotTopPct = (START_Y / VIEW_H) * 100;

  return (
    <section className="present">
      <h2 className="present-headline">
        <span className="present-headline__lead">Yet…</span>
        The present <em className="emph">demands</em> decisions.
      </h2>

      <div className="present-canvas">
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

        <div
          className="present-bubble"
          style={{ left: `${dotLeftPct}%`, top: `${dotTopPct}%` }}
        >
          <p
            className="present-bubble__text"
            style={{
              opacity: questionVisible ? 1 : 0,
              transition: `opacity ${QUESTION_FADE_MS}ms ease`,
            }}
          >
            {QUESTIONS[questionIndex]}
          </p>
        </div>
      </div>
    </section>
  );
}
