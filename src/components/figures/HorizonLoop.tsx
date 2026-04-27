"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * HorizonLoop — causal view, v10.
 *
 * Intro (triggered when the figure scrolls into view):
 *   1. A single horizon line appears.
 *   2. "TIME HORIZON" header fades in.
 *   3. The line splits into ACTUAL (top, solid) and EXPECTED (below, dashed).
 *   4. "DECISION STRATEGY" header + anchor fade in.
 *   Then the event loop begins.
 *
 * Three event types fire endlessly at irregular intervals:
 *
 *   A — Info on Expected. Something is read or learned. A blue dot appears
 *       on the EXPECTED line, sparks a blue arrow back to Strategy, the
 *       Strategy pulses. The actual horizon doesn't change.
 *       Banner: "Annual checkup — no change." etc.
 *
 *   B — Life event hits Actual directly. Concentric INK waves appear on the
 *       ACTUAL line at a new position. The actual marker eases to it. The
 *       persistent ink influences arrow follows.
 *       Banner: "Cancer diagnosis — horizon shortens." / "Started running
 *       — horizon extends." etc.
 *
 *   C — Full chain. Blue dot on EXPECTED → blue arrow to Strategy →
 *       Strategy pulses → NEW ink arrow draws to a NEW actual position →
 *       old ink arrow fades.
 *       Banner: "New medical breakthrough — strategy adapts. Horizon
 *       extends." etc.
 *
 * Visual conventions:
 *   - Blue waves / blue arrow = something arriving on the EXPECTED side
 *     (a fact, study, projection update).
 *   - Ink waves / ink arrow = the strategy's relationship to ACTUAL, or a
 *     direct life event landing on actual.
 *   - 4px lines, 3px lines for old/fading. Manual rotated arrowheads point
 *     exactly at their target dots.
 *
 * Always-visible BANNER below the figure shows the most recent event's
 * effect, with a soft crossfade between events.
 *
 * Interactive: drag the EXPECTED pin to reposition it. The persistent
 * informs arrow follows the cursor in real time. Auto-events resume on
 * release.
 *
 * prefers-reduced-motion: settles to a representative still state.
 */

const VIEW_W = 760;
const VIEW_H = 240; // taller than v9 to fit the banner row

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
const SPLIT_MID_Y = (ACTUAL_Y + EXPECTED_Y) / 2; // 134 — pre-split single line

// Banner
const BANNER_Y = 215;

// Intro reveal — total ~3.6s once the figure enters viewport
const INTRO_DURATION_MS = 3600;
const INTRO_PHASE = {
  singleLine:    [0,    300],   // single line fades in
  thHeader:      [300,  900],   // "TIME HORIZON" appears
  split:         [900,  1900],  // line splits into actual + expected
  lineLabels:    [1700, 2200],  // ACTUAL / EXPECTED right-end labels
  stratBlock:    [2200, 3000],  // DECISION STRATEGY header + anchor
  // Done at 3000–3600 (settle).
};

// Event timing per type (within a single event)
const TYPE_PHASES = {
  A: {
    duration: 4000,
    waveExpected: [0, 1500] as const,
    expectedShift: [0, 1300] as const,
    informsArrow: [1100, 2300] as const,
    strategyPulse: [2100, 3000] as const,
    oldInformsFade: [1900, 3300] as const,
    fade: [3000, 4000] as const,
  },
  B: {
    duration: 3500,
    waveActual: [0, 1500] as const,
    actualEase: [600, 2200] as const,
    fade: [2400, 3500] as const,
  },
  C: {
    duration: 6500,
    waveExpected: [0, 1500] as const,
    expectedShift: [0, 1300] as const,
    informsArrow: [1100, 2300] as const,
    strategyPulse: [2100, 3000] as const,
    influencesArrow: [2800, 4100] as const,
    actualEase: [3700, 4400] as const,
    oldInformsFade: [1900, 3300] as const,
    oldInfluencesFade: [3300, 4700] as const,
  },
};

const CALM_MIN_MS = 1500;
const CALM_RANGE_MS = 2200;

const EXPECTED_INITIAL = 0.66;
const ACTUAL_INITIAL = 0.42;
const EXPECTED_MIN = 0.46;
const EXPECTED_RANGE = 0.40;

const SCHEDULE_LEN = 100;

const MESSAGES_A = [
  "Annual checkup — no change.",
  "Mortality study read — projection holds.",
  "Birthday passed — horizon unchanged.",
  "Friend's diagnosis — reflection only.",
  "New paper on aging — no update.",
  "Doctor's optimistic note — strategy holds.",
];
const MESSAGES_B_SHORT = [
  "Cancer diagnosis — horizon shortens.",
  "Started smoking — horizon shrinks.",
  "Heart event — horizon shrinks.",
  "Started base jumping — horizon shortens.",
  "Pandemic exposure — horizon shortens.",
  "Severe accident — horizon shrinks.",
];
const MESSAGES_B_LONG = [
  "Life-extension drug approved — horizon extends.",
  "Started running daily — horizon extends.",
  "Quit smoking — horizon recovers.",
  "Genetic therapy succeeds — horizon extends.",
  "Found a new doctor — horizon extends.",
  "Sleep finally fixed — horizon extends.",
];
const MESSAGES_C_SHORT = [
  "New diagnosis — strategy adjusts. Horizon shortens.",
  "Family history revealed — strategy hardens. Horizon shrinks.",
  "Bad scan — strategy pivots. Horizon shrinks.",
];
const MESSAGES_C_LONG = [
  "Medical breakthrough — strategy adapts. Horizon extends.",
  "Optimistic projection — strategy loosens. Horizon extends.",
  "New protocol — strategy widens. Horizon extends.",
];

function ramp(x: number, from: number, to: number) {
  if (x <= from) return 0;
  if (x >= to) return 1;
  return (x - from) / (to - from);
}
function ease(t: number) { return 1 - Math.pow(1 - t, 3); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp01ish(x: number) { return Math.max(0.04, Math.min(0.96, x)); }
function clampActual(x: number) { return Math.max(0.10, Math.min(0.92, x)); }

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

const INFL_END_DY = 18;
const INFORMS_END_X = 158;
const INFORMS_END_Y = 150;
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

type EventType = "A" | "B" | "C";

type EventEntry = {
  startMs: number;
  type: EventType;
  newExpected: number;
  newActual: number;
  message: string;
};

function buildEvents() {
  const r = rngStream(31);
  const list: EventEntry[] = [];
  // First event always starts after the intro completes.
  let t = INTRO_DURATION_MS + 700;
  let prevExpected = EXPECTED_INITIAL;
  let prevActual = ACTUAL_INITIAL;
  let lastType: EventType | null = null;

  for (let i = 0; i < SCHEDULE_LEN; i++) {
    // Pick a type, but avoid repeating the same type three times in a row.
    let type: EventType;
    const tr = r();
    if (tr < 0.34) type = "A";
    else if (tr < 0.70) type = "B";
    else type = "C";
    if (type === lastType && r() < 0.5) {
      // Reroll once if same as last
      const tr2 = r();
      type = tr2 < 0.5 ? (type === "A" ? "B" : "A") : (type === "C" ? "B" : "C");
    }
    lastType = type;

    let newExpected = prevExpected;
    let newActual = prevActual;
    let message = "";

    if (type === "A") {
      newExpected = EXPECTED_MIN + r() * EXPECTED_RANGE;
      message = MESSAGES_A[Math.floor(r() * MESSAGES_A.length)];
    } else if (type === "B") {
      const direction = r() < 0.5 ? "short" : "long";
      if (direction === "short") {
        newActual = clampActual(prevActual - 0.10 - r() * 0.22);
        message = MESSAGES_B_SHORT[Math.floor(r() * MESSAGES_B_SHORT.length)];
      } else {
        newActual = clampActual(prevActual + 0.08 + r() * 0.20);
        message = MESSAGES_B_LONG[Math.floor(r() * MESSAGES_B_LONG.length)];
      }
    } else {
      // C
      newExpected = EXPECTED_MIN + r() * EXPECTED_RANGE;
      const direction = r() < 0.5 ? "short" : "long";
      if (direction === "short") {
        newActual = clampActual(prevActual - 0.12 - r() * 0.20);
        message = MESSAGES_C_SHORT[Math.floor(r() * MESSAGES_C_SHORT.length)];
      } else {
        newActual = clampActual(prevActual + 0.12 + r() * 0.20);
        message = MESSAGES_C_LONG[Math.floor(r() * MESSAGES_C_LONG.length)];
      }
    }

    list.push({ startMs: t, type, newExpected, newActual, message });
    prevExpected = newExpected;
    prevActual = newActual;
    const calm = CALM_MIN_MS + r() * CALM_RANGE_MS;
    t += TYPE_PHASES[type].duration + calm;
  }
  return list;
}

export default function HorizonLoop() {
  const [, setTick] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const [dragNorm, setDragNorm] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);

  const startRef = useRef<number | null>(null);
  const reducedRef = useRef(false);
  const figureRef = useRef<HTMLElement | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef(false);

  const events = useMemo(() => buildEvents(), []);

  // IntersectionObserver — start everything once the figure enters viewport.
  useEffect(() => {
    if (typeof window === "undefined") return;
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const el = figureRef.current;
    if (!el) {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // rAF loop — runs once entered.
  useEffect(() => {
    if (!hasEntered) return;
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
  }, [hasEntered]);

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

  // Time accounting
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  if (startRef.current === null && hasEntered && !reducedRef.current) {
    startRef.current = now;
  }
  const elapsed = startRef.current === null ? 0 : now - startRef.current;
  const isDragging = dragNorm !== null;

  // Intro progress
  const introT = reducedRef.current
    ? 1
    : Math.min(1, elapsed / INTRO_DURATION_MS);

  const introSingleLine = ramp(elapsed, INTRO_PHASE.singleLine[0], INTRO_PHASE.singleLine[1]);
  const introTHHeader = ramp(elapsed, INTRO_PHASE.thHeader[0], INTRO_PHASE.thHeader[1]);
  const introSplit = ramp(elapsed, INTRO_PHASE.split[0], INTRO_PHASE.split[1]);
  const introLineLabels = ramp(elapsed, INTRO_PHASE.lineLabels[0], INTRO_PHASE.lineLabels[1]);
  const introStratBlock = ramp(elapsed, INTRO_PHASE.stratBlock[0], INTRO_PHASE.stratBlock[1]);
  const introDone = introT >= 1;

  // Find active or last-completed event
  let activeIdx = -1;
  let lastIdx = -1;
  if (introDone || reducedRef.current) {
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (elapsed >= e.startMs && elapsed < e.startMs + TYPE_PHASES[e.type].duration) {
        activeIdx = i;
        break;
      }
      if (elapsed >= e.startMs + TYPE_PHASES[e.type].duration) {
        lastIdx = i;
      }
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
    const prevE = lastEvent ? lastEvent.newExpected : EXPECTED_INITIAL;
    const prevA = lastEvent ? lastEvent.newActual : ACTUAL_INITIAL;

    if (activeEvent.type === "A") {
      const ph = TYPE_PHASES.A;
      const eShift = ease(ramp(eventT, ph.expectedShift[0], ph.expectedShift[1]));
      scheduledExpected = lerp(prevE, activeEvent.newExpected, eShift);
      scheduledActual = prevA;
    } else if (activeEvent.type === "B") {
      const ph = TYPE_PHASES.B;
      scheduledExpected = prevE;
      const aShift = ease(ramp(eventT, ph.actualEase[0], ph.actualEase[1]));
      scheduledActual = lerp(prevA, activeEvent.newActual, aShift);
    } else {
      const ph = TYPE_PHASES.C;
      const eShift = ease(ramp(eventT, ph.expectedShift[0], ph.expectedShift[1]));
      scheduledExpected = lerp(prevE, activeEvent.newExpected, eShift);
      const aShift = ease(ramp(eventT, ph.actualEase[0], ph.actualEase[1]));
      scheduledActual = lerp(prevA, activeEvent.newActual, aShift);
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
  const newActualX = activeEvent ? LINE_X1 + activeEvent.newActual * LINE_W : actualX;

  const showEventVisuals = !isDragging && introDone;

  // Type-specific computations
  type TypeVisual = {
    expectedWaves: Array<{ r: number; opacity: number }>;
    actualWaves: Array<{ r: number; opacity: number }>;
    informsT: number;          // 0..1 NEW informs arrow draw
    influencesT: number;       // 0..1 NEW influences arrow draw
    stratPulse: { r: number; opacity: number } | null;
    oldInformsAlpha: number;
    oldInfluencesAlpha: number;
    landingFlash: { r: number; opacity: number } | null;
  };
  const v: TypeVisual = {
    expectedWaves: [],
    actualWaves: [],
    informsT: 0,
    influencesT: 0,
    stratPulse: null,
    oldInformsAlpha: 0,
    oldInfluencesAlpha: 0,
    landingFlash: null,
  };

  // Helper for waves
  const computeWaves = (start: number, duration: number, count = 3) => {
    const out: Array<{ r: number; opacity: number } | null> = [];
    for (let i = 0; i < count; i++) {
      const delay = i * 280;
      const localMs = eventT - start - delay;
      if (localMs < 0 || localMs > duration) {
        out.push(null);
        continue;
      }
      const wt = localMs / duration;
      out.push({ r: 6 + wt * 30, opacity: Math.max(0, 0.7 * (1 - wt)) });
    }
    return out.filter((w): w is { r: number; opacity: number } => w !== null);
  };

  if (activeEvent && showEventVisuals) {
    if (activeEvent.type === "A") {
      const ph = TYPE_PHASES.A;
      v.expectedWaves = computeWaves(ph.waveExpected[0], 1100);
      v.informsT = ramp(eventT, ph.informsArrow[0], ph.informsArrow[1]);
      const sT = ramp(eventT, ph.strategyPulse[0], ph.strategyPulse[1]);
      v.stratPulse = sT > 0 && sT < 1
        ? { r: STRAT_RING_R + sT * 18, opacity: Math.max(0, 0.7 * (1 - sT)) }
        : null;
      v.oldInformsAlpha = 1 - ramp(eventT, ph.oldInformsFade[0], ph.oldInformsFade[1]);
    } else if (activeEvent.type === "B") {
      const ph = TYPE_PHASES.B;
      // INK waves on actual line at the new actual position
      v.actualWaves = computeWaves(ph.waveActual[0], 1100);
    } else {
      // C
      const ph = TYPE_PHASES.C;
      v.expectedWaves = computeWaves(ph.waveExpected[0], 1100);
      v.informsT = ramp(eventT, ph.informsArrow[0], ph.informsArrow[1]);
      const sT = ramp(eventT, ph.strategyPulse[0], ph.strategyPulse[1]);
      v.stratPulse = sT > 0 && sT < 1
        ? { r: STRAT_RING_R + sT * 18, opacity: Math.max(0, 0.7 * (1 - sT)) }
        : null;
      v.influencesT = ramp(eventT, ph.influencesArrow[0], ph.influencesArrow[1]);
      v.oldInformsAlpha = 1 - ramp(eventT, ph.oldInformsFade[0], ph.oldInformsFade[1]);
      v.oldInfluencesAlpha = 1 - ramp(eventT, ph.oldInfluencesFade[0], ph.oldInfluencesFade[1]);
      const flashT = ramp(eventT, ph.influencesArrow[1] - 100, ph.influencesArrow[1] + 400);
      v.landingFlash = flashT > 0 && flashT < 1
        ? { r: 12, opacity: Math.max(0, 0.7 * (1 - flashT)) }
        : null;
    }
  }

  // Persistent old arrow alphas at calm (no active event)
  // For A and C: old informs anchor = lastEvent.newExpected (frozen)
  // For B and idle: old informs anchor = lastEvent.newExpected too
  const oldInformsAnchor = isDragging
    ? expectedNorm
    : lastEvent
      ? lastEvent.newExpected
      : null;
  const oldInformsAlphaResolved = isDragging
    ? 1
    : activeEvent && lastEvent && (activeEvent.type === "A" || activeEvent.type === "C")
      ? v.oldInformsAlpha
      : lastEvent
        ? 1
        : 0;

  // Old influences arrow:
  // - For C: anchored at lastEvent.newActual, fades per phase
  // - For B: arrow's endpoint follows live actual (no old arrow)
  // - For A: anchored at lastEvent.newActual (frozen)
  // - Idle: anchored at lastEvent.newActual
  let inkArrowAnchor: number | null = null;
  let inkArrowAlpha = 0;
  if (lastEvent) {
    if (activeEvent && activeEvent.type === "C") {
      inkArrowAnchor = lastEvent.newActual;
      inkArrowAlpha = v.oldInfluencesAlpha;
    } else if (activeEvent && activeEvent.type === "B") {
      // The "old" ink arrow's endpoint follows actual as it eases — not frozen.
      inkArrowAnchor = scheduledActual;
      inkArrowAlpha = 1;
    } else {
      // A or idle: frozen at lastEvent.newActual
      inkArrowAnchor = lastEvent.newActual;
      inkArrowAlpha = 1;
    }
  }

  // Banner state
  const bannerEvent = activeEvent ?? lastEvent;
  const bannerText = bannerEvent ? bannerEvent.message : "";
  // Crossfade: when an event begins, briefly fade out (we still show last event's text)
  // then fade in with new text.
  let bannerAlpha = 1;
  let bannerDisplayText = bannerText;
  if (activeEvent && lastEvent && eventT < 700) {
    if (eventT < 300) {
      bannerAlpha = 1 - eventT / 300;
      bannerDisplayText = lastEvent.message;
    } else {
      bannerAlpha = (eventT - 300) / 400;
      bannerDisplayText = activeEvent.message;
    }
  }

  // Pre-split single line geometry — visible during intro before split completes
  const introActualY = lerp(SPLIT_MID_Y, ACTUAL_Y, ease(introSplit));
  const introExpectedY = lerp(SPLIT_MID_Y, EXPECTED_Y, ease(introSplit));

  return (
    <figure className="hl-figure" ref={figureRef as React.RefObject<HTMLElement>}>
      <div className="hl-canvas">
        <svg
          ref={svgRef}
          className="hl-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Decision strategy on the left, time horizon on the right with two parallel lines for actual and expected. Events fire on a loop with a banner explaining each one. Drag the expected pin."
        >
          {/* Headers */}
          <text
            x={STRAT_HEADER_X}
            y={HEADER_Y}
            className="hl-strategy-name"
            opacity={introStratBlock}
          >
            DECISION STRATEGY
          </text>
          <text
            x={LINE_X2}
            y={HEADER_Y}
            textAnchor="end"
            className="hl-strategy-name"
            opacity={introTHHeader}
          >
            TIME HORIZON
          </text>

          {/* Two parallel time lines (animated apart from a single line) */}
          <line
            x1={LINE_X1}
            y1={introActualY}
            x2={LINE_X2}
            y2={introActualY}
            className="hl-line-actual"
            opacity={introSingleLine}
          />
          <line
            x1={LINE_X1}
            y1={introExpectedY}
            x2={LINE_X2}
            y2={introExpectedY}
            className="hl-line-expected"
            opacity={introSplit}
          />
          <text
            x={LINE_X2 + 10}
            y={ACTUAL_Y + 4}
            className="hl-line-label hl-line-label--strong"
            opacity={introLineLabels}
          >
            ACTUAL
          </text>
          <text
            x={LINE_X2 + 10}
            y={EXPECTED_Y + 4}
            className="hl-line-label"
            opacity={introLineLabels}
          >
            EXPECTED
          </text>

          {/* Strategy anchor */}
          <g opacity={introStratBlock}>
            <circle
              cx={STRAT_NODE_X}
              cy={STRAT_NODE_Y}
              r={STRAT_RING_R}
              fill="#ffffff"
              stroke="#0a0a0a"
              strokeWidth="1.5"
            />
            <circle cx={STRAT_NODE_X} cy={STRAT_NODE_Y} r={STRAT_DOT_R} fill="#0a0a0a" />
          </g>
          {v.stratPulse && (
            <circle
              cx={STRAT_NODE_X}
              cy={STRAT_NODE_Y}
              r={v.stratPulse.r}
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="1.2"
              opacity={v.stratPulse.opacity}
            />
          )}

          {/* Concentric BLUE waves at the new Expected dot (Type A and C) */}
          {v.expectedWaves.map((w, i) => (
            <circle
              key={`ewave-${activeIdx}-${i}`}
              cx={newExpectedX}
              cy={EXPECTED_Y}
              r={w.r}
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="1.2"
              opacity={w.opacity}
            />
          ))}

          {/* Concentric INK waves at the new Actual dot (Type B) */}
          {v.actualWaves.map((w, i) => (
            <circle
              key={`awave-${activeIdx}-${i}`}
              cx={newActualX}
              cy={ACTUAL_Y}
              r={w.r}
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="1.2"
              opacity={w.opacity}
            />
          ))}

          {/* OLD informs arrow — persistent (always present once an event has happened) */}
          {introDone && oldInformsAnchor !== null && oldInformsAlphaResolved > 0 && (
            <>
              <path
                d={buildInformsPath(oldInformsAnchor, 1)}
                className="hl-arc-informs-blue"
                opacity={oldInformsAlphaResolved}
              />
              <ArrowTip
                x={INFORMS_END_X}
                y={INFORMS_END_Y}
                targetX={STRAT_NODE_X}
                targetY={STRAT_NODE_Y}
                color="#1e3a8a"
                opacity={oldInformsAlphaResolved}
              />
            </>
          )}

          {/* NEW informs arrow (Type A or C) */}
          {v.informsT > 0 && activeEvent && (
            <>
              <path
                d={buildInformsPath(activeEvent.newExpected, v.informsT)}
                className="hl-arc-informs-blue"
              />
              {v.informsT >= 0.99 && (
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

          {/* Persistent ink influences arrow */}
          {introDone && inkArrowAnchor !== null && inkArrowAlpha > 0 && (
            <>
              <path
                d={buildInfluencesPath(inkArrowAnchor, 1)}
                className="hl-arc-influences-ink"
                opacity={inkArrowAlpha}
              />
              <ArrowTip
                x={LINE_X1 + inkArrowAnchor * LINE_W}
                y={ACTUAL_Y - INFL_END_DY}
                targetX={LINE_X1 + inkArrowAnchor * LINE_W}
                targetY={ACTUAL_Y}
                color="#0a0a0a"
                opacity={inkArrowAlpha}
              />
            </>
          )}

          {/* NEW influences arrow (Type C only) */}
          {v.influencesT > 0 && activeEvent && (
            <>
              <path
                d={buildInfluencesPath(activeEvent.newActual, v.influencesT)}
                className="hl-arc-influences-ink"
              />
              {v.influencesT >= 0.99 && (
                <ArrowTip
                  x={LINE_X1 + activeEvent.newActual * LINE_W}
                  y={ACTUAL_Y - INFL_END_DY}
                  targetX={LINE_X1 + activeEvent.newActual * LINE_W}
                  targetY={ACTUAL_Y}
                  color="#0a0a0a"
                />
              )}
            </>
          )}

          {/* Landing flash on Actual marker */}
          {v.landingFlash && (
            <circle
              cx={newActualX}
              cy={ACTUAL_Y}
              r={v.landingFlash.r}
              fill="none"
              stroke="#0a0a0a"
              strokeWidth="1.2"
              opacity={v.landingFlash.opacity}
            />
          )}

          {/* Expected pin — draggable */}
          <g
            className={
              "hl-expected-marker" +
              (hovered || isDragging ? " hl-expected-marker--active" : "")
            }
            opacity={introSplit}
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
          <g opacity={introSplit}>
            <line
              x1={actualX}
              y1={ACTUAL_Y - 12}
              x2={actualX}
              y2={ACTUAL_Y + 12}
              className="hl-pin-tick-actual"
            />
            <circle cx={actualX} cy={ACTUAL_Y} r={6} className="hl-pin-dot-actual" />
          </g>

          {/* Banner */}
          {bannerDisplayText && (
            <text
              x={VIEW_W / 2}
              y={BANNER_Y}
              textAnchor="middle"
              className="hl-banner"
              opacity={bannerAlpha}
            >
              {bannerDisplayText}
            </text>
          )}
        </svg>
      </div>
    </figure>
  );
}

/** Manual arrowhead — small triangle rotated to point at a target dot. */
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
