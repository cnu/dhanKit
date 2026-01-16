import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { EMICalculator } from "./EMICalculator";
import { calculateEMI } from "@/lib/calculators/emi";

// Helper to format currency for OG tags (server-side)
function formatCurrencyShort(num: number): string {
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;

  // Parse URL params with defaults
  const loanAmount = Math.min(100000000, Math.max(100000, parseInt(params.p || "5000000") || 5000000));
  const interestRate = Math.min(20, Math.max(1, parseFloat(params.r || "8.5") || 8.5));
  const tenureYears = Math.min(30, Math.max(1, parseInt(params.y || "20") || 20));
  const tenureMonths = tenureYears * 12;

  // Calculate result for metadata
  const result = calculateEMI(loanAmount, interestRate, tenureMonths);

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.p || params.r || params.y;

  const baseTitle = "EMI Calculator - Calculate Home, Car & Personal Loan EMI | dhanKit";
  const baseDescription = "Calculate your monthly EMI for home loan, car loan, or personal loan. See complete amortization schedule with principal and interest breakdown.";

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? `${formatCurrencyShort(loanAmount)} Loan → ${formatCurrencyShort(result.monthlyEMI)}/month EMI | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `Loan of ${formatCurrencyShort(loanAmount)} at ${interestRate}% for ${tenureYears} years. Monthly EMI: ${formatCurrencyShort(result.monthlyEMI)}, Total Interest: ${formatCurrencyShort(result.totalInterest)}, Total Payment: ${formatCurrencyShort(result.totalAmount)}.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    p: loanAmount.toString(),
    r: interestRate.toString(),
    y: tenureYears.toString(),
    emi: result.monthlyEMI.toString(),
    total: result.totalAmount.toString(),
    interest: result.totalInterest.toString(),
  });

  const ogImageUrl = `/api/og/emi?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/emi-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "EMI Calculator Results",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function EMICalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">EMI Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate EMI for home, car, or personal loans with amortization schedule.
      </p>

      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <EMICalculator />
      </Suspense>
    </div>
  );
}
