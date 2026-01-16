import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "SIP Calculator - Calculate SIP Returns Online | dhanKit",
  description:
    "Calculate your SIP maturity amount with our free SIP calculator. See how your monthly investments grow over time.",
};

export default function SIPCalculatorPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
      >
        ← Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">SIP Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate how your monthly SIP investments will grow over time.
      </p>

      {/* Calculator will be implemented here */}
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        Calculator coming soon
      </div>
    </div>
  );
}
