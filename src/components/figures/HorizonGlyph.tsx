"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HorizonGlyph — landing-page thumbnail for the dying / horizons essay.
 *
 * The silhouette of HorizonDiagram. Static at rest; on hover (anywhere on
 * the enclosing row / card), the Expected and Actual markers start drifting
 * via the same sine ambient as HorizonDiagram. Mouse-out eases them back to
 * their resting positions and the rAF loop idles until the next hover, so
 * a long list of rows doesn't burn frames while the user isn't interacting.
 *
 * Hover trigger is the closest <a> or <li> ancestor — that way the whole
 * card / list-row is the hot zone, not just the small SVG inside it.
 *
 * Drops into `.work-card .thumb` on the home page and the
 * `.writing-row__thumb` slot on the /writing index.
 */

const VIEW_W = 200;
const VIEW_H = 120;
const PAD_L = 18;
const PAD_R = 18;
const AXIS_Y = 70;
const TRACK_W = VIEW_W - PAD_L - PAD_R;

// Resting positions when nothing is being hovered.
const E_DEFAULT = 0.78;
const A_DEFAULT = 0.42;

// Sine drift parameters — same shape as HorizonDiagram so the thumb
// previews exactly what the body figure feels like.
const E_MID = 0.74;
const E_AMP = 0.13;
const A_MID = 0.50;
const A_AMP = 0.24;
const E_OMEGA = 0.20;
const A_OMEGA = 0.27;
const A_PHASE = 1.6;
// Ease-back factor when returning to default after mouse-leave.
const APPROACH = 0.06;

export default function HorizonGlyph() {
  const [eVal, setEVal] = useState(E_DEFAULT);
  const [aVal, setAVal] = useState(A_DEFAULT);
  const svgRef = useRef<SVGSVGElement>(null);
  const hoveredRef = useRef(false);
  const eRef = useRef(E_DEFAULT);
  const aRef = useRef(A_DEFAULT);
  eRef.current = eVal;
  aRef.current = aVal;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const svg = svgRef.current;
    if (!svg) return;
    // Whole row / card is the hover target, not just the thumb.
    const trigger =
      (svg.closest("a") as HTMLElement | null) ??
      (svg.closest("li") as HTMLElement | null) ??
      (svg.parentElement as HTMLElement | null);
    if (!trigger) return;

    let raf = 0;
    let start: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      const t = (now - start) / 1000;

      if (hoveredRef.current) {
        setEVal(E_MID + E_AMP * Math.sin(t * E_OMEGA));
        setAVal(A_MID + A_AMP * Math.sin(t * A_OMEGA + A_PHASE));
        raf = requestAnimationFrame(tick);
      } else {
        const dE = E_DEFAULT - eRef.current;
        const dA = A_DEFAULT - aRef.current;
        const settled = Math.abs(dE) < 5e-4 && Math.abs(dA) < 5e-4;
        if (settled) {
          // Snap exactly to default and idle the loop.
          if (eRef.current !== E_DEFAULT) setEVal(E_DEFAULT);
          if (aRef.current !== A_DEFAULT) setAVal(A_DEFAULT);
          raf = 0;
          start = null;
          return;
        }
        setEVal((v) => v + (E_DEFAULT - v) * APPROACH);
        setAVal((v) => v + (A_DEFAULT - v) * APPROACH);
        raf = requestAnimationFrame(tick);
      }
    };

    const onEnter = () => {
      hoveredRef.current = true;
      if (!raf) {
        start = null;
        raf = requestAnimationFrame(tick);
      }
    };
    const onLeave = () => {
      hoveredRef.current = false;
      // If the loop had idled (already at default), kick it back to life so
      // the post-hover ease-back path runs at least once.
      if (!raf) {
        start = null;
        raf = requestAnimationFrame(tick);
      }
    };

    trigger.addEventListener("mouseenter", onEnter);
    trigger.addEventListener("mouseleave", onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      trigger.removeEventListener("mouseenter", onEnter);
      trigger.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const E = PAD_L + TRACK_W * eVal;
  const A = PAD_L + TRACK_W * aVal;
  const minX = Math.min(E, A);
  const maxX = Math.max(E, A);

  return (
    <svg
      ref={svgRef}
      className="hd-glyph"
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="hg-hatch"
          patternUnits="userSpaceOnUse"
          width="5"
          height="5"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="5"
            stroke="#1e3a8a"
            strokeWidth="1"
            opacity="0.5"
          />
        </pattern>
      </defs>

      {/* Time axis */}
      <line
        x1={PAD_L}
        y1={AXIS_Y}
        x2={maxX}
        y2={AXIS_Y}
        stroke="#0a0a0a"
        strokeWidth="1"
      />
      <line
        x1={maxX}
        y1={AXIS_Y}
        x2={PAD_L + TRACK_W}
        y2={AXIS_Y}
        stroke="#0a0a0a"
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity="0.3"
      />

      {/* Misallocation slice */}
      {Math.abs(E - A) > 0.5 && (
        <rect
          x={minX}
          y={AXIS_Y - 9}
          width={maxX - minX}
          height={18}
          fill="url(#hg-hatch)"
        />
      )}

      {/* Strategy band, NOW → E */}
      <rect
        x={PAD_L}
        y={AXIS_Y - 3}
        width={Math.max(0, E - PAD_L)}
        height={6}
        rx={3}
        fill="#1e3a8a"
        opacity="0.75"
      />
      {/* Realised portion, NOW → min(E, A) */}
      <rect
        x={PAD_L}
        y={AXIS_Y - 3}
        width={Math.max(0, minX - PAD_L)}
        height={6}
        rx={3}
        fill="#1e3a8a"
      />

      {/* NOW dot */}
      <circle cx={PAD_L} cy={AXIS_Y} r={3.5} fill="#0a0a0a" />

      {/* E tick (dashed) */}
      <line
        x1={E}
        y1={AXIS_Y - 12}
        x2={E}
        y2={AXIS_Y + 12}
        stroke="#0a0a0a"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      {/* A tick (solid) */}
      <line
        x1={A}
        y1={AXIS_Y - 12}
        x2={A}
        y2={AXIS_Y + 12}
        stroke="#0a0a0a"
        strokeWidth="1.5"
      />
    </svg>
  );
}
