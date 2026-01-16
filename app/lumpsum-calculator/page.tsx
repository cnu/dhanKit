import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lumpsum Calculator - One-time Investment Returns Calculator | dhanKit",
  description:
    "Calculate returns on one-time mutual fund investment. See how your lumpsum grows over time.",
};

export default function LumpsumCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
      >
        ← Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">Lumpsum Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate how a one-time investment grows over time with compound returns.
      </p>

      {/* Calculator will be implemented here */}
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        Calculator coming soon
      </div>
    </div>
  );
}
