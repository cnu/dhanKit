import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PPFCalculator } from "./PPFCalculator";
import { calculatePPF } from "@/lib/calculators/ppf";

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
  const yearlyInvestment = Math.min(150000, Math.max(500, parseInt(params.y || "150000") || 150000));
  const timePeriod = Math.min(50, Math.max(15, parseInt(params.years || "15") || 15));
  const interestRate = Math.min(10, Math.max(5, parseFloat(params.r || "7.1") || 7.1));

  // Calculate result for metadata
  const result = calculatePPF(yearlyInvestment, timePeriod, interestRate);

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.y || params.years || params.r;

  const baseTitle = "PPF Calculator - Public Provident Fund Returns Calculator | dhanKit";
  const baseDescription = "Calculate PPF maturity amount and interest earned. Understand PPF rules, 15-year lock-in period, and tax benefits under Section 80C.";

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? `${formatCurrencyShort(yearlyInvestment)}/year PPF → ${formatCurrencyShort(result.maturityAmount)} in ${timePeriod} years | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `PPF investment of ${formatCurrencyShort(yearlyInvestment)}/year at ${interestRate}% for ${timePeriod} years. Maturity: ${formatCurrencyShort(result.maturityAmount)}, Interest: ${formatCurrencyShort(result.totalInterest)}, Invested: ${formatCurrencyShort(result.totalInvested)}.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    y: yearlyInvestment.toString(),
    years: timePeriod.toString(),
    r: interestRate.toString(),
    total: result.maturityAmount.toString(),
    invested: result.totalInvested.toString(),
    interest: result.totalInterest.toString(),
  });

  const ogImageUrl = `/api/og/ppf?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/ppf-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "PPF Calculator Results",
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

export default function PPFCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">PPF Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate Public Provident Fund maturity amount with year-by-year projections.
      </p>

      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <PPFCalculator />
      </Suspense>
    </div>
  );
}
