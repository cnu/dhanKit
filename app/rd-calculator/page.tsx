import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RDCalculator } from "./RDCalculator";
import { RelatedCalculators } from "@/components/calculator";
import { RelatedArticles } from "@/components/calculator/RelatedArticles";
import { calculateRD, type CompoundingFrequency } from "@/lib/calculators/rd";

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
  if (value === "monthly" || value === "quarterly") {
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

  // Parse URL params with defaults (m = months, d = deposit)
  const monthlyDeposit = Math.min(1000000, Math.max(500, parseInt(params.d || "5000") || 5000));
  const interestRate = Math.min(15, Math.max(1, parseFloat(params.r || "7") || 7));
  const timePeriod = Math.min(120, Math.max(6, parseInt(params.m || "12") || 12)); // months
  const compounding = parseCompounding(params.c);

  // Calculate result for metadata
  const result = calculateRD(monthlyDeposit, interestRate, timePeriod, compounding);

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.d || params.r || params.m;

  const baseTitle = "RD Calculator - Recurring Deposit Calculator | dhanKit";
  const baseDescription =
    "Calculate recurring deposit maturity amount and interest earned. Plan your monthly savings with accurate RD calculations.";

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? `₹${monthlyDeposit.toLocaleString("en-IN")}/month RD → ${formatCurrencyShort(result.maturityAmount)} in ${formatTenure(timePeriod)} | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `Deposit ₹${monthlyDeposit.toLocaleString("en-IN")}/month for ${formatTenure(timePeriod)} at ${interestRate}% (${compounding} compounding). Total deposited: ${formatCurrencyShort(result.totalDeposited)}, Interest earned: ${formatCurrencyShort(result.totalInterest)}, Maturity amount: ${formatCurrencyShort(result.maturityAmount)}.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    d: monthlyDeposit.toString(),
    r: interestRate.toString(),
    m: timePeriod.toString(),
    total: result.maturityAmount.toString(),
    deposited: result.totalDeposited.toString(),
    interest: result.totalInterest.toString(),
    c: compounding,
  });

  const ogImageUrl = `/api/og/rd?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/rd-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "RD Calculator Results",
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

export default function RDCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">RD Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate recurring deposit maturity with monthly deposits and quarterly compounding.
      </p>

      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <RDCalculator />
      </Suspense>

      <RelatedArticles currentCalculator="/rd-calculator" />
      <RelatedCalculators currentCalculator="/rd-calculator" />
    </div>
  );
}
