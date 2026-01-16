import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FDCalculator } from "./FDCalculator";
import { RelatedCalculators } from "@/components/calculator";
import { RelatedArticles } from "@/components/calculator/RelatedArticles";
import { calculateFD, calculateFDSimple, type CompoundingFrequency } from "@/lib/calculators/fd";

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

function parseCompounding(value: string | undefined): CompoundingFrequency {
  if (
    value === "monthly" ||
    value === "quarterly" ||
    value === "half-yearly" ||
    value === "yearly"
  ) {
    return value;
  }
  return "quarterly";
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

// Format tenure for display (e.g., "12 months" or "2 years 6 months")
function formatTenure(months: number): string {
  if (months < 12) {
    return `${months} month${months !== 1 ? "s" : ""}`;
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? "s" : ""}`;
  }
  return `${years}y ${remainingMonths}m`;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;

  // Parse URL params with defaults (m = months)
  const principal = Math.min(100000000, Math.max(1000, parseInt(params.p || "100000") || 100000));
  const interestRate = Math.min(15, Math.max(1, parseFloat(params.r || "7") || 7));
  const timePeriod = Math.min(120, Math.max(1, parseInt(params.m || "12") || 12)); // months
  const compounding = parseCompounding(params.c);
  const useSimpleInterest = params.si === "1";

  // Calculate result for metadata
  const result = useSimpleInterest
    ? calculateFDSimple(principal, interestRate, timePeriod)
    : calculateFD(principal, interestRate, timePeriod, compounding);

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.p || params.r || params.m;

  const baseTitle = "FD Calculator - Fixed Deposit Maturity Calculator | dhanKit";
  const baseDescription =
    "Calculate fixed deposit maturity amount and interest earned. Compare simple vs compound interest with different compounding frequencies.";

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? `${formatCurrencyShort(principal)} FD at ${interestRate}% → ${formatCurrencyShort(result.maturityAmount)} in ${formatTenure(timePeriod)} | dhanKit`
    : baseTitle;

  const interestType = useSimpleInterest ? "simple interest" : `${compounding} compounding`;
  const description = hasCustomParams
    ? `Deposit ${formatCurrencyShort(principal)} for ${formatTenure(timePeriod)} at ${interestRate}% (${interestType}). Interest earned: ${formatCurrencyShort(result.totalInterest)}, Maturity amount: ${formatCurrencyShort(result.maturityAmount)}.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    p: principal.toString(),
    r: interestRate.toString(),
    m: timePeriod.toString(),
    total: result.maturityAmount.toString(),
    invested: result.totalInvested.toString(),
    interest: result.totalInterest.toString(),
    c: compounding,
  });
  if (useSimpleInterest) {
    ogImageParams.set("si", "1");
  }

  const ogImageUrl = `/api/og/fd?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/fd-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "FD Calculator Results",
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

export default function FDCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
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

      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <FDCalculator />
      </Suspense>

      <RelatedArticles currentCalculator="/fd-calculator" />
      <RelatedCalculators currentCalculator="/fd-calculator" />
    </div>
  );
}
