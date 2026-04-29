"use client";

import { useEffect, useRef } from "react";

type Theme = "light" | "dark";

const PALETTES: Record<Theme, {
  bg: string; grid: string; text: string; past: string;
  dot: string; dotStroke: string; glow: string; futures: string;
}> = {
  dark:  { bg: "#000",     grid: "#1a1f2a", text: "#5a6270", past: "#4DA3FF", dot: "#BFD9FF", dotStroke: "#4DA3FF", glow: "#7FB6FF", futures: "#9BB3CC" },
  light: { bg: "#ffffff",  grid: "#ececec", text: "#9ca0a6", past: "#1f6fd6", dot: "#1f6fd6", dotStroke: "#1f6fd6", glow: "#5a9bff", futures: "#5a6270" },
};

const NS = "http://www.w3.org/2000/svg";

function el<T extends SVGElement>(tag: string, attrs: Record<string, string | number> = {}) {
  const e = document.createElementNS(NS, tag) as unknown as T;
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  return e;
}

function smoothPath(xs: number[], ys: number[]) {
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const p0 = i > 0 ? [xs[i - 1], ys[i - 1]] : [xs[i], ys[i]];
    const p1 = [xs[i], ys[i]];
    const p2 = [xs[i + 1], ys[i + 1]];
    const p3 = i + 2 < xs.length ? [xs[i + 2], ys[i + 2]] : p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0]} ${p2[1].toFixed(2)}`;
  }
  return d;
}

export default function PossibleFutures({
  theme = "light",
  className,
}: {
  theme?: Theme;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const C = PALETTES[theme];
    const W = 680, H = 360;
    const padL = 40, padR = 40, padT = 40, padB = 40;
    const splitX = 300;
    const xStart = padL, xEnd = W - padR;
    const yMid = H / 2;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = `pf-${Math.random().toString(36).slice(2, 8)}`;

    const defs = el<SVGDefsElement>("defs");
    defs.innerHTML = `
      <radialGradient id="${id}-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${C.glow}" stop-opacity="1"/>
        <stop offset="35%" stop-color="${C.glow}" stop-opacity="0.55"/>
        <stop offset="70%" stop-color="${C.glow}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${C.glow}" stop-opacity="0"/>
      </radialGradient>`;
    svg.appendChild(defs);

    const grid = el<SVGGElement>("g", { stroke: C.grid, "stroke-width": "0.5" });
    for (let i = 1; i < 4; i++) {
      const y = padT + (H - padT - padB) * i / 4;
      grid.appendChild(el("line", { x1: xStart, x2: xEnd, y1: y, y2: y }));
    }
    for (let i = 1; i < 4; i++) {
      const x = xStart + (xEnd - xStart) * i / 4;
      grid.appendChild(el("line", { x1: x, x2: x, y1: padT, y2: H - padB }));
    }
    svg.appendChild(grid);

    const axes = el<SVGGElement>("g", {
      "font-family": "-apple-system, system-ui, sans-serif",
      "font-size": "11",
      fill: C.text,
    });
    [
      { x: xStart, y: H - padB + 18, t: "past", a: "start" },
      { x: splitX, y: H - padB + 18, t: "now", a: "middle" },
      { x: xEnd, y: H - padB + 18, t: "futures", a: "end" },
    ].forEach((l) => {
      const t = el<SVGTextElement>("text", { x: l.x, y: l.y, "text-anchor": l.a });
      t.textContent = l.t;
      axes.appendChild(t);
    });
    svg.appendChild(axes);

    const pastXs: number[] = [], pastYs: number[] = [];
    const pastPts = 80;
    for (let i = 0; i <= pastPts; i++) {
      const t = i / pastPts;
      const x = xStart + (splitX - xStart) * t;
      const y = yMid
        + Math.sin(t * 8.2 + 0.4) * 18
        + Math.sin(t * 16.7 + 1.1) * 6
        + Math.sin(t * 3.3) * 6
        - t * 4;
      pastXs.push(x); pastYs.push(y);
    }
    const pastEndY = pastYs[pastYs.length - 1];
    const past = el<SVGPathElement>("path", {
      fill: "none", stroke: C.past, "stroke-width": "2.2",
      "stroke-linecap": "round", "stroke-linejoin": "round",
      d: smoothPath(pastXs, pastYs),
    });
    svg.appendChild(past);

    const futuresG = el<SVGGElement>("g", {
      fill: "none", stroke: C.futures, "stroke-width": "1",
      "stroke-linecap": "round", opacity: "0",
    });
    const N = 16;
    const futurePts = 70;
    for (let k = 0; k < N; k++) {
      const xs: number[] = [], ys: number[] = [];
      const phase = Math.random() * Math.PI * 2;
      const phase2 = Math.random() * Math.PI * 2;
      const freq = 3 + Math.random() * 5;
      const freq2 = 8 + Math.random() * 9;
      const amp = 16 + Math.random() * 22;
      const amp2 = 5 + Math.random() * 9;
      const launchAngle = (Math.random() - 0.5) * 0.8;
      const launchSpeed = 60 + Math.random() * 80;
      const drift = (Math.random() - 0.5) * 70;
      for (let i = 0; i <= futurePts; i++) {
        const t = i / futurePts;
        const spread = 0.22 + 0.78 * Math.pow(t, 0.65);
        const launchY = Math.sin(launchAngle) * launchSpeed * t;
        const y = pastEndY
          + launchY
          + Math.sin(t * freq + phase) * amp * spread
          + Math.sin(t * freq2 + phase2) * amp2 * spread
          + drift * Math.pow(t, 1.4) * 0.7;
        xs.push(splitX + (xEnd - splitX) * t);
        ys.push(y);
      }
      const p = el("path", {
        d: smoothPath(xs, ys),
        "stroke-dasharray": "2 4",
        opacity: (0.22 + Math.random() * 0.28).toFixed(2),
      });
      futuresG.appendChild(p);
    }
    svg.appendChild(futuresG);

    const glow = el<SVGCircleElement>("circle", {
      cx: splitX, cy: pastEndY, r: "32",
      fill: `url(#${id}-glow)`, opacity: "0",
      style: "transform-box: fill-box; transform-origin: center;",
    });
    const now = el<SVGCircleElement>("circle", {
      cx: splitX, cy: pastEndY, r: "3.5",
      fill: C.dot, stroke: C.dotStroke, "stroke-width": "1", opacity: "0",
    });
    svg.appendChild(glow);
    svg.appendChild(now);

    if (reduced) {
      futuresG.setAttribute("opacity", "1");
      glow.setAttribute("opacity", "1");
      now.setAttribute("opacity", "1");
      return;
    }

    const len = past.getTotalLength();
    past.setAttribute("stroke-dasharray", `${len} ${len}`);
    past.setAttribute("stroke-dashoffset", String(len));
    past.animate(
      [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
      { duration: 1600, easing: "cubic-bezier(.6,.05,.3,1)", fill: "forwards" }
    );
    const t1 = window.setTimeout(() => {
      glow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, fill: "forwards" });
      now.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: "forwards", delay: 100 });
      glow.animate(
        [
          { offset: 0, opacity: 1, transform: "scale(1)" },
          { offset: 0.28, opacity: 0.4, transform: "scale(0.78)" },
          { offset: 1, opacity: 1, transform: "scale(1)" },
        ],
        { duration: 4200, iterations: Infinity, delay: 800, easing: "ease-in-out" }
      );
    }, 1500);
    const t2 = window.setTimeout(() => {
      futuresG.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1400, fill: "forwards" });
    }, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [theme]);

  const C = PALETTES[theme];
  return (
    <figure
      className={className}
      style={{ background: C.bg, borderRadius: 12, overflow: "hidden", margin: 0 }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 680 360"
        width="100%"
        style={{ display: "block" }}
        role="img"
        aria-label="A solid line representing the past splits into many ghosted lines representing possible futures."
      />
    </figure>
  );
}
