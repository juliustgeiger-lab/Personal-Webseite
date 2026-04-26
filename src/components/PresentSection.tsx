"use client";

import { useEffect, useRef, useState } from "react";

const VIEW_W = 760;
// viewBox aspect must match the rendered CSS aspect (760×280) — otherwise
// preserveAspectRatio="none" stretches the aura circles into ovals.
const VIEW_H = 280;
// NOW dead-centre on the canvas. Past arrives from the left, future side is
// equally empty on the right — the moment is the focal point.
const NOW_X = VIEW_W / 2;
const NOW_Y = VIEW_H / 2;

const QUESTIONS = [
  "Propose or stop wasting their time?",
  "Have the hard conversation or let it slide?",
  "Stay in the relationship or leave?",
  "Keep fighting or admit defeat?",
  "Say what you feel or keep the peace?",
  "Tell them about it or take it to the grave?",
  "Take the buyout or keep building?",
  "Stay in corporate or chase the dream?",
  "Buy the company or watch someone else buy it?",
  "Pivot or persist?",
  "Stay loyal or take the better offer?",
  "Cut your losses or double down?",
  "Sell now or hold through the dip?",
  "Bail them out again or let them fail?",
  "Pull the plug or hold on a little longer?",
  "Get the genetic test or keep not knowing?",
  "Have a kid now or keep pursuing the career?",
];

const QUESTION_DISPLAY_MS = 4800;
const QUESTION_FADE_MS = 380;

// Once the section first enters the viewport, the very first question swap
// fires fast — so the user immediately notices the questions are cycling and
// doesn't scroll past assuming the bubble is static.
const FIRST_CHANGE_MS = 1300;

// Fisher–Yates shuffle of [0..n-1].
function shuffledIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function PresentSection() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionVisible, setQuestionVisible] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Shuffled deck pattern: walk through the full set in a random order, then
  // reshuffle once exhausted. No question repeats until every other has shown.
  const orderRef = useRef<number[]>([]);
  const posRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);

  // Initial shuffle on mount, replacing the SSR-rendered first question.
  useEffect(() => {
    const initial = shuffledIndices(QUESTIONS.length);
    orderRef.current = initial;
    posRef.current = 0;
    setQuestionIndex(initial[0]);
  }, []);

  // Don't begin cycling until the section actually enters the viewport, so
  // that a user scrolling here for the first time gets a fast first swap
  // (and not a question that's already half-decayed by the time they look).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || hasStarted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasStarted]);

  // Question rotation: first swap fires fast (FIRST_CHANGE_MS) so the user
  // notices the questions cycle, then settles into the regular cadence.
  useEffect(() => {
    if (!hasStarted) return;

    let pending: ReturnType<typeof setTimeout> | null = null;
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    let isFirst = true;

    const advance = () => {
      setQuestionVisible(false);
      fadeTimer = setTimeout(() => {
        let nextPos = posRef.current + 1;
        if (nextPos >= orderRef.current.length) {
          const lastShown = orderRef.current[orderRef.current.length - 1];
          const fresh = shuffledIndices(QUESTIONS.length);
          if (fresh.length > 1 && fresh[0] === lastShown) {
            [fresh[0], fresh[1]] = [fresh[1], fresh[0]];
          }
          orderRef.current = fresh;
          nextPos = 0;
        }
        posRef.current = nextPos;
        setQuestionIndex(orderRef.current[nextPos]);
        setQuestionVisible(true);
        schedule();
      }, QUESTION_FADE_MS);
    };

    const schedule = () => {
      const delay = isFirst
        ? FIRST_CHANGE_MS
        : QUESTION_DISPLAY_MS + QUESTION_FADE_MS;
      isFirst = false;
      pending = setTimeout(advance, delay);
    };

    schedule();

    return () => {
      if (pending) clearTimeout(pending);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [hasStarted]);

  const dotLeftPct = (NOW_X / VIEW_W) * 100;
  const dotTopPct = (NOW_Y / VIEW_H) * 100;

  return (
    <section className="present" ref={sectionRef}>
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
          {/* Hidden measurement so the bubble is always sized to the longest
              question — keeps every question on a single line, no width jumps
              when shorter questions cycle in. */}
          <span className="present-bubble__measure" aria-hidden="true">
            Buy the company or watch someone else buy it?
          </span>
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
