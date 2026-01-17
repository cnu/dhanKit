import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CostOfDelayCalculator } from "./CostOfDelayCalculator";
import { RelatedCalculators } from "@/components/calculator";
import { RelatedArticles } from "@/components/calculator/RelatedArticles";
import { calculateCostOfDelay } from "@/lib/calculators/cost-of-delay";

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
  const monthlyInvestment = Math.min(1000000, Math.max(500, parseInt(params.m || "5000") || 5000));
  const expectedReturn = Math.min(30, Math.max(1, parseFloat(params.r || "12") || 12));
  const currentAge = Math.min(65, Math.max(18, parseInt(params.a || "25") || 25));
  const retirementAge = Math.min(75, Math.max(40, parseInt(params.ra || "60") || 60));
  const delayYears = Math.min(20, Math.max(1, parseInt(params.d || "5") || 5));
  const stepUpEnabled = params.su === "1";
  const stepUpPercent = Math.min(50, Math.max(1, parseInt(params.sup || "10") || 10));

  // Calculate result for metadata
  const result = calculateCostOfDelay(
    monthlyInvestment,
    expectedReturn,
    currentAge,
    retirementAge,
    delayYears,
    stepUpEnabled ? { stepUpEnabled: true, stepUpPercent } : undefined
  );

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.m || params.r || params.a || params.d;

  const baseTitle = "Cost of Delay Calculator - See What Waiting Costs You | dhanKit";
  const baseDescription = "Calculate how much wealth you lose by delaying your SIP investments. See the exact cost of waiting and what you'd need to invest to catch up.";

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? `${delayYears}-year delay costs ${formatCurrencyShort(result.costOfDelay)} | Cost of Delay Calculator | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `Starting SIP at age ${currentAge} vs ${currentAge + delayYears}: ${formatCurrencyShort(result.startNowCorpus)} vs ${formatCurrencyShort(result.startLaterCorpus)}. That's ${formatCurrencyShort(result.costOfDelay)} lost by waiting ${delayYears} years. Calculate your cost of delay.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    m: monthlyInvestment.toString(),
    r: expectedReturn.toString(),
    a: currentAge.toString(),
    ra: retirementAge.toString(),
    d: delayYears.toString(),
    cost: result.costOfDelay.toString(),
    startNow: result.startNowCorpus.toString(),
    startLater: result.startLaterCorpus.toString(),
    pctLoss: Math.round(result.percentageLoss).toString(),
  });
  if (stepUpEnabled) {
    ogImageParams.set("su", "1");
    ogImageParams.set("sup", stepUpPercent.toString());
  }

  const ogImageUrl = `/api/og/cost-of-delay?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/cost-of-delay-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Cost of Delay Calculator Results",
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

export default function CostOfDelayCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">Cost of Delay Calculator</h1>
      <p className="text-muted-foreground mb-8">
        See how much you lose by waiting to start your investments. Time is your most powerful wealth-building tool.
      </p>

      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <CostOfDelayCalculator />
      </Suspense>

      <RelatedArticles currentCalculator="/cost-of-delay-calculator" />
      <RelatedCalculators currentCalculator="/cost-of-delay-calculator" />
    </div>
  );
}
