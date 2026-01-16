import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "XIRR Calculator - Extended Internal Rate of Return Calculator | dhanKit",
  description:
    "Calculate XIRR for investments with irregular cash flows. Get accurate returns on SIPs, mutual funds, and more.",
};

export default function XIRRCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">XIRR Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate the extended internal rate of return for investments with irregular cash flows.
      </p>

      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        Calculator coming soon
      </div>
    </div>
  );
}
