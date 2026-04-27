import type { ReactNode } from "react";

/**
 * EssayFigure — the canonical wrapper for any in-essay figure.
 *
 * Mirrors the look of `.fs-wrap` (FuturesSimulation): bordered box, generous
 * padding, optional mono-caps eyebrow above and a soft caption below.
 * Stays a server component so plain SVG figures don't pay for "use client".
 *
 * Anatomy:
 *   ┌─ EssayFigure ────────────────────────────────┐
 *   │ § FIG 02 — HORIZON                eyebrow    │
 *   │                                              │
 *   │       [ child SVG / interactive ]            │
 *   │                                              │
 *   │ ───── controls ─────                         │
 *   │ caption text in soft ink                     │
 *   └──────────────────────────────────────────────┘
 */
export type EssayFigureProps = {
  /** Mono-caps eyebrow, top-left (e.g. "§ Fig 02 — Horizon"). */
  label?: string;
  /** Optional caption rendered below the figure body in soft ink. */
  caption?: ReactNode;
  /** Optional controls slot (chips, buttons) rendered between body and caption. */
  controls?: ReactNode;
  /** The figure body itself — usually an SVG or a self-contained component. */
  children: ReactNode;
  /** Tone variant — "light" (default, white card) or "dark" (ink card). */
  tone?: "light" | "dark";
  /** Optional className passthrough for one-off overrides. */
  className?: string;
};

export default function EssayFigure({
  label,
  caption,
  controls,
  children,
  tone = "light",
  className,
}: EssayFigureProps) {
  const cls = [
    "ef-wrap",
    tone === "dark" ? "ef-wrap--dark" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure className={cls}>
      {label && <span className="ef-label mono-up">{label}</span>}
      <div className="ef-body">{children}</div>
      {controls && <div className="ef-controls">{controls}</div>}
      {caption && <figcaption className="ef-caption">{caption}</figcaption>}
    </figure>
  );
}
