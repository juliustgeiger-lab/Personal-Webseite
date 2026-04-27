"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * HorizonLoop — causal view, v8.
 *
 * Layout:
 *   - "DECISION STRATEGY" — bold Geist Sans, top-left.
 *   - "TIME HORIZON"      — bold Geist Sans, top-RIGHT (mirrors).
 *   - Strategy anchor below DECISION STRATEGY: target-style ring + dot.
 *   - Two parallel horizon lines: solid ACTUAL on top, dashed EXPECTED below.
 *
 * Arrows (3px, solid, with arrowheads):
 *   - INFORMS    (blue) — Expected dot → Strategy anchor.
 *                Persists at full alpha across the calm gap. Only begins
 *                fading once the NEW informs arrow has started drawing
 *                plus a small pause.
 *   - INFLUENCES (ink) — Strategy → Actual landing point.
 *                Same persistence rule: stays until the new ink arrow
 *                draws.
 *
 * Each arrow's path endpoint is set back from its target marker so the
 * arrowhead lands with a small visible gap, not on top of the marker.
 *
 * Each event tells one story:
 *   1. New blue dot lands on EXPECTED with concentric waves.
 *   2. Blue informs arrow draws back to Strategy.
 *   3. Strategy anchor pulses.
 *   4. Ink influences arrow draws forward to Actual.
 *   5. Actual eases — or stays put (≈30% of events leave it unchanged).
 *
 * Slower than v7 — each beat has more breathing room.
 *
 * Interactive: drag the EXPECTED pin to reposition it. The persistent
 * informs arrow follows the cursor in real time. Auto-events resume on
 * release.
 */

const VIEW_W = 760;
const VIEW_H = 220;

// Headers
const HEADER_Y = 72;
const STRAT_HEADER_X = 40;

// Strategy block
const STRAT_NODE_X = 140;
const STRAT_NODE_Y = 134;
const STRAT_RING_R = 11;
const STRAT_DOT_R = 4;

// Two parallel horizon lines
const LINE_X1 = 300;
const LINE_X2 = 720;
const LINE_W = LINE_X2 - LINE_X1;
const ACTUAL_Y = 120;
const EXPECTED_Y = 148;

// Per-event timing — slower than v7
const EVENT_DURATION_MS = 6500;
const PHASE = {
  wave:           [0,    1500],
  expectedShift:  [0,    1300],
  informsArrow:   [1100, 2300],
  strategyPulse:  [2100, 3000],
  influencesArrow:[2800, 4100],
  actualEase:     [3700, 4400],
  // Old arrows fade only after the new arrow has started drawing + a small
  // pause, so the new is already visibly drawing in by the time the old
  // begins to leave.
  oldInformsFade:    [1900, 3300],
  oldInfluencesFade: [3300, 4700],
} as const;

const CALM_MIN_MS = 1800;
const CALM_RANGE_MS = 2400;

const NO_CHANGE_PROB = 0.30;

const EXPECTED_INITIAL = 0.66;
const ACTUAL_INITIAL = 0.38;
const EXPECTED_MIN = 0.46;
const EXPECTED_RANGE = 0.40;
const ACTUAL_MIN = 0.18;
const ACTUAL_RANGE = 0.66;

const SCHEDULE_LEN = 80;

function ramp(x: number, from: number, to: number) {
  if (x <= from) return 0;
  if (x >= to) return 1;
  return (x - from) / (to - from);
}
function ease(t: number) { return 1 - Math.pow(1 - t, 3); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp01ish(x: number) { return Math.max(0.04, Math.min(0.96, x)); }

function rngStream(seed: number) {
  let s = (seed * 0x9E3779B1) >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fullQuadratic(
  x1: number, y1: number, cx: number, cy: number, x2: number, y2: number,
): string {
  return `M ${x1} ${y1} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function partialQuadratic(
  x1: number, y1: number, cx: number, cy: number, x2: number, y2: number, u: number,
): string {
  const k = Math.max(0, Math.min(1, u));
  if (k <= 0) return "";
  const p01x = x1 + (cx - x1) * k;
  const p01y = y1 + (cy - y1) * k;
  const p11x = cx + (x2 - cx) * k;
  const p11y = cy + (y2 - cy) * k;
  const ex = p01x + (p11x - p01x) * k;
  const ey = p01y + (p11y - p01y) * k;
  return `M ${x1} ${y1} Q ${p01x.toFixed(2)} ${p01y.toFixed(2)} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
}

// Endpoint helpers — set back from target so manual arrowheads land with a
// clean visible gap. The path's natural tangent doesn't matter for direction
// because we draw the arrowhead manually and rotate it to point AT the target.
const INFL_END_DY = 18; // path ends 18px above the actual line
const INFORMS_END_X = 158;
const INFORMS_END_Y = 150;
// Manual arrowhead dimensions
const ARROW_LEN = 6;
const ARROW_HALF = 3;

function buildInfluencesPath(targetActualNorm: number, progress: number) {
  const sx = STRAT_NODE_X + 6;
  const sy = STRAT_NODE_Y - 4;
  const ex = LINE_X1 + targetActualNorm * LINE_W;
  const ey = ACTUAL_Y - INFL_END_DY;
  const cx = (sx + ex) / 2;
  const cy = Math.min(sy, ey) - 60;
  return progress >= 1
    ? fullQuadratic(sx, sy, cx, cy, ex, ey)
    : partialQuadratic(sx, sy, cx, cy, ex, ey, ease(progress));
}

function buildInformsPath(sourceExpectedNorm: number, progress: number) {
  const sx = LINE_X1 + sourceExpectedNorm * LINE_W;
  const sy = EXPECTED_Y - 4;
  const ex = INFORMS_END_X;
  const ey = INFORMS_END_Y;
  const cx = (sx + ex) / 2;
  const cy = EXPECTED_Y + 60;
  return progress >= 1
    ? fullQuadratic(sx, sy, cx, cy, ex, ey)
    : partialQuadratic(sx, sy, cx, cy, ex, ey, ease(progress));
}

type EventEntry = {
  startMs: number;
  newExpected: number;
  newActual: number;
  changesActual: boolean;
};

function buildEvents() {
  const r = rngStream(31);
  const list: EventEntry[] = [];
  let t = 700;
  let prevA = ACTUAL_INITIAL;
  for (let i = 0; i < SCHEDULE_LEN; i++) {
    const newE = EXPECTED_MIN + r() * EXPECTED_RANGE;
    const changes = r() > NO_CHANGE_PROB;
    const newA = changes ? ACTUAL_MIN + r() * ACTUAL_RANGE : prevA;
    list.push({ startMs: t, newExpected: newE, newActual: newA, changesActual: changes });
    prevA = newA;
    const calm = CALM_MIN_MS + r() * CALM_RANGE_MS;
    t += EVENT_DURATION_MS + calm;
  }
  return list;
}

export default function HorizonLoop() {
  const [, setTick] = useState(0);
  const [dragNorm, setDragNorm] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const startRef = useRef<number | null>(null);
  const reducedRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);

  const events = useMemo(() => buildEvents(), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedRef.current) {
      setTick(1);
      return;
    }
    let raf = 0;
    const loop = () => {
      setTick((t) => (t + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pointerToNorm = useCallback((clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return 0.5;
    const rect = svg.getBoundingClientRect();
    const xRel = (clientX - rect.left) / rect.width;
    const xView = xRel * VIEW_W;
    return clamp01ish((xView - LINE_X1) / LINE_W);
  }, []);

  const onPointerDown = (ev: React.PointerEvent) => {
    draggingRef.current = true;
    setDragNorm(pointerToNorm(ev.clientX));
    (ev.target as Element).setPointerCapture?.(ev.pointerId);
    ev.preventDefault();
  };
  const onPointerMove = (ev: React.PointerEvent) => {
    if (!draggingRef.current) return;
    setDragNorm(pointerToNorm(ev.clientX));
  };
  const endDrag = (ev?: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragNorm(null);
    if (ev) (ev.target as Element).releasePointerCapture?.(ev.pointerId);
  };

  const now = typeof performance !== "undefined" ? performance.now() : 0;
  if (startRef.current === null && !reducedRef.current) startRef.current = now;
  const elapsed = startRef.current === null ? 0 : now - startRef.current;
  const isDragging = dragNorm !== null;

  // Find active or last-completed event
  let activeIdx = -1;
  let lastIdx = -1;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (elapsed >= e.startMs && elapsed < e.startMs + EVENT_DURATION_MS) {
      activeIdx = i;
      break;
    }
    if (elapsed >= e.startMs + EVENT_DURATION_MS) {
      lastIdx = i;
    }
  }
  const activeEvent = activeIdx >= 0 ? events[activeIdx] : null;
  const lastEvent = lastIdx >= 0 ? events[lastIdx] : null;
  const eventT = activeEvent ? elapsed - activeEvent.startMs : 0;

  // Resolve persistent positions
  let scheduledExpected: number;
  let scheduledActual: number;
  if (reducedRef.current) {
    scheduledExpected = 0.66;
    scheduledActual = 0.32;
  } else if (activeEvent) {
    const prevExp = lastEvent ? lastEvent.newExpected : EXPECTED_INITIAL;
    const prevAct = lastEvent ? lastEvent.newActual : ACTUAL_INITIAL;
    const eShift = ease(ramp(eventT, PHASE.expectedShift[0], PHASE.expectedShift[1]));
    scheduledExpected = lerp(prevExp, activeEvent.newExpected, eShift);
    if (activeEvent.changesActual) {
      const aShift = ease(ramp(eventT, PHASE.actualEase[0], PHASE.actualEase[1]));
      scheduledActual = lerp(prevAct, activeEvent.newActual, aShift);
    } else {
      scheduledActual = prevAct;
    }
  } else if (lastEvent) {
    scheduledExpected = lastEvent.newExpected;
    scheduledActual = lastEvent.newActual;
  } else {
    scheduledExpected = EXPECTED_INITIAL;
    scheduledActual = ACTUAL_INITIAL;
  }

  const expectedNorm = isDragging ? dragNorm! : scheduledExpected;
  const actualNorm = scheduledActual;
  const expectedX = LINE_X1 + expectedNorm * LINE_W;
  const actualX = LINE_X1 + actualNorm * LINE_W;
  const newExpectedX = activeEvent ? LINE_X1 + activeEvent.newExpected * LINE_W : expectedX;
  const targetActualX = activeEvent ? LINE_X1 + activeEvent.newActual * LINE_W : actualX;

  const showEventVisuals = !isDragging;

  // Concentric waves on the new Expected dot
  const waves = activeEvent && showEventVisuals
    ? [0, 280, 560].map((delayMs) => {
        const localMs = eventT - delayMs;
        if (localMs < 0 || localMs > 1100) return null;
        const wt = localMs / 1100;
        return { r: 6 + wt * 30, opacity: Math.max(0, 0.7 * (1 - wt)) };
      })
    : [];

  // Strategy pulse ring
  const stratPulseT = activeEvent && showEventVisuals
    ? ramp(eventT, PHASE.strategyPulse[0], PHASE.strategyPulse[1])
    : 0;
  const stratPulse = stratPulseT > 0 && stratPulseT < 1
    ? { r: STRAT_RING_R + stratPulseT * 18, opacity: Math.max(0, 0.7 * (1 - stratPulseT)) }
    : null;

  // ─── INFORMS arrow (BLUE) ───
  let oldInformsAnchor: number | null = null;
  let oldInformsAlpha = 0;
  if (isDragging) {
    oldInformsAnchor = expectedNorm;
    oldInformsAlpha = 1;
  } else if (activeEvent && lastEvent) {
    oldInformsAnchor = lastEvent.newExpected;
    oldInformsAlpha = 1 - ramp(eventT, PHASE.oldInformsFade[0], PHASE.oldInformsFade[1]);
  } else if (lastEvent) {
    oldInformsAnchor = lastEvent.newExpected;
    oldInformsAlpha = 1;
  }

  const informsT = activeEvent && showEventVisuals
    ? ramp(eventT, PHASE.informsArrow[0], PHASE.informsArrow[1])
    : 0;

  // ─── INFLUENCES arrow (INK) ───
  // Old influences arrow persists across the calm gap — only fades after the
  // new one has started drawing.
  let oldInfluencesAnchor: number | null = null;
  let oldInfluencesAlpha = 0;
  if (activeEvent && lastEvent) {
    oldInfluencesAnchor = lastEvent.newActual;
    oldInfluencesAlpha = 1 - ramp(eventT, PHASE.oldInfluencesFade[0], PHASE.oldInfluencesFade[1]);
  } else if (lastEvent) {
    oldInfluencesAnchor = lastEvent.newActual;
    oldInfluencesAlpha = 1;
  }

  const inflT = activeEvent && showEventVisuals
    ? ramp(eventT, PHASE.influencesArrow[0], PHASE.influencesArrow[1])
    : 0;

  // Landing flash
  const landingFlashT = activeEvent && showEventVisuals
    ? ramp(eventT, PHASE.influencesArrow[1] - 100, PHASE.influencesArrow[1] + 400)
    : 0;
  const landingFlash = activeEvent
    && showEventVisuals
    && activeEvent.changesActual
    && landingFlashT > 0
    && landingFlashT < 1
    ? { r: 12, opacity: Math.max(0, 0.7 * (1 - landingFlashT)) }
    : null;

  return (
    <figure className="hl-figure">
      <div className="hl-canvas">
        <svg
          ref={svgRef}
          className="hl-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Decision strategy on the left, time horizon on the right with two parallel lines for actual and expected. Drag the expected pin to move it. New events fire periodically, sending arrows between them."
        >
          {/* No marker defs — arrowheads are drawn manually as rotated
              triangles so the tip points exactly at the target dot, not
              wherever the path's tangent happens to face. */}

          {/* Headers — DECISION STRATEGY left, TIME HORIZON right (mirrored) */}
          <text x={STRAT_HEADER_X} y={HEADER_Y} className="hl-strategy-name">
            DECISION STRATEGY
          </text>
          <text x={LINE_X2} y={HEADER_Y} textAnchor="end" className="hl-strategy-name">
            TIME HORIZON
          </text>

          {/* Two parallel time lines */}
          <line x1={LINE_X1} y1={ACTUAL_Y} x2={LINE_X2} y2={ACTUAL_Y} className="hl-line-actual" />
          <line x1={LINE_X1} y1={EXPECTED_Y} x2={LINE_X2} y2={EXPECTED_Y} className="hl-line-expected" />
          <text x={LINE_X2 + 10} y={ACTUAL_Y + 4} className="hl-line-label hl-line-label--strong">
            ACTUAL
          </text>
          <text x={LINE_X2 + 10} y={EXPECTED_Y + 4} className="hl-line-label">
            EXPECTED
          </text>

          {/* Strategy anchor */}
          <circle
            cx={STRAT_NODE_X}
            cy={STRAT_NODE_Y}
            r={STRAT_RING_R}
            fill="#ffffff"
            stroke="#0a0a0a"
            strokeWidth="1.5"
          />
          <circle cx={STRAT_NODE_X} cy={STRAT_NODE_Y} r={STRAT_DOT_R} fill="#0a0a0a" />
          {stratPulse && (
            <circle
              cx={STRAT_NODE_X}
              cy={STRAT_NODE_Y}
              r={stratPulse.r}
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="1.2"
              opacity={stratPulse.opacity}
            />
          )}

          {/* Concentric waves at the new Expected dot */}
          {waves.map((w, i) =>
            w == null ? null : (
              <circle
                key={`wave-${activeIdx}-${i}`}
                cx={newExpectedX}
                cy={EXPECTED_Y}
                r={w.r}
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="1.2"
                opacity={w.opacity}
              />
            ),
          )}

          {/* OLD informs arrow — persistent */}
          {oldInformsAnchor !== null && oldInformsAlpha > 0 && (
            <>
              <path
                d={buildInformsPath(oldInformsAnchor, 1)}
                className="hl-arc-informs-blue"
                opacity={oldInformsAlpha}
              />
              <ArrowTip
                x={INFORMS_END_X}
                y={INFORMS_END_Y}
                targetX={STRAT_NODE_X}
                targetY={STRAT_NODE_Y}
                color="#1e3a8a"
                opacity={oldInformsAlpha}
              />
            </>
          )}

          {/* NEW informs arrow */}
          {informsT > 0 && (
            <>
              <path
                d={buildInformsPath(activeEvent!.newExpected, informsT)}
                className="hl-arc-informs-blue"
              />
              {informsT >= 0.99 && (
                <ArrowTip
                  x={INFORMS_END_X}
                  y={INFORMS_END_Y}
                  targetX={STRAT_NODE_X}
                  targetY={STRAT_NODE_Y}
                  color="#1e3a8a"
                />
              )}
            </>
          )}

          {/* OLD influences arrow — persistent until new one draws */}
          {oldInfluencesAnchor !== null && oldInfluencesAlpha > 0 && (
            <>
              <path
                d={buildInfluencesPath(oldInfluencesAnchor, 1)}
                className="hl-arc-influences-ink"
                opacity={oldInfluencesAlpha}
              />
              <ArrowTip
                x={LINE_X1 + oldInfluencesAnchor * LINE_W}
                y={ACTUAL_Y - INFL_END_DY}
                targetX={LINE_X1 + oldInfluencesAnchor * LINE_W}
                targetY={ACTUAL_Y}
                color="#0a0a0a"
                opacity={oldInfluencesAlpha}
              />
            </>
          )}

          {/* NEW influences arrow */}
          {inflT > 0 && (
            <>
              <path
                d={buildInfluencesPath(activeEvent!.newActual, inflT)}
                className="hl-arc-influences-ink"
              />
              {inflT >= 0.99 && (
                <ArrowTip
                  x={LINE_X1 + activeEvent!.newActual * LINE_W}
                  y={ACTUAL_Y - INFL_END_DY}
                  targetX={LINE_X1 + activeEvent!.newActual * LINE_W}
                  targetY={ACTUAL_Y}
                  color="#0a0a0a"
                />
              )}
            </>
          )}

          {/* Landing flash on Actual marker */}
          {landingFlash && (
            <circle
              cx={targetActualX}
              cy={ACTUAL_Y}
              r={landingFlash.r}
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="1.2"
              opacity={landingFlash.opacity}
            />
          )}

          {/* Expected pin — draggable */}
          <g
            className={
              "hl-expected-marker" +
              (hovered || isDragging ? " hl-expected-marker--active" : "")
            }
          >
            <circle
              cx={expectedX}
              cy={EXPECTED_Y}
              r={14}
              className="hl-drag-ring"
            />
            <line
              x1={expectedX}
              y1={EXPECTED_Y - 12}
              x2={expectedX}
              y2={EXPECTED_Y + 12}
              className="hl-pin-tick-expected"
            />
            <circle
              cx={expectedX}
              cy={EXPECTED_Y}
              r={6}
              className="hl-pin-dot-expected"
            />
            <rect
              x={expectedX - 14}
              y={EXPECTED_Y - 16}
              width={28}
              height={32}
              fill="transparent"
              className="hl-drag-handle"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            />
          </g>

          {/* Actual pin */}
          <line
            x1={actualX}
            y1={ACTUAL_Y - 12}
            x2={actualX}
            y2={ACTUAL_Y + 12}
            className="hl-pin-tick-actual"
          />
          <circle cx={actualX} cy={ACTUAL_Y} r={6} className="hl-pin-dot-actual" />
        </svg>
      </div>
    </figure>
  );
}

/**
 * Manual arrowhead — a small triangle rotated to point exactly at a target
 * dot, regardless of the curve's tangent at the path endpoint. The triangle's
 * tip is `ARROW_LEN` away from (x, y) along the direction of (target - point).
 */
function ArrowTip({
  x,
  y,
  targetX,
  targetY,
  color,
  opacity = 1,
}: {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
  opacity?: number;
}) {
  const dx = targetX - x;
  const dy = targetY - y;
  if (dx === 0 && dy === 0) return null;
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <polygon
      points={`0,-${ARROW_HALF} ${ARROW_LEN},0 0,${ARROW_HALF}`}
      fill={color}
      opacity={opacity}
      transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angleDeg.toFixed(2)})`}
    />
  );
}
