import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "EMI Calculator - Calculate Home, Car & Personal Loan EMI | dhanKit",
  description:
    "Calculate your monthly EMI for home loan, car loan, or personal loan. See complete amortization schedule.",
};

export default function EMICalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
      >
        ← Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">EMI Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate EMI for home, car, or personal loans with amortization schedule.
      </p>

      {/* Calculator will be implemented here */}
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        Calculator coming soon
      </div>
    </div>
  );
}
