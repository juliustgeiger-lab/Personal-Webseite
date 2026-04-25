"use client";

// The cursive word "unwritten" is rendered as a single SVG <text> in
// Sacramento. The handwriting feel comes from a *mask*: a hand-drawn pen
// path (a zigzag that travels through each letter's territory at the right
// rhythm). The path's stroke is animated with stroke-dashoffset, and is
// thick enough that as it draws, it reveals the text underneath, like ink
// being put down by a pen. pathLength=100 normalizes timing across speeds.

const PEN_PATH =
  "M -50 130 L 70 130 L 100 195 L 140 105 L 175 195 L 215 105 L 255 195 L 295 105 L 335 195 L 365 55 L 405 195 L 440 55 L 475 195 L 515 130 L 545 105 L 580 195 L 620 105 L 655 195 L 760 175";

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
