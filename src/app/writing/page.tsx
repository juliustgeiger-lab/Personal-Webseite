import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { getEssayThumb } from "@/components/figures/thumbs";

export const metadata = {
  title: "Essays — Julius",
};

export default function WritingIndex() {
  const posts = getAllPosts();

  return (
    <main className="about-root">
      <div className="about-grid">
        <div className="about-text">
          <span className="about-rule" aria-hidden="true" />
          <h1 className="about-title">ESSAYS</h1>
          <p className="about-subtitle">
            Thoughts on decision making, non-ergodic systems and bimodal
            strategies.
          </p>
          {posts.length === 0 ? (
            <p className="essays-empty">No essays published yet.</p>
          ) : (
            <ul className="essays-grid">
              {posts.map((post) => {
                const Glyph = getEssayThumb(post.slug);
                return (
                  <li key={post.slug} className="essays-card">
                    <Link
                      href={`/writing/${post.slug}`}
                      className="essays-card-link"
                    >
                      <div className="essays-card-thumb">
                        {Glyph ? (
                          <Glyph />
                        ) : (
                          <span className="essays-card-thumb-fallback mono-up">
                            {post.slug.replace(/-/g, " ")}
                          </span>
                        )}
                      </div>
                      <div className="essays-card-body">
                        <span className="essays-card-date mono-up">
                          {formatMonth(post.date)}
                        </span>
                        <h2 className="essays-card-title">{post.title}</h2>
                        {post.excerpt && (
                          <p className="essays-card-excerpt">{post.excerpt}</p>
                        )}
                        {(() => {
                          const tags = post.tags ?? [];
                          const readingTime = tags.find((t) =>
                            /^\d+\s*min$/i.test(t),
                          );
                          const otherTags = tags.filter(
                            (t) => !/^\d+\s*min$/i.test(t),
                          );
                          return (
                            <>
                              {otherTags.length > 0 && (
                                <div className="essays-card-tags">
                                  {otherTags.map((t) => (
                                    <span key={t} className="essays-card-tag">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {readingTime && (
                                <span className="essays-card-time mono-up">
                                  <svg
                                    className="essays-card-time-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <path d="M3 4.5h6.5a3 3 0 0 1 2.5 1.4 3 3 0 0 1 2.5-1.4H21v13.5h-6.5a3 3 0 0 0-2.5 1.4 3 3 0 0 0-2.5-1.4H3z" />
                                    <path d="M12 5.9V19.4" />
                                  </svg>
                                  {readingTime}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="about-photo">
          <img
            src="/pictures-website/Vector-Essays-0.png"
            alt="Julius at his desk, mid-throw of a balled-up sheet of paper."
            width={1024}
            height={1024}
          />
        </div>
      </div>
    </main>
  );
}

function formatMonth(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
