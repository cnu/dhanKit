import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { RetirementCalculator } from "./RetirementCalculator";
import { RelatedCalculators } from "@/components/calculator";
import { RelatedArticles } from "@/components/calculator/RelatedArticles";
import { calculateRetirement } from "@/lib/calculators/retirement";

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

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;

  // Parse URL params with defaults
  const currentAge = Math.min(
    70,
    Math.max(18, parseInt(params.a || "30") || 30)
  );
  const retirementAge = Math.min(
    80,
    Math.max(30, parseInt(params.ra || "50") || 50)
  );
  const lifeExpectancy = Math.min(
    100,
    Math.max(60, parseInt(params.le || "85") || 85)
  );
  const monthlyExpenses = Math.min(
    1000000,
    Math.max(10000, parseInt(params.e || "50000") || 50000)
  );
  const inflationRate = Math.min(
    15,
    Math.max(1, parseFloat(params.inf || "6") || 6)
  );
  const withdrawalRate = Math.min(
    8,
    Math.max(2, parseFloat(params.wr || "4") || 4)
  );
  const expectedReturn = Math.min(
    20,
    Math.max(4, parseFloat(params.r || "12") || 12)
  );
  const currentCorpus =
    params.hc === "1"
      ? Math.min(100000000, Math.max(0, parseInt(params.c || "0") || 0))
      : 0;

  // Calculate result for metadata
  const result = calculateRetirement(
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    inflationRate,
    withdrawalRate,
    expectedReturn,
    currentCorpus
  );

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.a || params.e || params.ra;

  const baseTitle =
    "Retirement Calculator - Plan Your FIRE Journey | dhanKit";
  const baseDescription =
    "Calculate how much you need to retire comfortably. Plan for FIRE (Financial Independence, Retire Early) with our comprehensive retirement calculator. Factor in inflation, withdrawal rates, and existing savings.";

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? `Retire at ${retirementAge} with ${formatCurrencyShort(result.requiredCorpus)} corpus | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `To retire at age ${retirementAge} with ${formatCurrencyShort(monthlyExpenses)}/month expenses (today's value), you need ${formatCurrencyShort(result.requiredCorpus)}. Start SIP of ${formatCurrencyShort(result.requiredMonthlySIP)}/month to reach your goal in ${result.yearsToRetirement} years.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    a: currentAge.toString(),
    ra: retirementAge.toString(),
    le: lifeExpectancy.toString(),
    e: monthlyExpenses.toString(),
    inf: inflationRate.toString(),
    wr: withdrawalRate.toString(),
    r: expectedReturn.toString(),
    corpus: result.requiredCorpus.toString(),
    sip: result.requiredMonthlySIP.toString(),
  });
  if (currentCorpus > 0) {
    ogImageParams.set("c", currentCorpus.toString());
  }

  const ogImageUrl = `/api/og/retirement?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/retirement-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Retirement Calculator Results",
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

export default function RetirementCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">Retirement & FIRE Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate your retirement corpus and plan your path to financial independence.
      </p>

      <Suspense
        fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}
      >
        <RetirementCalculator />
      </Suspense>

      <RelatedArticles currentCalculator="/retirement-calculator" />
      <RelatedCalculators currentCalculator="/retirement-calculator" />
    </div>
  );
}
