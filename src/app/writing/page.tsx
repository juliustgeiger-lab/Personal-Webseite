import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Writing — Julius",
};

export default function WritingIndex() {
  const posts = getAllPosts();

  return (
    <main className="page-wrap space-y-10">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Writing</h1>
      {posts.length === 0 ? (
        <p className="text-zinc-500">No posts yet.</p>
      ) : (
        <ul className="space-y-5">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/writing/${post.slug}`}
                className="group flex flex-col md:flex-row md:items-baseline md:gap-6"
              >
                <span className="text-sm text-zinc-500 md:w-24 md:shrink-0 tabular-nums">
                  {formatDate(post.date)}
                </span>
                <span className="flex-1">
                  <span className="text-base group-hover:underline underline-offset-4 decoration-zinc-400">
                    {post.title}
                  </span>
                  {post.excerpt && (
                    <span className="block text-sm text-zinc-500 mt-1">{post.excerpt}</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
