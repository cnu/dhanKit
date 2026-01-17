import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MFReturnsCalculator } from "./MFReturnsCalculator";
import { RelatedCalculators } from "@/components/calculator";
import { RelatedArticles } from "@/components/calculator/RelatedArticles";
import { calculateMFReturns, toDecimalYears } from "@/lib/calculators/mf-returns";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;

  // Parse URL params with defaults
  const purchaseNAV = Math.min(
    100000,
    Math.max(0.01, parseFloat(params.pn || "100") || 100)
  );
  const currentNAV = Math.min(
    100000,
    Math.max(0.01, parseFloat(params.cn || "150") || 150)
  );
  const holdingYears = Math.min(50, Math.max(0, parseInt(params.y || "3") || 3));
  const holdingMonths = Math.min(11, Math.max(0, parseInt(params.m || "0") || 0));

  const holdingPeriod = toDecimalYears(holdingYears, holdingMonths);

  // Calculate result for metadata
  const result = calculateMFReturns(purchaseNAV, currentNAV, holdingPeriod);

  // Check if custom values are provided (for custom title/description)
  const hasCustomParams = params.pn || params.cn || params.y;

  const baseTitle =
    "Mutual Fund Returns Calculator - Calculate MF CAGR & Absolute Returns | dhanKit";
  const baseDescription =
    "Calculate your mutual fund returns using NAV values. Find absolute returns and CAGR (annualized returns) for any holding period.";

  // Format holding period for display
  const periodParts = [];
  if (holdingYears > 0) {
    periodParts.push(`${holdingYears}y`);
  }
  if (holdingMonths > 0) {
    periodParts.push(`${holdingMonths}m`);
  }
  const periodText = periodParts.length > 0 ? periodParts.join(" ") : "0m";

  // Generate dynamic title and description for shared links
  const cagrSign = result.cagr >= 0 ? "+" : "";
  const absSign = result.absoluteReturns >= 0 ? "+" : "";
  const title = hasCustomParams
    ? `₹${purchaseNAV} → ₹${currentNAV} NAV in ${periodText} = ${cagrSign}${result.cagr}% CAGR | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `Mutual fund NAV grew from ₹${purchaseNAV} to ₹${currentNAV} in ${periodText}. CAGR: ${cagrSign}${result.cagr}%, Absolute Return: ${absSign}${result.absoluteReturns}%.`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    pn: purchaseNAV.toString(),
    cn: currentNAV.toString(),
    y: holdingYears.toString(),
    m: holdingMonths.toString(),
    cagr: result.cagr.toString(),
    abs: result.absoluteReturns.toString(),
  });

  const ogImageUrl = `/api/og/mf-returns?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/mf-returns-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Mutual Fund Returns Calculator Results",
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

export default function MFReturnsCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">Mutual Fund Returns Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate CAGR and absolute returns from purchase and current NAV values.
      </p>

      <Suspense
        fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}
      >
        <MFReturnsCalculator />
      </Suspense>

      <RelatedArticles currentCalculator="/mf-returns-calculator" />
      <RelatedCalculators currentCalculator="/mf-returns-calculator" />
    </div>
  );
}
