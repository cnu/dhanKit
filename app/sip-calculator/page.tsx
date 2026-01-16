import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SIPCalculator } from "./SIPCalculator";
import { calculateSIP, calculateStepUpSIP } from "@/lib/calculators/sip";

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
  const timePeriod = Math.min(40, Math.max(1, parseInt(params.y || "10") || 10));
  const stepUpEnabled = params.su === "1";
  const stepUpPercent = Math.min(50, Math.max(1, parseInt(params.sup || "10") || 10));

  // Calculate result for metadata
  const result = stepUpEnabled
    ? calculateStepUpSIP(monthlyInvestment, expectedReturn, timePeriod, stepUpPercent)
    : calculateSIP(monthlyInvestment, expectedReturn, timePeriod);

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.m || params.r || params.y;

  const baseTitle = "SIP Calculator - Calculate SIP Returns Online | dhanKit";
  const baseDescription = "Calculate your SIP maturity amount with our free SIP calculator. See how your monthly investments grow over time with step-up and inflation adjustment features.";

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? `${formatCurrencyShort(monthlyInvestment)}/month SIP → ${formatCurrencyShort(result.maturityAmount)} in ${timePeriod} years | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `Invest ${formatCurrencyShort(monthlyInvestment)}/month for ${timePeriod} years at ${expectedReturn}% returns. Total investment: ${formatCurrencyShort(result.totalInvested)}, Expected returns: ${formatCurrencyShort(result.totalReturns)}, Maturity amount: ${formatCurrencyShort(result.maturityAmount)}${stepUpEnabled ? ` (with ${stepUpPercent}% annual step-up)` : ""}.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    m: monthlyInvestment.toString(),
    r: expectedReturn.toString(),
    y: timePeriod.toString(),
    total: result.maturityAmount.toString(),
    invested: result.totalInvested.toString(),
    returns: result.totalReturns.toString(),
  });
  if (stepUpEnabled) {
    ogImageParams.set("su", "1");
    ogImageParams.set("sup", stepUpPercent.toString());
  }

  const ogImageUrl = `/api/og/sip?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/sip-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "SIP Calculator Results",
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

export default function SIPCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block"
      >
        ← Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">SIP Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate how your monthly SIP investments will grow over time.
      </p>

      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <SIPCalculator />
      </Suspense>
    </div>
  );
}
