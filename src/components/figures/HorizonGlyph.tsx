/**
 * HorizonGlyph — landing-page thumbnail for the dying / horizons essay.
 *
 * The silhouette of HorizonDiagram. No labels, no motion, no interaction.
 * Reads at a glance as: "expected ≠ actual, strategy was calibrated wrong."
 *
 * Server component. Drops into `.work-card .thumb` slots.
 */
export default function HorizonGlyph() {
  // 200×120 viewBox, scales to fill the card thumb area
  const VIEW_W = 200;
  const VIEW_H = 120;
  const PAD_L = 18;
  const PAD_R = 18;
  const AXIS_Y = 70;
  const TRACK_W = VIEW_W - PAD_L - PAD_R;

  const E = PAD_L + TRACK_W * 0.78;
  const A = PAD_L + TRACK_W * 0.42;
  const minX = Math.min(E, A);
  const maxX = Math.max(E, A);

  return (
    <svg
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
      <rect
        x={minX}
        y={AXIS_Y - 9}
        width={maxX - minX}
        height={18}
        fill="url(#hg-hatch)"
      />

      {/* Strategy band, NOW → E */}
      <rect
        x={PAD_L}
        y={AXIS_Y - 3}
        width={E - PAD_L}
        height={6}
        rx={3}
        fill="#1e3a8a"
        opacity="0.75"
      />
      {/* Realised portion, NOW → A */}
      <rect
        x={PAD_L}
        y={AXIS_Y - 3}
        width={A - PAD_L}
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
