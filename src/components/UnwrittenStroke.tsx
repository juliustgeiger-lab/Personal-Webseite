"use client";

// The cursive word "unwritten" is rendered as a single SVG <text> in
// Sacramento. The handwriting feel comes from a *mask*: a hand-drawn pen
// path (a zigzag that travels through each letter's territory at the right
// rhythm). The path's stroke is animated with stroke-dashoffset, and is
// thick enough that as it draws, it reveals the text underneath, like ink
// being put down by a pen. pathLength=100 normalizes timing across speeds.

// Cubic bezier curves through the same waypoints as the original zigzag, but
// with horizontal-tangent control points (S commands auto-reflect) so the pen
// transitions smoothly between letters — no sharp corners, no perceived
// "lifting and restarting" between strokes.
const PEN_PATH =
  "M -50 130 C -10 130 30 130 70 130 S 90 195 100 195 S 130 105 140 105 S 165 195 175 195 S 205 105 215 105 S 245 195 255 195 S 285 105 295 105 S 325 195 335 195 S 355 55 365 55 S 395 195 405 195 S 430 55 440 55 S 465 195 475 195 S 505 130 515 130 S 535 105 545 105 S 570 195 580 195 S 610 105 620 105 S 645 195 655 195 S 725 175 760 175";

export default function UnwrittenStroke() {
  return (
    <svg
      className="uw-svg"
      viewBox="0 0 720 220"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <mask
          id="uw-pen-mask"
          maskUnits="userSpaceOnUse"
          x="-100"
          y="-100"
          width="920"
          height="420"
        >
          <rect x="-100" y="-100" width="920" height="420" fill="black" />
          <path
            className="uw-pen-path"
            d={PEN_PATH}
            fill="none"
            stroke="white"
            strokeWidth="240"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="100"
          />
        </mask>
      </defs>
      <text
        className="uw-text"
        x="360"
        y="170"
        textAnchor="middle"
        fontSize="180"
        mask="url(#uw-pen-mask)"
      >
        unwritten
      </text>
    </svg>
  );
}
