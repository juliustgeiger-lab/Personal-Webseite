"use client";

import { useEffect, useState } from "react";

const VIEW_W = 760;
// viewBox aspect must match the rendered CSS aspect (760×280) — otherwise
// preserveAspectRatio="none" stretches the aura circles into ovals.
const VIEW_H = 280;
// NOW sits slightly left of center: past on the left compresses, future on
// the right opens up empty — the decision is here, the outcome isn't shown.
const NOW_X = 280;
const NOW_Y = 140;

const QUESTIONS = [
  "Propose or break up?",
  "Have the hard conversation tonight or let it slide?",
  "Stay in the relationship or leave?",
  "Fight for it or admit it's over?",
  "Say what you really feel or keep the peace?",
  "Tell them about it or take it to the grave?",
  "Marry the safe one or wait for the one who really excites you?",
  "Take the buyout or keep building?",
  "Stay in the corporate job or chase the dream?",
  "Buy the company or watch someone else buy it?",
  "Pivot or persist?",
  "Stay loyal or take the better offer?",
  "Cut your losses or double down?",
  "Sell now or hold through the dip?",
  "Bail them out again or let them fall?",
  "Pull the plug or hold on a little longer?",
  "Get tested or keep not knowing?",
  "Have a kid now or pursue the career?",
];

const QUESTION_DISPLAY_MS = 4800;
const QUESTION_FADE_MS = 380;

export default function PresentSection() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionVisible, setQuestionVisible] = useState(true);

  // Question rotation: fade out, swap, fade back in.
  useEffect(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    const interval = setInterval(() => {
      setQuestionVisible(false);
      fadeTimer = setTimeout(() => {
        setQuestionIndex((i) => {
          // Pick a random next question different from the current one.
          let next = i;
          if (QUESTIONS.length > 1) {
            while (next === i) {
              next = Math.floor(Math.random() * QUESTIONS.length);
            }
          }
          return next;
        });
        setQuestionVisible(true);
      }, QUESTION_FADE_MS);
    }, QUESTION_DISPLAY_MS + QUESTION_FADE_MS);
    return () => {
      clearInterval(interval);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, []);

  const dotLeftPct = (NOW_X / VIEW_W) * 100;
  const dotTopPct = (NOW_Y / VIEW_H) * 100;

  return (
    <section className="present">
      <h2 className="present-headline">
        <span className="present-headline__lead">But…</span>
        The present <em className="emph">demands</em> decisions.
      </h2>

      <div className="present-canvas">
        <svg
          className="present-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Past — a clear, single line arriving at NOW. The future side
              of the canvas is intentionally empty. */}
          <line
            x1={0}
            y1={NOW_Y}
            x2={NOW_X - 14}
            y2={NOW_Y}
            className="present-past-line"
          />

          {/* Aura — three concentric breathing rings centred on NOW.
              They give the moment weight without pointing anywhere. */}
          <g transform={`translate(${NOW_X} ${NOW_Y})`}>
            <circle cx={0} cy={0} r={108} className="present-aura present-aura--outer" />
            <circle cx={0} cy={0} r={68} className="present-aura present-aura--mid" />
            <circle cx={0} cy={0} r={36} className="present-aura present-aura--inner" />
          </g>

          {/* NOW — pulsing ripples (synced to questions) and the solid dot */}
          <g transform={`translate(${NOW_X} ${NOW_Y})`}>
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
