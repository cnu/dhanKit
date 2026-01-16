import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NPSCalculator } from "./NPSCalculator";
import { RelatedCalculators } from "@/components/calculator";
import { calculateNPS } from "@/lib/calculators/nps";

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
  const currentAge = Math.min(59, Math.max(18, parseInt(params.a || "30") || 30));
  const monthlyInvestment = Math.min(100000, Math.max(500, parseInt(params.m || "5000") || 5000));
  const expectedReturn = Math.min(14, Math.max(8, parseFloat(params.r || "10") || 10));
  const annuityRate = Math.min(8, Math.max(4, parseFloat(params.ar || "6") || 6));
  const customSplitEnabled = params.cs === "1";
  const annuityPercent = customSplitEnabled
    ? Math.min(100, Math.max(40, parseInt(params.ap || "40") || 40))
    : 40;
  const inflationEnabled = params.inf === "1";
  const inflationRate = Math.min(15, Math.max(1, parseFloat(params.infr || "6") || 6));

  // Calculate result for metadata
  const result = calculateNPS(currentAge, monthlyInvestment, expectedReturn, annuityRate, annuityPercent);

  // Calculate inflation-adjusted values if enabled
  const inflationAdjustedCorpus = inflationEnabled
    ? Math.round(result.totalCorpus / Math.pow(1 + inflationRate / 100, result.yearsToRetirement))
    : null;
  const inflationAdjustedPension = inflationEnabled
    ? Math.round(result.monthlyPension / Math.pow(1 + inflationRate / 100, result.yearsToRetirement))
    : null;

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.a || params.m || params.r || params.ar || params.cs || params.inf;

  const baseTitle = "NPS Calculator - National Pension System Returns Calculator | dhanKit";
  const baseDescription = "Calculate NPS maturity corpus and monthly pension. Understand NPS tax benefits under 80CCD.";

  const lumpsumPercent = 100 - result.annuityPercent;

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? `Age ${currentAge}: ${formatCurrencyShort(monthlyInvestment)}/month NPS → ${formatCurrencyShort(result.totalCorpus)} corpus | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `Start at age ${currentAge}, invest ${formatCurrencyShort(monthlyInvestment)}/month for ${result.yearsToRetirement} years at ${expectedReturn}% returns. Total corpus: ${formatCurrencyShort(result.totalCorpus)}${inflationEnabled ? ` (${formatCurrencyShort(inflationAdjustedCorpus!)} in today's money)` : ""}, Lumpsum (${lumpsumPercent}%): ${formatCurrencyShort(result.lumpsumWithdrawal)}, Monthly pension: ${formatCurrencyShort(result.monthlyPension)}${inflationEnabled ? ` (${formatCurrencyShort(inflationAdjustedPension!)} adjusted)` : ""} at ${annuityRate}% annuity rate.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    a: currentAge.toString(),
    m: monthlyInvestment.toString(),
    r: expectedReturn.toString(),
    ar: annuityRate.toString(),
    ap: result.annuityPercent.toString(),
    corpus: result.totalCorpus.toString(),
    lumpsum: result.lumpsumWithdrawal.toString(),
    pension: result.monthlyPension.toString(),
    invested: result.totalInvested.toString(),
    years: result.yearsToRetirement.toString(),
  });
  if (inflationEnabled) {
    ogImageParams.set("inf", "1");
    ogImageParams.set("infr", inflationRate.toString());
    ogImageParams.set("adjCorpus", inflationAdjustedCorpus!.toString());
    ogImageParams.set("adjPension", inflationAdjustedPension!.toString());
  }

  const ogImageUrl = `/api/og/nps?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/nps-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "NPS Calculator Results",
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

export default function NPSCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">NPS Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate your NPS corpus at retirement and expected monthly pension.
      </p>

      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <NPSCalculator />
      </Suspense>

      <RelatedCalculators currentCalculator="/nps-calculator" />
    </div>
  );
}
