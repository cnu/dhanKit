import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "NPS Calculator - National Pension System Returns Calculator | dhanKit",
  description:
    "Calculate NPS maturity corpus and monthly pension. Understand NPS tax benefits under 80CCD.",
};

export default function NPSCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">NPS Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate your NPS corpus at retirement and expected monthly pension.
      </p>

      {/* Calculator will be implemented here */}
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        Calculator coming soon
      </div>
    </div>
  );
}
