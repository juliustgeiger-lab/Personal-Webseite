import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  /** When true, the post page hides the header timestamp; the .mdx is then
   *  responsible for rendering <PostDate /> wherever it wants the date. */
  inlineDate?: boolean;
  /** Name of a registered figure component to render above the article
   *  header (above h1 + date). Looked up in LEAD_FIGURE_REGISTRY in
   *  src/app/writing/[slug]/page.tsx — pass an unregistered string and
   *  the lead slot is silently skipped. */
  leadFigure?: string;
};

export type Post = PostMeta & {
  content: string;
};

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data } = matter(raw);
    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      excerpt: data.excerpt,
      tags: Array.isArray(data.tags) ? data.tags : undefined,
      inlineDate: data.inlineDate === true,
      leadFigure: typeof data.leadFigure === "string" ? data.leadFigure : undefined,
    } as PostMeta;
  });
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  const file = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    excerpt: data.excerpt,
    tags: Array.isArray(data.tags) ? data.tags : undefined,
    inlineDate: data.inlineDate === true,
    leadFigure: typeof data.leadFigure === "string" ? data.leadFigure : undefined,
    content,
  };
}
