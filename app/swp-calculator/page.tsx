import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "SWP Calculator - Systematic Withdrawal Plan Calculator | dhanKit",
  description:
    "Calculate how long your investments will last with systematic withdrawals. Plan your retirement income with SWP.",
};

export default function SWPCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">SWP Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Plan systematic withdrawals from your investments and see how long your corpus will last.
      </p>

      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        Calculator coming soon
      </div>
    </div>
  );
}
