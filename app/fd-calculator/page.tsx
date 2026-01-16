import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "FD Calculator - Fixed Deposit Maturity Calculator | dhanKit",
  description:
    "Calculate fixed deposit maturity amount and interest. Compare simple vs compound interest.",
};

export default function FDCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">FD Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate fixed deposit maturity with different compounding frequencies.
      </p>

      {/* Calculator will be implemented here */}
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        Calculator coming soon
      </div>
    </div>
  );
}
