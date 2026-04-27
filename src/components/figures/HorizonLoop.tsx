"use client";

import { useEffect, useRef, useState } from "react";
import EssayFigure from "./EssayFigure";

/**
 * HorizonLoop — causal view.
 *
 * A faithful rebuild of the original horizon-diagram.jpg, in the site's
 * grammar. Two nodes — Decision Strategy (left) and Time Horizon (right,
 * with Expected and Actual markers) — and two flows between them:
 *
 *   Expected ──── informs ──→  Strategy
 *   Strategy ─── influences ─→ Actual
 *
 * The figure animates the loop in sequence, repeating with small position
 * variation so the relationship feels alive without being noisy:
 *
 *   1. Expected pin appears.
 *   2. The "informs" arc draws back from Expected to the Strategy box.
 *   3. The Strategy box pulses (a calibration ring expands outward).
 *   4. Three "influences" arcs draw forward from Strategy to Actual.
 *   5. The Actual pin lands at a position different from Expected.
 *   6. Brief hold.
 *   7. Fade. Reposition. Repeat.
 *
 * Visual grammar follows the site rules: hairline strokes, fountain-pen blue
 * for things in motion, mono caps for labels, no shadows, no gradients.
 */

const VIEW_W = 760;
const VIEW_H = 320;

// Strategy box geometry
const SBOX = { x: 70, y: 140, w: 200, h: 64 };
const SBOX_RIGHT = SBOX.x + SBOX.w; // 270
const SBOX_CENTER_Y = SBOX.y + SBOX.h / 2; // 172

// Time axis geometry
const AXIS_X1 = 330;
const AXIS_X2 = 720;
const AXIS_Y = SBOX_CENTER_Y; // align with strategy box center
const AXIS_W = AXIS_X2 - AXIS_X1;

// Cycle length in seconds
const CYCLE_S = 8.0;

// Phase windows (as fractions of the cycle)
const P = {
  expectedIn: { from: 0.04, to: 0.16 },
  informsDraw: { from: 0.14, to: 0.34 },
  strategyPulse: { from: 0.30, to: 0.46 },
  influencesDraw: { from: 0.40, to: 0.66 },
  actualIn: { from: 0.55, to: 0.72 },
  hold: { from: 0.72, to: 0.88 },
  fade: { from: 0.88, to: 1.0 },
};

function ramp(t: number, from: number, to: number): number {
  if (t <= from) return 0;
  if (t >= to) return 1;
  return (t - from) / (to - from);
}

function ease(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Bezier path string from (x1,y) to (x2,y) with vertical apex offset.
// apexDy < 0 → arc bows upward, > 0 → bows downward.
function arcPath(x1: number, y: number, x2: number, y2: number, apexDy: number) {
  const cx = (x1 + x2) / 2;
  const cy = (y + y2) / 2 + apexDy;
  return `M ${x1} ${y} Q ${cx} ${cy} ${x2} ${y2}`;
}

// Sample the bezier at parameter u ∈ [0,1] (used so we can stop the arc
// partway along its length while it's drawing in).
function sampleArc(
  x1: number,
  y1: number,
  cx: number,
  cy: number,
  x2: number,
  y2: number,
  u: number,
) {
  const mt = 1 - u;
  const x = mt * mt * x1 + 2 * mt * u * cx + u * u * x2;
  const y = mt * mt * y1 + 2 * mt * u * cy + u * u * y2;
  return { x, y };
}

type Endpoints = { eX: number; aX: number };

const VARIATIONS: Endpoints[] = [
  { eX: 0.62, aX: 0.34 },
  { eX: 0.78, aX: 0.46 },
  { eX: 0.55, aX: 0.74 }, // actual exceeds expected — the rare reverse case
  { eX: 0.84, aX: 0.30 },
];

export default function HorizonLoop() {
  // Single time scalar 0..1 within the current cycle, used to drive every
  // animated attribute. Refs hold the heavy state; t is what re-renders.
  const [t, setT] = useState(0);
  const [variationIdx, setVariationIdx] = useState(0);
  const startRef = useRef<number | null>(null);
  const cycleRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Settle in a representative final state (post-hold, pre-fade).
      setT(0.80);
      return;
    }

    let raf = 0;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = (now - startRef.current) / 1000;
      const cycle = Math.floor(elapsed / CYCLE_S);
      const within = (elapsed % CYCLE_S) / CYCLE_S;
      if (cycle !== cycleRef.current) {
        cycleRef.current = cycle;
        setVariationIdx((i) => (i + 1) % VARIATIONS.length);
      }
      setT(within);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const variation = VARIATIONS[variationIdx];
  const eX = AXIS_X1 + variation.eX * AXIS_W;
  const aX = AXIS_X1 + variation.aX * AXIS_W;

  // Per-element progress (0..1)
  const fade = 1 - ramp(t, P.fade.from, P.fade.to);
  const expectedOpacity = ramp(t, P.expectedIn.from, P.expectedIn.to) * fade;
  const informsProgress = ease(ramp(t, P.informsDraw.from, P.informsDraw.to));
  const informsAlpha = (informsProgress > 0 ? 1 : 0) * fade;
  // Strategy pulse: a ring expanding from the box outward.
  const pulseT = ramp(t, P.strategyPulse.from, P.strategyPulse.to);
  const pulseScale = 1 + pulseT * 0.18;
  const pulseAlpha = pulseT < 1 ? Math.max(0, 1 - pulseT) * 0.9 : 0;
  // Three influence arcs, each starting slightly later than the previous.
  const influence0 = ease(ramp(t, P.influencesDraw.from, P.influencesDraw.to));
  const influence1 = ease(
    ramp(t, P.influencesDraw.from + 0.02, P.influencesDraw.to + 0.02),
  );
  const influence2 = ease(
    ramp(t, P.influencesDraw.from + 0.04, P.influencesDraw.to + 0.04),
  );
  const influencesAlpha = (influence0 > 0 ? 1 : 0) * fade;
  const actualOpacity = ramp(t, P.actualIn.from, P.actualIn.to) * fade;

  // Informs arc — from Expected pin curving DOWN under the figure to the
  // Strategy box right edge.
  const informsX1 = eX;
  const informsY1 = AXIS_Y + 4;
  const informsX2 = SBOX_RIGHT + 8;
  const informsY2 = AXIS_Y;
  const informsCx = (informsX1 + informsX2) / 2;
  const informsCy = AXIS_Y + 110;

  // Influences arcs — from Strategy box right edge curving UP to Actual pin.
  // Three arcs with slightly different apex heights and end x-offsets to
  // mimic the original's "distribution of effect" feeling.
  const inflX1 = SBOX_RIGHT;
  const inflY1 = AXIS_Y;
  const inflArcs = [
    { apex: -110, endDx: -10 },
    { apex: -130, endDx: 0 },
    { apex: -100, endDx: 10 },
  ];

  return (
    <EssayFigure
      label="§ Fig 2 — Horizon: the causal loop"
      caption="The expected horizon informs the strategy. The strategy influences the actual horizon. The two are linked, and the two are almost never the same."
    >
      <div className="hl-canvas">
        <svg
          className="hl-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="A loop showing how the expected time horizon informs the decision strategy, and the strategy influences the actual time horizon."
        >
          <defs>
            {/* Arrowhead for the influences arcs (blue) */}
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
            {/* Arrowhead for the informs arc (ink, smaller) */}
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

          {/* Time axis (always visible) */}
          <line
            x1={AXIS_X1}
            y1={AXIS_Y}
            x2={AXIS_X2}
            y2={AXIS_Y}
            className="hl-axis"
          />
          <text
            x={AXIS_X2}
            y={AXIS_Y - 12}
            textAnchor="end"
            className="hl-flow-label"
            opacity={0.75}
          >
            TIME HORIZON →
          </text>

          {/* Decision Strategy box (always visible). Pulse ring expands outward
              during the strategyPulse phase. */}
          <g>
            <rect
              x={SBOX.x - 6}
              y={SBOX.y - 6}
              width={SBOX.w + 12}
              height={SBOX.h + 12}
              rx={12}
              className="hl-strategy-pulse"
              style={{
                transform: `scale(${pulseScale})`,
                transformOrigin: `${SBOX.x + SBOX.w / 2}px ${SBOX_CENTER_Y}px`,
                opacity: pulseAlpha,
              }}
            />
            <rect
              x={SBOX.x}
              y={SBOX.y}
              width={SBOX.w}
              height={SBOX.h}
              rx={10}
              className="hl-strategy-box"
            />
            <text
              x={SBOX.x + SBOX.w / 2}
              y={SBOX_CENTER_Y}
              className="hl-strategy-text"
            >
              DECISION STRATEGY
            </text>
          </g>

          {/* Expected pin */}
          <g style={{ opacity: expectedOpacity }}>
            <line
              x1={eX}
              y1={AXIS_Y - 18}
              x2={eX}
              y2={AXIS_Y + 18}
              className="hl-pin-tick-expected"
            />
            <circle cx={eX} cy={AXIS_Y - 22} r={3.5} className="hl-pin-dot" />
            <text
              x={eX}
              y={AXIS_Y + 32}
              textAnchor="middle"
              className="hd-axis-label"
            >
              EXPECTED
            </text>
            <text
              x={eX - 12}
              y={AXIS_Y + 4}
              textAnchor="middle"
              className="hd-chev"
              style={{ opacity: 0.55 }}
            >
              ‹
            </text>
            <text
              x={eX + 12}
              y={AXIS_Y + 4}
              textAnchor="middle"
              className="hd-chev"
              style={{ opacity: 0.55 }}
            >
              ›
            </text>
          </g>

          {/* Informs arc (Expected → Strategy) — dashed ink, draws from
              Expected end backwards to the Strategy box. We achieve the
              "draws in" effect by sampling the bezier and rendering only the
              traced segment. */}
          {informsProgress > 0 && (
            <PartialQuadratic
              x1={informsX1}
              y1={informsY1}
              cx={informsCx}
              cy={informsCy}
              x2={informsX2}
              y2={informsY2}
              progress={informsProgress}
              className="hl-arc-informs"
              opacity={informsAlpha}
              markerEnd={informsProgress >= 0.99 ? "url(#hl-arrow-ink)" : undefined}
            />
          )}
          {/* INFORMS label, fades in with the arc */}
          {informsAlpha > 0 && (
            <text
              x={informsCx}
              y={AXIS_Y + 78}
              textAnchor="middle"
              className="hl-flow-label"
              opacity={informsProgress * fade * 0.85}
            >
              INFORMS
            </text>
          )}

          {/* Influences arcs (Strategy → Actual) */}
          {inflArcs.map((cfg, i) => {
            const progress = i === 0 ? influence0 : i === 1 ? influence1 : influence2;
            if (progress <= 0) return null;
            const endX = aX + cfg.endDx;
            const endY = AXIS_Y;
            const cx = (inflX1 + endX) / 2;
            const cy = (inflY1 + endY) / 2 + cfg.apex;
            const opacity = (i === 1 ? 0.95 : 0.6) * influencesAlpha;
            return (
              <PartialQuadratic
                key={i}
                x1={inflX1}
                y1={inflY1}
                cx={cx}
                cy={cy}
                x2={endX}
                y2={endY}
                progress={progress}
                className="hl-arc"
                opacity={opacity}
                markerEnd={
                  progress >= 0.99 && i === 1 ? "url(#hl-arrow-blue)" : undefined
                }
              />
            );
          })}
          {/* INFLUENCES label, fades in with the arcs */}
          {influencesAlpha > 0 && (
            <text
              x={(inflX1 + aX) / 2}
              y={AXIS_Y - 110}
              textAnchor="middle"
              className="hl-flow-label"
              opacity={influence0 * fade * 0.85}
            >
              INFLUENCES
            </text>
          )}

          {/* Actual pin */}
          <g style={{ opacity: actualOpacity }}>
            <line
              x1={aX}
              y1={AXIS_Y - 18}
              x2={aX}
              y2={AXIS_Y + 18}
              className="hl-pin-tick-actual"
            />
            <circle cx={aX} cy={AXIS_Y - 22} r={4} className="hl-pin-dot" />
            <text
              x={aX}
              y={AXIS_Y + 32}
              textAnchor="middle"
              className="hd-axis-label hd-axis-label--strong"
            >
              ACTUAL
            </text>
            <text
              x={aX - 12}
              y={AXIS_Y + 4}
              textAnchor="middle"
              className="hd-chev"
              style={{ opacity: 0.55 }}
            >
              ‹
            </text>
            <text
              x={aX + 12}
              y={AXIS_Y + 4}
              textAnchor="middle"
              className="hd-chev"
              style={{ opacity: 0.55 }}
            >
              ›
            </text>
          </g>
        </svg>
      </div>
    </EssayFigure>
  );
}

/**
 * A quadratic bezier that renders only the first `progress` fraction of its
 * curve. Used so arcs can "draw in" without relying on stroke-dasharray
 * (which would require knowing total path length up front and breaks for
 * tightly curved beziers).
 */
function PartialQuadratic({
  x1,
  y1,
  cx,
  cy,
  x2,
  y2,
  progress,
  className,
  opacity,
  markerEnd,
}: {
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  x2: number;
  y2: number;
  progress: number;
  className?: string;
  opacity?: number;
  markerEnd?: string;
}) {
  // De Casteljau split of the quadratic at u = progress. The first half
  // gives a smaller quadratic with control points (x1,y1), (split1), (splitEnd).
  const u = Math.max(0, Math.min(1, progress));
  // P0_1 between (x1,y1) and (cx,cy)
  const p01x = x1 + (cx - x1) * u;
  const p01y = y1 + (cy - y1) * u;
  // P1_1 between (cx,cy) and (x2,y2)
  const p11x = cx + (x2 - cx) * u;
  const p11y = cy + (y2 - cy) * u;
  // The endpoint of the partial segment is the lerp between p01 and p11
  const endX = p01x + (p11x - p01x) * u;
  const endY = p01y + (p11y - p01y) * u;
  const d = `M ${x1} ${y1} Q ${p01x.toFixed(2)} ${p01y.toFixed(2)} ${endX.toFixed(2)} ${endY.toFixed(2)}`;
  return (
    <path
      d={d}
      className={className}
      opacity={opacity}
      markerEnd={markerEnd}
    />
  );
}
