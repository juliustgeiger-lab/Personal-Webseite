import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { getEssayThumb } from "@/components/figures/thumbs";

export const metadata = {
  title: "Writing — Julius",
};

export default function WritingIndex() {
  const posts = getAllPosts();

  return (
    <main className="writing-index">
      <div className="section-head">
        <div className="title-block">
          <span className="mono-up kicker">§ — All essays</span>
          <h1>Writing</h1>
        </div>
        <div className="meta">
          <span className="mono-up">{posts.length} essays</span>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="mono" style={{ color: "var(--ink-faint)" }}>
          No essays published yet.
        </p>
      ) : (
        <div className="work-grid">
          {posts.map((post, i) => {
            const Glyph = getEssayThumb(post.slug);
            const variant = Glyph
              ? "variant-a"
              : i % 2 === 0
                ? "variant-a"
                : "variant-b";
            return (
              <Link
                key={post.slug}
                href={`/writing/${post.slug}`}
                className="work-card"
              >
                <div
                  className={`thumb ${variant}${Glyph ? " thumb--glyph" : ""}`}
                >
                  {Glyph ? (
                    <Glyph />
                  ) : (
                    <span className="placeholder">
                      [ figure {String(i + 1).padStart(2, "0")} —{" "}
                      {post.slug.replace(/-/g, " ")} ]
                    </span>
                  )}
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
            );
          })}
        </div>
      )}
    </main>
  );
}

function formatMonth(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
