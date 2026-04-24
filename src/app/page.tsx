import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts().slice(0, 5);

  return (
    <div className="space-y-16">
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Julius
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
          I write about decision making, value investing, and how to think under uncertainty.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          Recent Writing
        </h2>
        {posts.length === 0 ? (
          <p className="text-zinc-500">No posts yet.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/writing/${post.slug}`}
                  className="group flex flex-col md:flex-row md:items-baseline md:gap-6"
                >
                  <span className="text-sm text-zinc-500 md:w-24 md:shrink-0 tabular-nums">
                    {formatDate(post.date)}
                  </span>
                  <span className="text-base group-hover:underline underline-offset-4 decoration-zinc-400">
                    {post.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
