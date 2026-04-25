"use client";

import { useEffect, useState } from "react";

const N_PATHS = 7;
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
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionVisible, setQuestionVisible] = useState(true);

  // Question rotation: fade out, swap, fade back in.
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

  // Each question (= a decision) maps deterministically to one branch.
  // ×3 mod 7 walks all paths in pseudo-random order, so consecutive questions
  // never light up the same path twice in a row.
  const decidedPath = (questionIndex * 3) % N_PATHS;
  const decidedEndY = branches[decidedPath].endY;

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

          {/* Static fan of possible futures (faint) */}
          {branches.map((b, i) => (
            <g key={i}>
              <path d={b.d} className="present-path" />
              <circle cx={END_X} cy={b.endY} r={3} className="present-end" />
            </g>
          ))}

          {/* The decided path — drawn fresh each time the question changes.
              Different question → different path → different future endpoint. */}
          <g key={`decided-${questionIndex}`}>
            <path d={branches[decidedPath].d} className="present-decided-path" />
            <circle
              cx={END_X}
              cy={decidedEndY}
              r={4.5}
              className="present-decided-end"
            />
          </g>

          {/* NOW — dot + two ripples synced to question changes (key change
              forces fresh animation on each new decision). */}
          <g transform={`translate(${START_X} ${START_Y})`}>
            <circle
              key={`pulse-a-${questionIndex}`}
              cx={0}
              cy={0}
              r={20}
              className="present-pulse"
            />
            <circle
              key={`pulse-b-${questionIndex}`}
              cx={0}
              cy={0}
              r={20}
              className="present-pulse present-pulse--delayed"
            />
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
