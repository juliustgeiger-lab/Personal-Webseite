import HorizonDiagram from "@/components/figures/HorizonDiagram";
import HorizonGlyph from "@/components/figures/HorizonGlyph";
import HorizonLoop from "@/components/figures/HorizonLoop";

export const metadata = {
  title: "Figures — Style Guide",
  robots: { index: false, follow: false },
};

/**
 * /figures — unlisted living style guide.
 *
 * Renders every figure component, the thumb glyphs, and a few mocked-up card
 * contexts so a designer (or future Claude design pass) can see the rules
 * running. The written rules live in docs/figures.md.
 *
 * This route is not linked from the nav. Visit it directly.
 */
export default function FiguresPreview() {
  return (
    <main className="page-wrap" style={{ maxWidth: 960 }}>
      <header style={{ marginBottom: 56 }}>
        <span className="mono-up" style={{ display: "block", marginBottom: 10 }}>
          § Style guide — Essay figures
        </span>
        <h1
          style={{
            fontSize: 40,
            letterSpacing: "-0.025em",
            fontWeight: 500,
            lineHeight: 1.05,
          }}
        >
          The figures, the glyphs, and the frame they live in.
        </h1>
        <p
          style={{
            marginTop: 18,
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--ink-soft)",
            maxWidth: "62ch",
          }}
        >
          Unlisted. The written guide is in <code>docs/figures.md</code>. This
          page renders the components live so you (or anyone designing the next
          essay&rsquo;s figure) can see the system at work.
        </p>
      </header>

      <Section
        n="01"
        title="Tokens"
        sub="The vocabulary every figure inherits."
      >
        <div className="fig-tokens">
          <Token name="--ink" hex="#0a0a0a" role="Lines, dots, body text" />
          <Token name="--ink-soft" hex="#525252" role="Captions, axis labels" />
          <Token name="--ink-faint" hex="#a3a3a3" role="Ghost lines, far horizons" />
          <Token name="--rule" hex="#ededed" role="Borders, hairlines" />
          <Token
            name="—"
            hex="#1e3a8a"
            role="Fountain-pen blue. The accent. Used only for things in motion or being written: strategy bands, typewriter fills, ripples."
            accent
          />
          <Token name="--green" hex="#10b981" role="Liveness pulses (status pill only — not in figures)" />
        </div>
      </Section>

      <Section
        n="02"
        title="Body figure — Horizon, the outcome"
        sub="Two markers — Expected and Actual — drift through bounded ambient motion. Grab either marker and drag it; releasing returns to ambient drift after a brief hold. The hatched slice between them is the misallocation."
      >
        <HorizonDiagram />
      </Section>

      <Section
        n="03"
        title="Body figure — Horizon, the causal loop"
        sub="A faithful rebuild of the original loop diagram in the site&rsquo;s grammar. Expected informs strategy; strategy influences actual. Animates through the cycle and repeats with small position variation."
      >
        <HorizonLoop />
      </Section>

      <Section
        n="04"
        title="Thumb glyph — Horizon"
        sub="The silhouette of the outcome figure. Still SVG, no labels, no motion. Reads as &lsquo;expected ≠ actual&rsquo; in &lt; 1s."
      >
        <div className="fig-glyph-row">
          <div className="fig-glyph-frame" aria-label="Glyph in isolation">
            <HorizonGlyph />
          </div>
          <p className="mono" style={{ maxWidth: "32ch" }}>
            Drop into <code>.work-card .thumb.thumb--glyph</code> for the
            landing-page card slot. ViewBox 200×120, scales to fill.
          </p>
        </div>
      </Section>

      <Section
        n="05"
        title="In context — landing-page card"
        sub="The glyph as it would render on the home page essay grid. Today the card has the [ figure 01 — slug ] placeholder; this is the proposed swap."
      >
        <MockCardGrid />
      </Section>

      <Section
        n="06"
        title="In context — /writing index"
        sub="Optional thumb prefix for the writing list. Compact (96×64) so the row stays single-line and scannable."
      >
        <MockWritingList />
      </Section>

      <Section
        n="07"
        title="Pattern — what makes a figure fit"
        sub="The rules every future essay figure should satisfy."
      >
        <div className="fig-rules">
          <Rule
            n="A"
            title="Hairline strokes only."
            body="1px to 1.5px, never thicker. The site is a quiet space; figures should not shout."
          />
          <Rule
            n="B"
            title="Blue means motion."
            body="Fountain-pen blue (#1e3a8a) only for things actively being calibrated, written, or in flux. Never for static structure. Static lines are ink."
          />
          <Rule
            n="C"
            title="Mono caps for labels."
            body="JetBrains Mono uppercase, ~9–10px, +0.12–0.14em letter-spacing. Body font is for prose, mono is for instruments."
          />
          <Rule
            n="D"
            title="Motion is restraint."
            body="Match the existing easing — cubic-bezier(0.22, 1, 0.36, 1), ~700ms transitions. No bounces, no flashes. Auto-cycle ~4–5s if there are discrete states."
          />
          <Rule
            n="E"
            title="Two registers per essay."
            body="Body figure: interactive, breathes, can carry chips and captions. Glyph: still, no labels, no motion. Same idea, different volume."
          />
          <Rule
            n="F"
            title="Reduced motion respected."
            body="Wrap any non-essential animation in @media (prefers-reduced-motion: reduce) and let it settle to the final state."
          />
        </div>
      </Section>

      {/* Lightweight inline styles — local to this preview page only */}
      <style>{`
        .fig-tokens {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .fig-token {
          display: grid;
          grid-template-columns: 36px 1fr;
          gap: 14px;
          align-items: center;
          padding: 14px 16px;
          border: 1px solid var(--rule);
          border-radius: 12px;
        }
        .fig-token .swatch {
          width: 36px; height: 36px;
          border-radius: 8px;
          border: 1px solid var(--rule);
        }
        .fig-token .name {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 11px;
          color: var(--ink);
        }
        .fig-token .role {
          font-size: 12px;
          color: var(--ink-soft);
          line-height: 1.45;
        }
        .fig-token .hex {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 10px;
          color: var(--ink-faint);
        }

        .fig-glyph-row {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
        }
        .fig-glyph-frame {
          width: 240px; height: 150px;
          border: 1px solid var(--rule);
          border-radius: 12px;
          background: var(--rule-2);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        .fig-rules {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .fig-rule {
          padding: 16px 18px;
          border: 1px solid var(--rule);
          border-radius: 12px;
        }
        .fig-rule .num {
          font-family: var(--font-jetbrains-mono), monospace;
          font-size: 11px;
          color: var(--ink-faint);
          margin-bottom: 8px;
          display: block;
        }
        .fig-rule h4 {
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 4px;
          letter-spacing: -0.01em;
        }
        .fig-rule p {
          font-size: 13px;
          line-height: 1.5;
          color: var(--ink-soft);
        }

        @media (max-width: 720px) {
          .fig-tokens, .fig-rules { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}

function Section({
  n,
  title,
  sub,
  children,
}: {
  n: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ margin: "64px 0" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingBottom: 14,
          borderBottom: "1px solid var(--rule)",
          marginBottom: 24,
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <span className="mono-up" style={{ display: "block", marginBottom: 6 }}>
            § {n} — {title}
          </span>
          {sub && (
            <p
              style={{
                fontSize: 14,
                color: "var(--ink-soft)",
                maxWidth: "62ch",
                lineHeight: 1.5,
              }}
            >
              {sub}
            </p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

function Token({
  name,
  hex,
  role,
  accent = false,
}: {
  name: string;
  hex: string;
  role: string;
  accent?: boolean;
}) {
  return (
    <div className="fig-token">
      <span
        className="swatch"
        style={{
          background: hex,
          boxShadow: accent ? "inset 0 0 0 1px rgba(255,255,255,0.3)" : undefined,
        }}
      />
      <div>
        <span className="name">{name}</span>{" "}
        <span className="hex">{hex}</span>
        <div className="role">{role}</div>
      </div>
    </div>
  );
}

function Rule({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="fig-rule">
      <span className="num">{n}</span>
      <h4>{title}</h4>
      <p>{body}</p>
    </div>
  );
}

/** Mocked-up landing-page card grid: shows current placeholder beside the
    proposed glyph swap, so the diff is visible. */
function MockCardGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 16,
      }}
    >
      <article className="work-card" style={{ cursor: "default" }}>
        <div className="thumb variant-a">
          <span className="placeholder">
            [ figure 01 — why dying is often hard but sometimes easy ]
          </span>
        </div>
        <div className="meta-row">
          <span className="proj-title">Today (placeholder)</span>
          <span className="mono">Apr 2026</span>
        </div>
        <p className="proj-desc">
          The current state — the same diagonal-hatch placeholder every essay
          card uses.
        </p>
        <div className="tags">
          <span className="tag">placeholder</span>
        </div>
      </article>

      <article className="work-card" style={{ cursor: "default" }}>
        <div className="thumb variant-a thumb--glyph">
          <HorizonGlyph />
        </div>
        <div className="meta-row">
          <span className="proj-title">
            Why dying is often hard, but sometimes easy
          </span>
          <span className="mono">Apr 2026</span>
        </div>
        <p className="proj-desc">
          On decision-making under unknown time horizons. Why some lives feel
          finished even when they end early.
        </p>
        <div className="tags">
          <span className="tag">Mortality</span>
          <span className="tag">Strategy</span>
          <span className="tag">5 min</span>
        </div>
      </article>
    </div>
  );
}

/** Mock /writing index row with optional thumb prefix. */
function MockWritingList() {
  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: 18, listStyle: "none", padding: 0 }}>
      <li>
        <a
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <span className="writing-row__thumb">
            <HorizonGlyph />
          </span>
          <span style={{ flex: 1 }}>
            <span style={{ fontSize: 11, color: "var(--ink-faint)", display: "block" }}>
              Apr 26, 2026
            </span>
            <span style={{ fontSize: 16 }}>
              Why dying is often hard, but sometimes easy
            </span>
            <span
              style={{
                display: "block",
                fontSize: 13,
                color: "var(--ink-soft)",
                marginTop: 2,
              }}
            >
              On decision-making under unknown time horizons. Why some lives
              feel finished even when they end early.
            </span>
          </span>
        </a>
      </li>
    </ul>
  );
}
