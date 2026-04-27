import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "@/lib/posts";
import FuturesSimulation from "@/components/FuturesSimulation";
import HorizonDiagram from "@/components/figures/HorizonDiagram";
import HorizonLoop from "@/components/figures/HorizonLoop";

// Components MDX posts can use directly (e.g. <FuturesSimulation />).
// Register a new in-essay figure here, then drop the tag into the .mdx file.
const mdxComponents = {
  FuturesSimulation,
  HorizonDiagram,
  HorizonLoop,
};

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Julius`,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="page-wrap space-y-8">
      <header className="space-y-3">
        <h1 className="post-title text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
          {post.title}
        </h1>
        <time className="text-sm text-zinc-500 tabular-nums">
          {formatDate(post.date)}
        </time>
      </header>
      <div className="prose-content">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>
    </article>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
