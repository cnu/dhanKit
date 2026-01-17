import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "About | dhanKit",
  description:
    "dhanKit provides free financial calculators for Indian investors to make smarter financial decisions.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-6">About dhanKit</h1>

      <div className="prose prose-neutral max-w-none">
        <p className="text-lg text-muted-foreground mb-4">
          dhanKit is a collection of free financial calculators designed
          specifically for Indian retail investors and salaried professionals.
        </p>

        <p className="text-muted-foreground mb-4">
          Our mission is to make financial planning accessible and intuitive.
          Whether you&apos;re planning your SIP investments, calculating EMI for a
          home loan, or projecting your retirement corpus, dhanKit provides
          accurate calculations with beautiful visualizations.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">Features</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Real-time calculations as you adjust inputs</li>
          <li>Mobile-friendly design</li>
          <li>Year-by-year breakdown tables</li>
          <li>Visual charts for better understanding</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">Disclaimer</h2>
        <p className="text-muted-foreground mb-4">
          The information provided on dhanKit, including calculators and articles,
          is for general informational and educational purposes only. It does not
          constitute legal, financial, tax, or investment advice.
        </p>
        <p className="text-muted-foreground mb-4">
          While we strive for accuracy, dhanKit makes no warranties or
          representations regarding the completeness, accuracy, or reliability of
          any information on this site. Calculations are based on standard
          formulas and assumptions that may not reflect your specific situation.
        </p>
        <p className="text-muted-foreground">
          You should consult a qualified financial advisor, tax professional, or
          legal counsel before making any financial decisions. dhanKit and its
          creators are not liable for any losses or damages arising from the use
          of this website.
        </p>
      </div>
    </div>
  );
}
