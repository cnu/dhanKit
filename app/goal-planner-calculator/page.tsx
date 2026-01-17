import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GoalPlannerCalculator } from "./GoalPlannerCalculator";
import { RelatedCalculators } from "@/components/calculator";
import { RelatedArticles } from "@/components/calculator/RelatedArticles";
import {
  calculateGoalPlanner,
  calculateStepUpGoalPlanner,
} from "@/lib/calculators/goal-planner";

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
  const targetAmount = Math.min(
    100000000,
    Math.max(100000, parseInt(params.t || "5000000") || 5000000)
  );
  const expectedReturn = Math.min(
    30,
    Math.max(1, parseFloat(params.r || "12") || 12)
  );
  const timePeriod = Math.min(40, Math.max(1, parseInt(params.y || "10") || 10));
  const stepUpEnabled = params.su === "1";
  const stepUpPercent = Math.min(
    50,
    Math.max(1, parseInt(params.sup || "10") || 10)
  );

  // Calculate result for metadata
  const result = stepUpEnabled
    ? calculateStepUpGoalPlanner(
        targetAmount,
        expectedReturn,
        timePeriod,
        stepUpPercent
      )
    : calculateGoalPlanner(targetAmount, expectedReturn, timePeriod);

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.t || params.r || params.y;

  const baseTitle =
    "Goal Planner Calculator - Calculate Required SIP for Your Goals | dhanKit";
  const baseDescription =
    "Calculate the monthly SIP needed to reach your financial goals. Plan for home purchase, education, retirement, or any target amount with our free goal planner calculator.";

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? `Reach ${formatCurrencyShort(targetAmount)} in ${timePeriod} years with ${formatCurrencyShort(result.requiredMonthlySIP)}/month SIP | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `To reach ${formatCurrencyShort(targetAmount)} in ${timePeriod} years at ${expectedReturn}% returns, invest ${formatCurrencyShort(result.requiredMonthlySIP)}/month. Total investment: ${formatCurrencyShort(result.totalInvested)}, Expected returns: ${formatCurrencyShort(result.totalReturns)}${stepUpEnabled ? ` (with ${stepUpPercent}% annual step-up)` : ""}.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    t: targetAmount.toString(),
    r: expectedReturn.toString(),
    y: timePeriod.toString(),
    sip: result.requiredMonthlySIP.toString(),
    invested: result.totalInvested.toString(),
    returns: result.totalReturns.toString(),
  });
  if (stepUpEnabled) {
    ogImageParams.set("su", "1");
    ogImageParams.set("sup", stepUpPercent.toString());
  }

  const ogImageUrl = `/api/og/goal-planner?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/goal-planner-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Goal Planner Calculator Results",
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

export default function GoalPlannerCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">Goal Planner Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate the monthly SIP amount needed to reach your financial goals.
      </p>

      <Suspense
        fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}
      >
        <GoalPlannerCalculator />
      </Suspense>

      <RelatedArticles currentCalculator="/goal-planner-calculator" />
      <RelatedCalculators currentCalculator="/goal-planner-calculator" />
    </div>
  );
}
