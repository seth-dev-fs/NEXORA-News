import fs from "fs";
import path from "path";
import matter from "front-matter";
import { remark } from "remark";
import html from "remark-html";

export interface ArticleData {
  slug: string;
  title: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  date: string;
  featured_image?: string;
  pontos_chave?: string[];
  meta_description?: string;
  source_url?: string;
  contentHtml: string;
}

const postsDirectory = path.join(process.cwd(), "content", "posts");

/**
 * Get all .md filenames
 */
export function getPostSlugs(): string[] {
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"));
}

/**
 * Load a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<ArticleData | null> {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    console.error("File not found:", fullPath);
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");

  try {
    const { attributes, body } = matter(fileContents);

    const processed = await remark().use(html).process(body);
    const contentHtml = processed.toString();

    return {
      slug: realSlug,
      contentHtml,
      ...(attributes as any),
    };
  } catch (e) {
    console.error("Error processing markdown:", e);
    return null;
  }
}

/**
 * Load ALL posts, sorted by date DESC
 */
export async function getAllPosts(): Promise<ArticleData[]> {
  const slugs = getPostSlugs();

  const posts = await Promise.all(
    slugs.map(async (slug) => await getPostBySlug(slug))
  );

  const valid = posts.filter((p): p is ArticleData => p !== null);

  return valid.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Load posts filtered by category slug
 */
export async function getPostsByCategory(
  categorySlug: string
): Promise<ArticleData[]> {
  const posts = await getAllPosts();

  return posts.filter((post) => {
    if (!post.categories || !Array.isArray(post.categories)) return false;

    return post.categories
      .map((c) => c.toLowerCase().replace(/\s+/g, "-"))
      .includes(categorySlug);
  });
}
