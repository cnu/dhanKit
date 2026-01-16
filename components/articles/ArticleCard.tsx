import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { PostMeta } from "@/lib/posts";

interface ArticleCardProps {
  post: PostMeta;
}

export function ArticleCard({ post }: ArticleCardProps) {
  return (
    <Link
      href={`/articles/${post.slug}`}
      className="group flex items-start gap-4 p-6 rounded-lg border bg-card hover:bg-accent hover:border-primary/30 transition-colors"
    >
      <span className="text-3xl flex-shrink-0">
        {post.icon || <BookOpen className="h-8 w-8 text-muted-foreground" />}
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {post.description}
        </p>
        <div className="flex items-center gap-2 mt-3 text-sm text-primary">
          Read article
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
