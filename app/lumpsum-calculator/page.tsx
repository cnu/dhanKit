import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LumpsumCalculator } from "./LumpsumCalculator";
import { calculateLumpsum } from "@/lib/calculators/lumpsum";

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
  const investment = Math.min(1000000000, Math.max(1000, parseInt(params.p || "100000") || 100000));
  const expectedReturn = Math.min(30, Math.max(1, parseFloat(params.r || "12") || 12));
  const timePeriod = Math.min(40, Math.max(1, parseInt(params.y || "10") || 10));

  // Calculate result for metadata
  const result = calculateLumpsum(investment, expectedReturn, timePeriod);

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.p || params.r || params.y;

  const baseTitle = "Lumpsum Calculator - One-time Investment Returns Calculator | dhanKit";
  const baseDescription = "Calculate returns on your one-time mutual fund investment. See how your lumpsum grows over time with our free lumpsum calculator.";

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? `${formatCurrencyShort(investment)} lumpsum → ${formatCurrencyShort(result.finalAmount)} in ${timePeriod} years | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `Invest ${formatCurrencyShort(investment)} one-time for ${timePeriod} years at ${expectedReturn}% returns. Expected returns: ${formatCurrencyShort(result.totalReturns)}, Final amount: ${formatCurrencyShort(result.finalAmount)}.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    p: investment.toString(),
    r: expectedReturn.toString(),
    y: timePeriod.toString(),
    total: result.finalAmount.toString(),
    invested: result.totalInvested.toString(),
    returns: result.totalReturns.toString(),
  });

  const ogImageUrl = `/api/og/lumpsum?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/lumpsum-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Lumpsum Calculator Results",
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

export default function LumpsumCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">Lumpsum Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate how your one-time investment will grow over time.
      </p>

      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <LumpsumCalculator />
      </Suspense>
    </div>
  );
}
