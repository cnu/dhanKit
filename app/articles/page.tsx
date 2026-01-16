import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllPostsMeta } from "@/lib/posts";
import { ArticleCard } from "@/components/articles";

export const metadata: Metadata = {
  title: "Financial Articles & Guides | dhanKit",
  description: "In-depth guides on SIP, EMI, PPF, FD, NPS and personal finance for Indian investors.",
  openGraph: {
    title: "Financial Articles & Guides | dhanKit",
    description: "In-depth guides on SIP, EMI, PPF, FD, NPS and personal finance for Indian investors.",
    type: "website",
    url: "/articles",
  },
};

export default function ArticlesPage() {
  const posts = getAllPostsMeta();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">Financial Guides</h1>
      <p className="text-muted-foreground mb-8">
        In-depth articles to help you make smarter financial decisions.
      </p>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">No articles yet. Check back soon!</p>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
