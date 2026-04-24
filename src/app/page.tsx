import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import InvisibleWord from "@/components/InvisibleWord";

export default function Home() {
  const posts = getAllPosts().slice(0, 4);
  const essayCount = getAllPosts().length;

  return (
    <main className="home">
      <section className="hero">
        <h1 className="hero-headline">
          <span className="line">The future</span>
          <span className="line">is an</span>
          <span className="line">
            <InvisibleWord />
          </span>
          <span className="line">playground</span>
        </h1>

        <p className="hero-sub">
          Writing on <strong>decision making under deep uncertainty</strong>,
          non-ergodic systems, and bimodal strategies — for people making bets
          whose outcomes don&apos;t average out.
        </p>

        <div className="hero-actions">
          <Link href="/writing" className="btn btn-primary">
            Read the essays
            <span className="arrow">→</span>
          </Link>
          <Link href="#subscribe" className="btn btn-ghost">
            Subscribe
            <span className="kbd">⌘K</span>
          </Link>
        </div>

        <div className="hero-rail">
          <div className="cell">
            <span className="mono-up">Focus</span>
            <div className="val">
              Decision making <span className="tag">under uncertainty</span>
            </div>
          </div>
          <div className="cell">
            <span className="mono-up">Framework</span>
            <div className="val">Non-ergodic systems</div>
          </div>
          <div className="cell">
            <span className="mono-up">Method</span>
            <div className="val">Bimodal strategies</div>
          </div>
          <div className="cell">
            <span className="mono-up">Index</span>
            <div className="val">
              {essayCount} {essayCount === 1 ? "essay" : "essays"}
            </div>
          </div>
        </div>
      </section>

      <section className="work" id="essays">
        <div className="section-head">
          <div className="title-block">
            <span className="mono-up kicker">§ 01 — Recent essays</span>
            <h2>Notes on making bets when the outcome space isn&apos;t stationary.</h2>
          </div>
          <div className="meta">
            <span className="mono-up">
              Updated {new Date().toLocaleDateString("en-US", { month: "2-digit", year: "numeric" })}
            </span>
          </div>
        </div>
        {posts.length === 0 ? (
          <p className="mono" style={{ color: "var(--ink-faint)" }}>
            No essays published yet.
          </p>
        ) : (
          <div className="work-grid">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/writing/${post.slug}`}
                className="work-card"
              >
                <div className={`thumb ${i % 2 === 0 ? "variant-a" : "variant-b"}`}>
                  <span className="placeholder">
                    [ figure {String(i + 1).padStart(2, "0")} — {post.slug.replace(/-/g, " ")} ]
                  </span>
                </div>
                <div className="meta-row">
                  <span className="proj-title">{post.title}</span>
                  <span className="mono">{formatMonth(post.date)}</span>
                </div>
                <p className="proj-desc">{post.excerpt ?? ""}</p>
                <div className="tags">
                  {(post.tags && post.tags.length > 0
                    ? post.tags
                    : ["Essay"]
                  ).map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="principles" id="topics">
        <div
          className="section-head"
          style={{ marginBottom: 0, borderBottom: 0, paddingBottom: 0 }}
        >
          <div className="title-block">
            <span className="mono-up kicker">§ 02 — What I&apos;m thinking about</span>
            <h2>Three lenses I keep returning to.</h2>
          </div>
        </div>
        <div className="principles-grid">
          <div className="principle">
            <span className="num">01</span>
            <h3>Non-ergodic systems.</h3>
            <p>
              The ensemble average lies to the individual. Time averages are the only
              ones you actually live through — and they obey different rules.
            </p>
          </div>
          <div className="principle">
            <span className="num">02</span>
            <h3>Bimodal strategies.</h3>
            <p>
              Extreme safety paired with extreme exposure beats most middles. Convexity
              is a design property, not a personality trait.
            </p>
          </div>
          <div className="principle">
            <span className="num">03</span>
            <h3>Decisions under opacity.</h3>
            <p>
              You rarely get probabilities. You get structure, incentives, and the shape
              of ruin. Good decisions optimise for survival before return.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function formatMonth(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
