import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPost } from "@/lib/posts";
import FuturesSimulation from "@/components/FuturesSimulation";
import HorizonDiagram from "@/components/figures/HorizonDiagram";
import HorizonLoop from "@/components/figures/HorizonLoop";
import HorizonLoopStory from "@/components/figures/HorizonLoopStory";
import BarbellDiagnostic from "@/components/figures/BarbellDiagnostic";

// Components MDX posts can use directly (e.g. <FuturesSimulation />).
// Register a new in-essay figure here, then drop the tag into the .mdx file.
// PostDate is added per-post inside PostPage so it can closure over post.date.
const baseMdxComponents = {
  FuturesSimulation,
  HorizonDiagram,
  HorizonLoop,         // Fig 2 — concept-only loop
  HorizonLoopStory,    // Fig 3 — biographic life arc, place when ready
  BarbellDiagnostic,
};

// Lead-figure registry — components that can sit ABOVE the article header
// (h1 + date) when a post's frontmatter declares `leadFigure: <name>`.
// Keeping this typed as a record of components avoids the JSX types/string
// dance and lets a missing key fall through to undefined cleanly.
const LEAD_FIGURE_REGISTRY: Record<string, React.ComponentType> = {
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

  // <PostDate /> is an MDX-only component: when a post sets `inlineDate: true`
  // in its frontmatter, the header timestamp is hidden and the .mdx is in
  // charge of placing the date — typically right under a lead figure.
  const PostDate = () => (
    <time className="post-date-inline tabular-nums">
      {formatDate(post.date)}
    </time>
  );
  const mdxComponents = { ...baseMdxComponents, PostDate };

  // Resolve the lead figure (rendered above the article header) from the
  // frontmatter string. Unknown names silently render nothing.
  const LeadFigure = post.leadFigure
    ? LEAD_FIGURE_REGISTRY[post.leadFigure]
    : null;

  return (
    <article className="page-wrap space-y-8">
      {LeadFigure && (
        <div className="post-lead-figure">
          <LeadFigure />
        </div>
      )}
      <header className="space-y-3">
        <h1 className="post-title text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
          {post.title}
        </h1>
        {!post.inlineDate && (
          <time className="text-sm text-zinc-500 tabular-nums">
            {formatDate(post.date)}
          </time>
        )}
      </header>
      <div className="prose-content">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>
      <footer className="post-author">
        <img
          src="/profile-picture-julius/zugeschnittenes_kreis_bild.png"
          alt="Portrait of Julius"
          width={810}
          height={810}
          className="post-author__avatar"
        />
        <div className="post-author__meta">
          <p className="post-author__name">Julius T. Geiger</p>
          <Link href="/about" className="post-author__link">
            About me <span aria-hidden="true">→</span>
          </Link>
        </div>
      </footer>
    </article>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
