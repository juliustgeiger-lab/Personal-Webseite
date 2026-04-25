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

// Questions cycle through chat-bubble style above the NOW dot. Esther-Perel-
// flavoured: relational, value-laden, slightly probing. No typewriter — each
// fades out, swaps, fades back in.
const QUESTIONS = [
  "What would you still own if the market closed for ten years?",
  "Are you committed to your partner — or to the story of being committed?",
  "Whose approval are you still working for?",
  "What part of yourself do you hide from the people you love?",
  "Is this the work you'd do if no one were watching?",
  "What did your parents teach you about love that you're still unlearning?",
  "When was the last time you felt truly seen?",
  "What are you postponing because it would change you?",
  "What lie do you tell yourself most often?",
  "Where do you feel most yourself?",
  "Is the next dollar worth what it will cost you to earn it?",
  "Whose voice plays in your head when you make a hard decision?",
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
