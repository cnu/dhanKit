import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SWPCalculator } from "./SWPCalculator";
import {
  calculateSWP,
  calculateInflationAdjustedSWP,
} from "@/lib/calculators/swp";

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

// Helper to format duration
function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} months`;
  if (remainingMonths === 0) return `${years} years`;
  return `${years}y ${remainingMonths}m`;
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;

  // Parse URL params with defaults
  const initialCorpus = Math.min(
    1000000000,
    Math.max(100000, parseInt(params.c || "5000000") || 5000000)
  );
  const monthlyWithdrawal = Math.min(
    10000000,
    Math.max(1000, parseInt(params.w || "30000") || 30000)
  );
  const expectedReturn = Math.min(
    20,
    Math.max(1, parseFloat(params.r || "8") || 8)
  );
  const timePeriod = Math.min(60, Math.max(1, parseInt(params.y || "20") || 20));
  const inflationEnabled = params.inf === "1";
  const inflationRate = Math.min(
    15,
    Math.max(1, parseFloat(params.infr || "6") || 6)
  );

  // Calculate result for metadata
  const result = inflationEnabled
    ? calculateInflationAdjustedSWP(
        initialCorpus,
        monthlyWithdrawal,
        expectedReturn,
        timePeriod,
        inflationRate
      )
    : calculateSWP(
        initialCorpus,
        monthlyWithdrawal,
        expectedReturn,
        timePeriod
      );

  // Check if custom values are provided
  const hasCustomParams = params.c || params.w || params.r || params.y || params.inf;

  const baseTitle =
    "SWP Calculator - Systematic Withdrawal Plan Calculator | dhanKit";
  const baseDescription =
    "Calculate how long your investments will last with systematic withdrawals. Plan your retirement income with our free SWP calculator.";

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? result.corpusLasted
      ? `${formatCurrencyShort(monthlyWithdrawal)}/month SWP from ${formatCurrencyShort(initialCorpus)} → ${formatCurrencyShort(result.finalCorpus)} after ${timePeriod}y | dhanKit`
      : `${formatCurrencyShort(initialCorpus)} corpus lasts ${formatDuration(result.monthsLasted)} with ${formatCurrencyShort(monthlyWithdrawal)}/month SWP | dhanKit`
    : baseTitle;

  const inflationNote = inflationEnabled
    ? ` With ${inflationRate}% annual increase.`
    : "";

  const description = hasCustomParams
    ? `Withdraw ${formatCurrencyShort(monthlyWithdrawal)}/month from ${formatCurrencyShort(initialCorpus)} at ${expectedReturn}% returns.${inflationNote} ${result.corpusLasted ? `Final corpus: ${formatCurrencyShort(result.finalCorpus)}.` : `Corpus lasts ${formatDuration(result.monthsLasted)}.`} Total withdrawn: ${formatCurrencyShort(result.totalWithdrawn)}, Interest earned: ${formatCurrencyShort(result.totalInterestEarned)}.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    c: initialCorpus.toString(),
    w: monthlyWithdrawal.toString(),
    r: expectedReturn.toString(),
    y: timePeriod.toString(),
    final: result.finalCorpus.toString(),
    withdrawn: result.totalWithdrawn.toString(),
    interest: result.totalInterestEarned.toString(),
    lasted: result.corpusLasted ? "1" : "0",
    months: result.monthsLasted.toString(),
    ...(inflationEnabled && {
      inf: "1",
      infr: inflationRate.toString(),
    }),
  });

  const ogImageUrl = `/api/og/swp?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/swp-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "SWP Calculator Results",
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
        Plan systematic withdrawals from your investments and see how long your
        corpus will last.
      </p>

      <Suspense
        fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}
      >
        <SWPCalculator />
      </Suspense>
    </div>
  );
}
