import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getPost, getAllPostSlugs, getPostMeta } from "@/lib/posts";
import { calculators } from "@/lib/calculators";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const meta = getPostMeta(slug);
    const ogImageUrl = `/api/og/article?title=${encodeURIComponent(meta.title)}&desc=${encodeURIComponent(meta.description)}`;

    return {
      title: `${meta.title} | dhanKit`,
      description: meta.description,
      openGraph: {
        title: meta.title,
        description: meta.description,
        type: "article",
        url: `/articles/${slug}`,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: meta.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.description,
        images: [ogImageUrl],
      },
    };
  } catch {
    return {
      title: "Article Not Found | dhanKit",
    };
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getPost(slug);
  } catch {
    notFound();
  }

  const relatedCalcs = calculators.filter((calc) =>
    post.calculators.includes(calc.href.replace(/^\//, ""))
  );

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/articles"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to articles
      </Link>

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-lg text-muted-foreground mb-8">{post.description}</p>

      <div
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {relatedCalcs.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-xl font-semibold mb-6">Try These Calculators</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {relatedCalcs.map((calc) => (
              <Link
                key={calc.href}
                href={calc.href}
                className="group flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent hover:border-primary/30 transition-colors"
              >
                <span className="text-2xl flex-shrink-0">{calc.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                    {calc.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {calc.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
