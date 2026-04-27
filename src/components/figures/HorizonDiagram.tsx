"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EssayFigure from "./EssayFigure";

/**
 * HorizonDiagram — outcome view.
 *
 * A horizontal time axis. NOW dot on the left. Two markers — Expected (E) and
 * Actual (A) — drift through bounded sine-driven ambient motion, so the
 * relationship is always alive without ever pestering the reader. The reader
 * can grab either marker and drag it; releasing returns to ambient drift
 * after a short hold.
 *
 * The strategy band lives between NOW and E (calibrated for the expected
 * horizon). The hatched slice between min(E, A) and max(E, A) is the
 * misallocation — strategy spent on a horizon that didn't materialise, or a
 * horizon you never planned for.
 *
 * Visual grammar: hairline strokes, fountain-pen blue for the strategy
 * (the thing being calibrated, "in motion"), mono caps for axis labels,
 * cubic ease for any transitions. Respects prefers-reduced-motion.
 */

const VIEW_W = 760;
const VIEW_H = 220;
const PAD_L = 48;
const PAD_R = 48;
const AXIS_Y = 132;
const TRACK_W = VIEW_W - PAD_L - PAD_R;

// Ambient drift bounds — Expected stays in the longer half, Actual is more
// volatile (the world is messier than your plan).
const E_MID = 0.74;
const E_AMP = 0.13;
const A_MID = 0.50;
const A_AMP = 0.24;
// Different angular frequencies so the two markers never lock in step.
const E_OMEGA = 0.20;
const A_OMEGA = 0.27;
const A_PHASE = 1.6;

// After release, the figure waits this long before easing back into ambient.
const RESUME_AFTER_MS = 1800;
// Approach speed of ambient targets (per-frame ease factor).
const APPROACH = 0.06;

type DragKind = "e" | "a" | null;

function clamp01ish(x: number) {
  return Math.max(0.04, Math.min(0.96, x));
}

export default function HorizonDiagram() {
  const [eVal, setEVal] = useState(0.78);
  const [aVal, setAVal] = useState(0.42);
  const [hovered, setHovered] = useState<DragKind>(null);
  const [dragging, setDragging] = useState<DragKind>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const startRef = useRef<number | null>(null);
  const lastDragAtRef = useRef<number>(-Infinity);
  const draggingRef = useRef<DragKind>(null);
  const eRef = useRef(0.78);
  const aRef = useRef(0.42);

  // Keep refs synchronised with state for use inside the rAF loop.
  draggingRef.current = dragging;
  eRef.current = eVal;
  aRef.current = aVal;

  // Single rAF loop drives ambient drift. The loop only writes state when
  // dragging is null; when dragging, the pointer handlers control the values.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    let raf = 0;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const tSec = (now - startRef.current) / 1000;

      if (draggingRef.current === null) {
        const sinceDragMs = now - lastDragAtRef.current;
        const blend = Math.min(1, Math.max(0, sinceDragMs - 200) / RESUME_AFTER_MS);
        const eAmbient = E_MID + E_AMP * Math.sin(tSec * E_OMEGA);
        const aAmbient = A_MID + A_AMP * Math.sin(tSec * A_OMEGA + A_PHASE);
        const newE = eRef.current + (eAmbient - eRef.current) * APPROACH * blend;
        const newA = aRef.current + (aAmbient - aRef.current) * APPROACH * blend;
        // Avoid microscopic state churn when blend is 0.
        if (Math.abs(newE - eRef.current) > 1e-5) setEVal(newE);
        if (Math.abs(newA - aRef.current) > 1e-5) setAVal(newA);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Convert pointer x to normalised position along the track.
  const pointerToNorm = useCallback((clientX: number): number => {
    const svg = svgRef.current;
    if (!svg) return 0.5;
    const rect = svg.getBoundingClientRect();
    const xRel = (clientX - rect.left) / rect.width;
    const xView = xRel * VIEW_W;
    return clamp01ish((xView - PAD_L) / TRACK_W);
  }, []);

  const onPointerDown = (which: "e" | "a") => (ev: React.PointerEvent) => {
    setDragging(which);
    (ev.target as Element).setPointerCapture?.(ev.pointerId);
    ev.preventDefault();
  };

  const onPointerMove = (ev: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const norm = pointerToNorm(ev.clientX);
    if (draggingRef.current === "e") setEVal(norm);
    else setAVal(norm);
  };

  const endDrag = (ev?: React.PointerEvent) => {
    if (draggingRef.current) {
      lastDragAtRef.current = performance.now();
      setDragging(null);
      if (ev) (ev.target as Element).releasePointerCapture?.(ev.pointerId);
    }
  };

  const nowX = PAD_L;
  const eX = PAD_L + eVal * TRACK_W;
  const aX = PAD_L + aVal * TRACK_W;
  const minX = Math.min(eX, aX);
  const maxX = Math.max(eX, aX);

  const eActive = hovered === "e" || dragging === "e";
  const aActive = hovered === "a" || dragging === "a";

  return (
    <EssayFigure
      label="§ Fig 1 — Horizon: expected and actual"
      caption="The strategy lives between now and the horizon you expect. The hatch is the slice that got mismapped — strategy calibrated to a timeframe that never arrived, or a timeframe you never planned for."
    >
      <div className="hd-canvas">
        <svg
          ref={svgRef}
          className="hd-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Time axis with two draggable markers, expected and actual horizon. The strategy band runs from now to expected; the hatched slice between expected and actual is the misallocation."
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <pattern
              id="hd-hatch"
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#1e3a8a" strokeWidth="1" opacity="0.45" />
            </pattern>
            <pattern
              id="hd-hatch-faint"
              patternUnits="userSpaceOnUse"
              width="6"
              height="6"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="#0a0a0a" strokeWidth="1" opacity="0.18" />
            </pattern>
          </defs>

          {/* Time axis: solid up to the further of the two markers, ghosted after */}
          <line
            x1={nowX}
            y1={AXIS_Y}
            x2={Math.max(maxX, PAD_L + 8)}
            y2={AXIS_Y}
            stroke="#0a0a0a"
            strokeWidth="1"
          />
          <line
            x1={Math.max(maxX, PAD_L + 8)}
            y1={AXIS_Y}
            x2={PAD_L + TRACK_W}
            y2={AXIS_Y}
            stroke="#0a0a0a"
            strokeWidth="1"
            strokeDasharray="2 4"
            opacity={0.25}
          />

          {/* Misallocation hatch — between min and max of E, A */}
          {Math.abs(eX - aX) > 0.5 && (
            <rect
              x={minX}
              y={AXIS_Y - 14}
              width={maxX - minX}
              height={28}
              fill={aX < eX ? "url(#hd-hatch)" : "url(#hd-hatch-faint)"}
            />
          )}

          {/* Strategy band: NOW → E (calibrated for the expected horizon) */}
          <rect
            x={nowX}
            y={AXIS_Y - 5}
            width={Math.max(0, eX - nowX)}
            height={10}
            rx={5}
            fill="#1e3a8a"
            opacity={0.55}
          />
          {/* Realised portion: NOW → min(E, A), full saturation */}
          <rect
            x={nowX}
            y={AXIS_Y - 5}
            width={Math.max(0, minX - nowX)}
            height={10}
            rx={5}
            fill="#1e3a8a"
          />

          {/* NOW dot */}
          <circle cx={nowX} cy={AXIS_Y} r={5} fill="#0a0a0a" />
          <text x={nowX} y={AXIS_Y + 32} textAnchor="middle" className="hd-axis-label">
            NOW
          </text>

          {/* Horizon end label, faint */}
          <text
            x={PAD_L + TRACK_W}
            y={AXIS_Y - 10}
            textAnchor="end"
            className="hd-axis-label hd-axis-label--faint"
          >
            HORIZON
          </text>

          {/* Expected marker — dashed tick, label above */}
          <g
            className={"hd-marker" + (eActive ? " hd-marker--active" : "")}
            transform={`translate(${eX} 0)`}
          >
            {/* Soft hover ring */}
            <circle cx={0} cy={AXIS_Y} r={16} className="hd-marker-ring" />
            <line
              x1={0}
              y1={AXIS_Y - 18}
              x2={0}
              y2={AXIS_Y + 18}
              stroke="#0a0a0a"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <text x={0} y={AXIS_Y - 26} textAnchor="middle" className="hd-axis-label">
              EXPECTED
            </text>
            {/* Chevrons signalling "this can move" */}
            <text x={-12} y={AXIS_Y + 4} textAnchor="middle" className="hd-chev">
              ‹
            </text>
            <text x={12} y={AXIS_Y + 4} textAnchor="middle" className="hd-chev">
              ›
            </text>
            {/* Invisible drag hit area */}
            <rect
              x={-14}
              y={AXIS_Y - 22}
              width={28}
              height={44}
              fill="transparent"
              className="hd-handle"
              onPointerDown={onPointerDown("e")}
              onPointerEnter={() => setHovered("e")}
              onPointerLeave={() => setHovered((h) => (h === "e" ? null : h))}
            />
          </g>

          {/* Actual marker — solid tick, label below */}
          <g
            className={"hd-marker" + (aActive ? " hd-marker--active" : "")}
            transform={`translate(${aX} 0)`}
          >
            <circle cx={0} cy={AXIS_Y} r={16} className="hd-marker-ring" />
            <line
              x1={0}
              y1={AXIS_Y - 18}
              x2={0}
              y2={AXIS_Y + 18}
              stroke="#0a0a0a"
              strokeWidth="1.5"
            />
            <text
              x={0}
              y={AXIS_Y + 32}
              textAnchor="middle"
              className="hd-axis-label hd-axis-label--strong"
            >
              ACTUAL
            </text>
            <text x={-12} y={AXIS_Y + 4} textAnchor="middle" className="hd-chev">
              ‹
            </text>
            <text x={12} y={AXIS_Y + 4} textAnchor="middle" className="hd-chev">
              ›
            </text>
            <rect
              x={-14}
              y={AXIS_Y - 22}
              width={28}
              height={44}
              fill="transparent"
              className="hd-handle"
              onPointerDown={onPointerDown("a")}
              onPointerEnter={() => setHovered("a")}
              onPointerLeave={() => setHovered((h) => (h === "a" ? null : h))}
            />
          </g>
        </svg>
      </div>
    </EssayFigure>
  );
}
