import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getPostsForCalculator } from "@/lib/posts";

interface RelatedArticlesProps {
  currentCalculator: string;
}

export function RelatedArticles({ currentCalculator }: RelatedArticlesProps) {
  const articles = getPostsForCalculator(currentCalculator);

  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-xl font-semibold mb-6">Related Articles</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent hover:border-primary/30 transition-colors"
          >
            <span className="text-2xl flex-shrink-0 mt-0.5">
              {article.icon || <BookOpen className="h-6 w-6 text-muted-foreground" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {article.description}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
          </Link>
        ))}
      </div>
    </section>
  );
}
