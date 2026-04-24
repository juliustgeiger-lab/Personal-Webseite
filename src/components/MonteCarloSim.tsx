"use client";

import { useEffect, useRef, useState } from "react";

const MAX_PATHS = 400;
const STEPS = 90;
const PATHS_PER_FRAME = 3;
const OK_HALF_BAND_FRAC = 0.15; // ±15% of canvas height counts as "ok"

export default function MonteCarloSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [count, setCount] = useState(0);
  const [okCount, setOkCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const midY = h / 2;
    const okHalf = h * OK_HALF_BAND_FRAC;

    // Draw ok-band guide rules (dashed, subtle)
    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY - okHalf);
    ctx.lineTo(w, midY - okHalf);
    ctx.moveTo(0, midY + okHalf);
    ctx.lineTo(w, midY + okHalf);
    ctx.stroke();
    ctx.restore();

    let paths = 0;
    let ok = 0;
    let raf = 0;

    const drawOne = () => {
      let y = midY;
      const stepX = w / STEPS;

      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let i = 1; i <= STEPS; i++) {
        // Sum of two uniforms → soft bell; scale 9 tunes spread
        const step = (Math.random() - 0.5 + (Math.random() - 0.5)) * 9;
        y += step;
        ctx.lineTo(i * stepX, y);
      }

      const diff = y - midY;
      const isOk = Math.abs(diff) <= okHalf;

      ctx.strokeStyle = isOk ? "rgba(10,10,10,0.11)" : "rgba(10,10,10,0.06)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // End marker
      ctx.beginPath();
      ctx.arc(w - 1, y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = isOk ? "rgba(16,185,129,0.9)" : "rgba(10,10,10,0.2)";
      ctx.fill();

      paths++;
      if (isOk) ok++;
    };

    const tick = () => {
      for (let i = 0; i < PATHS_PER_FRAME && paths < MAX_PATHS; i++) {
        drawOne();
      }
      setCount(paths);
      setOkCount(ok);
      if (paths < MAX_PATHS) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pct = count > 0 ? ((okCount / count) * 100).toFixed(1) : "0.0";

  return (
    <div className="mc-sim" aria-hidden={!done}>
      <canvas ref={canvasRef} className="mc-sim__canvas" />
      <div className="mc-sim__stats">
        <span className="mono-up">
          {count.toLocaleString()} futures simulated
        </span>
        <span className="mono-up mc-sim__pct">{pct}% ok</span>
      </div>
    </div>
  );
}
