/**
 * HorizonLoop — Fig 2: static informational diagram.
 *
 * No animation, no events, no banner. A 4MAT-style reference image that
 * tells the reader the visual vocabulary at a glance:
 *
 *   DECISION STRATEGY (left)        TIME HORIZON (right)
 *                                   ━━━━━━━●━━━━━━━━━━ ACTUAL
 *               INFLUENCES ↗
 *        ●  ←
 *               INFORMS ↙
 *                                   ─ ─ ─ ●─ ─ ─ ─ ─ ─ EXPECTED
 *
 * The expected horizon INFORMS the strategy (blue arc, curving below).
 * The strategy INFLUENCES the actual horizon (ink arc, curving above).
 *
 * The dynamic / biographic version lives in HorizonLoopStory.tsx.
 *
 * Server component — no client JS, no state, no observer. Pure SVG.
 */

const VIEW_W = 760;
const VIEW_H = 260;

// Strategy block on the left
const STRAT_TEXT_X = 30;
const STRAT_NODE_X = 180;
const STRAT_NODE_Y = 140;

// Time-horizon block on the right — long lines that fill the remaining
// width, with the marker placed so the bowtie of arcs is centred in the
// viewBox.
const LINE_X1 = 320;
const LINE_X2 = 720;
const ACTUAL_Y = 110;
const EXPECTED_Y = 170;
const MARKER_X = 560;

// Bowtie centre = (STRAT_NODE_X + MARKER_X) / 2 = 370 — close to the
// viewBox horizontal centre (380). The figure now fills the available
// width and reads as balanced rather than weighted right.

// Manual arrowhead — same triangle used elsewhere, rotated to point at
// its target dot.
const ARROW_LEN = 6;
const ARROW_HALF = 3;

function ArrowTip({
  x,
  y,
  targetX,
  targetY,
  color,
}: {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  color: string;
}) {
  const angleDeg = (Math.atan2(targetY - y, targetX - x) * 180) / Math.PI;
  return (
    <polygon
      points={`0,-${ARROW_HALF} ${ARROW_LEN},0 0,${ARROW_HALF}`}
      fill={color}
      transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angleDeg.toFixed(2)})`}
    />
  );
}

export default function HorizonLoop() {
  // Influences arc — strategy node → actual marker, curves UP.
  const inflStartX = STRAT_NODE_X + 8;
  const inflStartY = STRAT_NODE_Y - 8;
  const inflEndX = MARKER_X - 6;
  const inflEndY = ACTUAL_Y - 10;
  const inflCx = (inflStartX + inflEndX) / 2;
  const inflCy = 50;
  const influencesD = `M ${inflStartX} ${inflStartY} Q ${inflCx} ${inflCy} ${inflEndX} ${inflEndY}`;

  // Informs arc — expected marker → strategy node, curves DOWN.
  const informsStartX = MARKER_X - 6;
  const informsStartY = EXPECTED_Y + 10;
  const informsEndX = STRAT_NODE_X + 8;
  const informsEndY = STRAT_NODE_Y + 8;
  const informsCx = (informsStartX + informsEndX) / 2;
  const informsCy = 230;
  const informsD = `M ${informsStartX} ${informsStartY} Q ${informsCx} ${informsCy} ${informsEndX} ${informsEndY}`;

  return (
    <figure className="hl-figure">
      <div className="hl-canvas">
        <svg
          className="hl-svg"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="A diagram of the relationship between decision strategy and time horizon. The expected horizon informs the strategy; the strategy influences the actual horizon."
        >
          {/* Strategy block */}
          <text x={STRAT_TEXT_X} y={STRAT_NODE_Y - 8} className="hl-strategy-name">
            DECISION
          </text>
          <text x={STRAT_TEXT_X} y={STRAT_NODE_Y + 14} className="hl-strategy-name">
            STRATEGY
          </text>
          <circle
            cx={STRAT_NODE_X}
            cy={STRAT_NODE_Y}
            r={11}
            fill="#ffffff"
            stroke="#0a0a0a"
            strokeWidth="1.5"
          />
          <circle cx={STRAT_NODE_X} cy={STRAT_NODE_Y} r={4} fill="#0a0a0a" />

          {/* Time horizon header — sits centred above the two lines */}
          <text
            x={(LINE_X1 + LINE_X2) / 2}
            y={75}
            textAnchor="middle"
            className="hl-strategy-name"
          >
            TIME HORIZON
          </text>

          {/* Two parallel time lines — wider gap than the dynamic version
              for clarity in the static reference image */}
          <line x1={LINE_X1} y1={ACTUAL_Y} x2={LINE_X2} y2={ACTUAL_Y} className="hl-line-actual" />
          <line x1={LINE_X1} y1={EXPECTED_Y} x2={LINE_X2} y2={EXPECTED_Y} className="hl-line-expected" />

          {/* ACTUAL marker */}
          <line
            x1={MARKER_X}
            y1={ACTUAL_Y - 12}
            x2={MARKER_X}
            y2={ACTUAL_Y + 12}
            className="hl-pin-tick-actual"
          />
          <circle cx={MARKER_X} cy={ACTUAL_Y} r={6} className="hl-pin-dot-actual" />

          {/* EXPECTED marker */}
          <line
            x1={MARKER_X}
            y1={EXPECTED_Y - 12}
            x2={MARKER_X}
            y2={EXPECTED_Y + 12}
            className="hl-pin-tick-expected"
          />
          <circle cx={MARKER_X} cy={EXPECTED_Y} r={6} className="hl-pin-dot-expected" />

          {/* Right-end labels */}
          <text
            x={LINE_X2 + 10}
            y={ACTUAL_Y}
            className="hl-line-label hl-line-label--strong"
          >
            ACTUAL
          </text>
          <text x={LINE_X2 + 10} y={EXPECTED_Y} className="hl-line-label">
            EXPECTED
          </text>

          {/* INFLUENCES arc — Strategy → Actual */}
          <path d={influencesD} className="hl-arc-influences-ink" />
          <ArrowTip
            x={inflEndX}
            y={inflEndY}
            targetX={MARKER_X}
            targetY={ACTUAL_Y}
            color="#0a0a0a"
          />
          <text x={inflCx} y={32} textAnchor="middle" className="hl-flow-label">
            INFLUENCES
          </text>

          {/* INFORMS arc — Expected → Strategy */}
          <path d={informsD} className="hl-arc-informs-blue" />
          <ArrowTip
            x={informsEndX}
            y={informsEndY}
            targetX={STRAT_NODE_X}
            targetY={STRAT_NODE_Y}
            color="#1e3a8a"
          />
          <text x={informsCx} y={250} textAnchor="middle" className="hl-flow-label">
            INFORMS
          </text>
        </svg>
      </div>
    </figure>
  );
}
