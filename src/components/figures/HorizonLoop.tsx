"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HorizonLoop — causal view, shock-driven.
 *
 * Reading the figure:
 *
 *   - Decision Strategy (left): single ink dot with breathing aura. Quiet
 *     node, not a box. Echoes PresentSection's living-moment dot.
 *
 *   - Time horizon (right): TWO parallel lines, tight gap.
 *       · Top    — solid line, ACTUAL (a single solid tick).
 *       · Bottom — dashed line, EXPECTED (a hollow tick).
 *
 *   - Two flows between them:
 *       · INFORMS    — dashed ink curve, Expected → Strategy (lit pulse
 *                      travels along it whenever a new shock arrives).
 *       · INFLUENCES — solid blue curve, Strategy → Actual (a fresh arrow
 *                      shoots out each cycle to wherever Actual now lands;
 *                      previous arrows linger and fade as a trail).
 *
 * Cycle (every ~3.2s):
 *
 *   1. A shock pulse expands out of the Expected pin — new information has
 *      arrived. (We don't actually know the actual horizon. The expected
 *      one is what gets revised in real time.)
 *   2. The Expected pin drifts smoothly to a new position.
 *   3. A traveling pulse runs along the Informs arc from Expected →
 *      Strategy (the new info reaching the strategy).
 *   4. The Strategy aura fires an extra pulse (recalibrating).
 *   5. A new Influences arrow shoots from Strategy to where Actual now is
 *      — sometimes shorter than Expected, sometimes longer, sometimes
 *      close.
 *   6. The Actual pin slides to where the arrow landed.
 *   7. Past arrows fade as faint ghosts so the trail of "shots at the
 *      moving target" stays visible for a beat.
 *
 * Visual grammar: hairline strokes, fountain-pen blue for things in motion,
 * mono caps for labels. Respects prefers-reduced-motion.
 */

const VIEW_W = 760;
const VIEW_H = 220;

// Strategy node
const STRAT_X = 130;
const STRAT_Y = 110;

// Two parallel time-horizon lines — tight gap (24px).
const LINE_X1 = 300;
const LINE_X2 = 720;
const LINE_W = LINE_X2 - LINE_X1;
const ACTUAL_Y = 100;
const EXPECTED_Y = 124;

// Cycle timing — each beat gets room to land before the next one fires.
const CYCLE_MS = 5500;
const PHASE = {
  shockPulse:    [0,    1100],  // ring expands out of Expected pin
  expectedShift: [300,  1700],  // pin slides to new position
  informsTravel: [1100, 2500],  // traveling pulse along the informs arc
  strategyPulse: [2300, 3100],  // extra ring on the strategy aura
  influencesShoot:[2900, 3700], // new arrow draws from Strategy to Actual
  actualShift:   [3400, 4000],  // actual pin slides to landing point
  // Then ~1.5s hold before the next shock arrives.
} as const;
const GHOST_FADE_START_MS = 800;  // delay before ghost begins fading
const GHOST_FADE_LEN_MS = 3600;   // fade duration

// Bounds for randomly chosen Expected and Actual positions per cycle
const E_MIN = 0.50, E_MAX = 0.85;
const A_MIN = 0.18, A_MAX = 0.78;

function ramp(x: number, from: number, to: number): number {
  if (x <= from) return 0;
  if (x >= to) return 1;
  return (x - from) / (to - from);
}
function ease(t: number): number { return 1 - Math.pow(1 - t, 3); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// Deterministic per-cycle pseudo-random — same cycle index always yields the
// same Expected/Actual positions, so refs aren't needed to remember state.
function rngFor(seed: number): () => number {
  let s = (seed * 0x9E3779B1) >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function expectedForCycle(n: number): number {
  if (n < 0) return 0.66;
  const r = rngFor(n);
  return E_MIN + r() * (E_MAX - E_MIN);
}
function actualForCycle(n: number): number {
  if (n < 0) return 0.40;
  const r = rngFor(n + 9999); // different seed stream
  return A_MIN + r() * (A_MAX - A_MIN);
}

function partialQuadratic(
  x1: number, y1: number,
  cx: number, cy: number,
  x2: number, y2: number,
  progress: number,
): string {
  const u = Math.max(0, Math.min(1, progress));
  if (u <= 0) return "";
  const p01x = x1 + (cx - x1) * u;
  const p01y = y1 + (cy - y1) * u;
  const p11x = cx + (x2 - cx) * u;
  const p11y = cy + (y2 - cy) * u;
  const ex = p01x + (p11x - p01x) * u;
  const ey = p01y + (p11y - p01y) * u;
  return `M ${x1} ${y1} Q ${p01x.toFixed(2)} ${p01y.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}

function fullQuadratic(
  x1: number, y1: number, cx: number, cy: number, x2: number, y2: number,
): string {
  return `M ${x1} ${y1} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

export default function HorizonLoop() {
  const [, setTick] = useState(0);
  const startRef = useRef<number | null>(null);
  const reducedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedRef.current) {
      setTick(1);
      return;
    }
    let raf = 0;
    const loop = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      setTick((t) => (t + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Compute everything from elapsed time. No mutable state between frames.
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  const elapsed = startRef.current === null ? 0 : now - startRef.current;
  const cycleN = reducedRef.current ? 1 : Math.floor(elapsed / CYCLE_MS);
  const within = reducedRef.current ? CYCLE_MS - 100 : elapsed - cycleN * CYCLE_MS;

  // Expected & Actual: smoothly interpolate from previous-cycle value to
  // current-cycle value over the appropriate phase.
  const expectedPrev = expectedForCycle(cycleN - 1);
  const expectedNew = expectedForCycle(cycleN);
  const eShiftT = ease(ramp(within, PHASE.expectedShift[0], PHASE.expectedShift[1]));
  const expectedNorm = lerp(expectedPrev, expectedNew, eShiftT);

  const actualPrev = actualForCycle(cycleN - 1);
  const actualNew = actualForCycle(cycleN);
  const aShiftT = ease(ramp(within, PHASE.actualShift[0], PHASE.actualShift[1]));
  const actualNorm = lerp(actualPrev, actualNew, aShiftT);

  const expectedX = LINE_X1 + expectedNorm * LINE_W;
  const actualX = LINE_X1 + actualNorm * LINE_W;

  // Shock pulse on Expected pin (ring expanding outward)
  const shockT = ramp(within, PHASE.shockPulse[0], PHASE.shockPulse[1]);
  const shockR = 6 + shockT * 24;
  const shockOpacity = shockT > 0 ? Math.max(0, 1 - shockT) * 0.7 : 0;

  // Strategy aura extra pulse (briefly expanding)
  const stratPulseT = ramp(within, PHASE.strategyPulse[0], PHASE.strategyPulse[1]);
  const stratPulseR = 12 + stratPulseT * 24;
  const stratPulseOpacity = stratPulseT > 0 ? Math.max(0, 1 - stratPulseT) * 0.6 : 0;

  // Informs arc — geometry uses CURRENT expected position
  const informsCx = (expectedX + STRAT_X) / 2;
  const informsCy = EXPECTED_Y + 64;
  const informsD = fullQuadratic(
    expectedX, EXPECTED_Y + 6,
    informsCx, informsCy,
    STRAT_X, STRAT_Y + 6,
  );
  // Traveling pulse along informs arc — a moving dot on the curve
  const informsPulseT = ramp(within, PHASE.informsTravel[0], PHASE.informsTravel[1]);
  const informsPulseVisible = informsPulseT > 0 && informsPulseT < 1;
  // Sample point at u = informsPulseT (going Expected → Strategy)
  const informsPulse = (() => {
    if (!informsPulseVisible) return null;
    const u = informsPulseT;
    const mt = 1 - u;
    const x = mt * mt * expectedX + 2 * mt * u * informsCx + u * u * STRAT_X;
    const y = mt * mt * (EXPECTED_Y + 6) + 2 * mt * u * informsCy + u * u * (STRAT_Y + 6);
    return { x, y };
  })();

  // Influences shots — current cycle's arrow being drawn, plus ghosts of
  // recent past cycles that are still fading.
  const shots: Array<{
    cycleN: number;
    actualNorm: number;
    progress: number;   // 0..1 draw progress
    opacity: number;
    isCurrent: boolean;
  }> = [];

  // Look back several cycles for ghosts
  for (let n = Math.max(0, cycleN - 4); n <= cycleN; n++) {
    const aN = actualForCycle(n);
    if (n === cycleN) {
      const p = ramp(within, PHASE.influencesShoot[0], PHASE.influencesShoot[1]);
      if (p > 0) {
        shots.push({
          cycleN: n, actualNorm: aN, progress: p, opacity: 1, isCurrent: true,
        });
      }
    } else {
      // Time since this cycle's shoot completed
      const completedAt = n * CYCLE_MS + PHASE.influencesShoot[1];
      const sinceComplete = elapsed - completedAt;
      if (sinceComplete <= 0) continue;
      const fade = Math.max(0, sinceComplete - GHOST_FADE_START_MS) / GHOST_FADE_LEN_MS;
      if (fade >= 1) continue;
      const opacity = (1 - fade) * 0.32;
      shots.push({
        cycleN: n, actualNorm: aN, progress: 1, opacity, isCurrent: false,
      });
    }
  }

  // Build a bezier from Strategy → (LINE_X1 + aN * LINE_W, ACTUAL_Y) per shot
  function buildShotPath(aN: number, progress: number) {
    const endX = LINE_X1 + aN * LINE_W;
    const cx = (STRAT_X + endX) / 2;
    const cy = Math.min(STRAT_Y, ACTUAL_Y) - 60;
    if (progress >= 1) {
      return { d: fullQuadratic(STRAT_X, STRAT_Y - 6, cx, cy, endX, ACTUAL_Y + 4), endpointX: endX };
    }
    return { d: partialQuadratic(STRAT_X, STRAT_Y - 6, cx, cy, endX, ACTUAL_Y + 4, progress), endpointX: endX };
  }

  return (
    <figure className="hl-figure">
      <div className="hl-canvas">
        <svg
          className="hl-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="A loop showing how the expected time horizon, when shocked by new information, informs the decision strategy, which then influences the actual time horizon. The blue arrow keeps shooting at a moving target."
        >
          <defs>
            <marker
              id="hl-arrow-blue"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e3a8a" />
            </marker>
            <marker
              id="hl-arrow-blue-faint"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e3a8a" opacity="0.4" />
            </marker>
            <marker
              id="hl-arrow-ink"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0a0a0a" />
            </marker>
          </defs>

          {/* Two parallel time lines */}
          <line
            x1={LINE_X1}
            y1={ACTUAL_Y}
            x2={LINE_X2}
            y2={ACTUAL_Y}
            className="hl-line-actual"
          />
          <line
            x1={LINE_X1}
            y1={EXPECTED_Y}
            x2={LINE_X2}
            y2={EXPECTED_Y}
            className="hl-line-expected"
          />
          <text
            x={LINE_X2 + 10}
            y={ACTUAL_Y + 4}
            className="hl-line-label hl-line-label--strong"
          >
            ACTUAL
          </text>
          <text
            x={LINE_X2 + 10}
            y={EXPECTED_Y + 4}
            className="hl-line-label"
          >
            EXPECTED
          </text>

          {/* Strategy node — dot + breathing aura + label + cycle pulse */}
          <g transform={`translate(${STRAT_X} ${STRAT_Y})`}>
            <circle cx={0} cy={0} r={26} className="hl-strategy-aura hl-strategy-aura--outer" />
            <circle cx={0} cy={0} r={16} className="hl-strategy-aura hl-strategy-aura--inner" />
            {stratPulseOpacity > 0 && (
              <circle
                cx={0}
                cy={0}
                r={stratPulseR}
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="1"
                opacity={stratPulseOpacity}
              />
            )}
            <circle cx={0} cy={0} r={6} className="hl-strategy-dot" />
          </g>
          <text
            x={STRAT_X}
            y={STRAT_Y + 52}
            textAnchor="middle"
            className="hl-strategy-label"
          >
            DECISION STRATEGY
          </text>

          {/* Informs arc — always present, with a moving lit pulse during the
              informs phase of each cycle */}
          <path
            d={informsD}
            className="hl-arc-informs"
            markerEnd="url(#hl-arrow-ink)"
          />
          {informsPulse && (
            <circle
              cx={informsPulse.x}
              cy={informsPulse.y}
              r={3}
              fill="#1e3a8a"
              opacity={0.85}
            />
          )}
          <text
            x={informsCx}
            y={194}
            textAnchor="middle"
            className="hl-flow-label"
          >
            INFORMS
          </text>

          {/* Influences shots — past ghosts first (behind), current shot last */}
          {shots
            .slice()
            .sort((a, b) => (a.isCurrent ? 1 : -1) - (b.isCurrent ? 1 : -1))
            .map((shot, i) => {
              const path = buildShotPath(shot.actualNorm, shot.progress);
              return (
                <path
                  key={`${shot.cycleN}-${i}`}
                  d={path.d}
                  className="hl-arc-influences"
                  opacity={shot.opacity}
                  markerEnd={
                    shot.progress >= 0.99
                      ? shot.isCurrent
                        ? "url(#hl-arrow-blue)"
                        : "url(#hl-arrow-blue-faint)"
                      : undefined
                  }
                />
              );
            })}
          <text
            x={(STRAT_X + (LINE_X1 + actualNorm * LINE_W)) / 2}
            y={28}
            textAnchor="middle"
            className="hl-flow-label"
          >
            INFLUENCES
          </text>

          {/* Expected pin — fixed-style (hollow, dashed) but x moves on shocks */}
          <line
            x1={expectedX}
            y1={EXPECTED_Y - 11}
            x2={expectedX}
            y2={EXPECTED_Y + 11}
            className="hl-pin-tick-expected"
          />
          {/* Shock ring expanding from Expected pin */}
          {shockOpacity > 0 && (
            <circle
              cx={expectedX}
              cy={EXPECTED_Y}
              r={shockR}
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="1"
              opacity={shockOpacity}
            />
          )}
          <circle
            cx={expectedX}
            cy={EXPECTED_Y}
            r={4}
            className="hl-pin-dot-expected"
          />

          {/* Actual pin */}
          <line
            x1={actualX}
            y1={ACTUAL_Y - 11}
            x2={actualX}
            y2={ACTUAL_Y + 11}
            className="hl-pin-tick-actual"
          />
          <circle cx={actualX} cy={ACTUAL_Y} r={4} className="hl-pin-dot-actual" />
        </svg>
      </div>
    </figure>
  );
}
