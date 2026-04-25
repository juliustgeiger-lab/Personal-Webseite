"use client";

// Renders the cursive word "unwritten" as a single SVG <text> whose stroke
// outline is animated with stroke-dashoffset — so the whole word is drawn as
// one continuous line, with cursive ligatures intact. Fill is held at 0 while
// the stroke is being drawn, then fades in once the line is complete (the ink
// "settles"), then fades out as it dries.

export default function UnwrittenStroke() {
  return (
    <svg
      className="uw-svg"
      viewBox="0 0 720 220"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <text
        className="uw-text"
        x="360"
        y="170"
        textAnchor="middle"
        fontSize="180"
      >
        unwritten
      </text>
    </svg>
  );
}
