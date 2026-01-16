import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CAGRCalculator } from "./CAGRCalculator";
import { calculateCAGR } from "@/lib/calculators/cagr";

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
  const initialValue = Math.min(
    1000000000,
    Math.max(1000, parseInt(params.iv || "100000") || 100000)
  );
  const finalValue = Math.min(
    1000000000,
    Math.max(1000, parseInt(params.fv || "200000") || 200000)
  );
  const timePeriod = Math.min(50, Math.max(1, parseInt(params.y || "5") || 5));

  // Calculate result for metadata
  const result = calculateCAGR(initialValue, finalValue, timePeriod);

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.iv || params.fv || params.y;

  const baseTitle =
    "CAGR Calculator - Compound Annual Growth Rate Calculator | dhanKit";
  const baseDescription =
    "Calculate the Compound Annual Growth Rate (CAGR) of your investments. Find the annualized return rate for any investment over any time period.";

  // Generate dynamic title and description for shared links
  const cagrSign = result.cagr >= 0 ? "+" : "";
  const title = hasCustomParams
    ? `${formatCurrencyShort(initialValue)} → ${formatCurrencyShort(finalValue)} in ${timePeriod}y = ${cagrSign}${result.cagr}% CAGR | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `Investment grew from ${formatCurrencyShort(initialValue)} to ${formatCurrencyShort(finalValue)} in ${timePeriod} years. CAGR: ${cagrSign}${result.cagr}%, Total Returns: ${cagrSign}${result.absoluteReturnsPercent}%.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    iv: initialValue.toString(),
    fv: finalValue.toString(),
    y: timePeriod.toString(),
    cagr: result.cagr.toString(),
    absret: result.absoluteReturns.toString(),
    absretpct: result.absoluteReturnsPercent.toString(),
  });

  const ogImageUrl = `/api/og/cagr?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/cagr-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "CAGR Calculator Results",
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

export default function CAGRCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">CAGR Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate the Compound Annual Growth Rate of your investments.
      </p>

      <Suspense
        fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}
      >
        <CAGRCalculator />
      </Suspense>
    </div>
  );
}
