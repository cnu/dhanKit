import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRelatedCalculators } from "@/lib/calculators";

interface RelatedCalculatorsProps {
  currentCalculator: string;
}

export function RelatedCalculators({ currentCalculator }: RelatedCalculatorsProps) {
  const related = getRelatedCalculators(currentCalculator);

  return (
    <section className="mt-12 pt-8 border-t">
      <h2 className="text-xl font-semibold mb-6">Explore Other Calculators</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="group flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent hover:border-primary/30 transition-colors"
          >
            <span className="text-2xl flex-shrink-0">{calc.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                {calc.title}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {calc.description}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
}
