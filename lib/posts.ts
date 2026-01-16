import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import html from "remark-html";

const postsDirectory = path.join(process.cwd(), "_posts");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  calculators: string[];
  icon?: string;
}

export interface Post extends PostMeta {
  content: string;
}

/**
 * Get all post slugs for generateStaticParams
 */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const folders = fs.readdirSync(postsDirectory);
  return folders.filter((folder) => {
    const postPath = path.join(postsDirectory, folder, "post.md");
    return fs.existsSync(postPath);
  });
}

/**
 * Get metadata for all posts (for listing page)
 */
export function getAllPostsMeta(): PostMeta[] {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => getPostMeta(slug));
}

/**
 * Get post metadata only (for RelatedArticles, listing)
 */
export function getPostMeta(slug: string): PostMeta {
  const postPath = path.join(postsDirectory, slug, "post.md");
  const fileContents = fs.readFileSync(postPath, "utf8");
  const { data } = matter(fileContents);

  return {
    slug,
    title: data.title,
    description: data.description,
    calculators: data.calculators || [],
    icon: data.icon,
  };
}

/**
 * Get full post with rendered HTML content
 */
export async function getPost(slug: string): Promise<Post> {
  const postPath = path.join(postsDirectory, slug, "post.md");
  const fileContents = fs.readFileSync(postPath, "utf8");
  const { data, content } = matter(fileContents);

  const processedContent = await remark()
    .use(remarkGfm)
    .use(html)
    .process(content);

  return {
    slug,
    title: data.title,
    description: data.description,
    calculators: data.calculators || [],
    icon: data.icon,
    content: processedContent.toString(),
  };
}

/**
 * Get posts related to a specific calculator
 */
export function getPostsForCalculator(calculatorHref: string): PostMeta[] {
  const allPosts = getAllPostsMeta();
  const calculatorSlug = calculatorHref.replace(/^\//, "");

  return allPosts.filter((post) =>
    post.calculators.includes(calculatorSlug)
  );
}
