import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GratuityCalculator } from "./GratuityCalculator";
import { RelatedCalculators } from "@/components/calculator";
import { RelatedArticles } from "@/components/calculator/RelatedArticles";
import { calculateGratuityWithCap } from "@/lib/calculators/gratuity";

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
  const lastDrawnSalary = Math.min(10000000, Math.max(1000, parseInt(params.s || "50000") || 50000));
  const yearsOfService = Math.min(50, Math.max(1, parseInt(params.y || "10") || 10));

  // Calculate result for metadata
  const result = calculateGratuityWithCap(lastDrawnSalary, yearsOfService);

  // Check if custom values are provided
  const hasCustomParams = params.s || params.y;

  const baseTitle = "Gratuity Calculator - Calculate Gratuity Online | dhanKit";
  const baseDescription = "Calculate your gratuity amount using the Payment of Gratuity Act formula. Free online gratuity calculator for Indian employees with 5+ years of service.";

  // Generate dynamic title and description for shared links
  const title = hasCustomParams
    ? `Gratuity: ${formatCurrencyShort(result.gratuityAmount)} for ${yearsOfService} years service | dhanKit`
    : baseTitle;

  const description = hasCustomParams
    ? `With a salary of ${formatCurrencyShort(lastDrawnSalary)}/month and ${yearsOfService} years of service, your gratuity is ${formatCurrencyShort(result.gratuityAmount)}.${!result.isEligible ? " Note: Minimum 5 years service required for eligibility." : ""}`
    : baseDescription;

  // Build OG image URL with params
  const ogImageParams = new URLSearchParams({
    s: lastDrawnSalary.toString(),
    y: yearsOfService.toString(),
    g: result.gratuityAmount.toString(),
  });
  if (result.isCapped) {
    ogImageParams.set("capped", "1");
  }
  if (!result.isEligible) {
    ogImageParams.set("ineligible", "1");
  }

  const ogImageUrl = `/api/og/gratuity?${ogImageParams.toString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: "/gratuity-calculator",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: "Gratuity Calculator Results",
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

export default function GratuityCalculatorPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to calculators
      </Link>

      <h1 className="text-3xl font-bold mb-2">Gratuity Calculator</h1>
      <p className="text-muted-foreground mb-8">
        Calculate your gratuity entitlement under the Payment of Gratuity Act, 1972.
      </p>

      <Suspense fallback={<div className="animate-pulse h-96 bg-muted rounded-lg" />}>
        <GratuityCalculator />
      </Suspense>

      <RelatedArticles currentCalculator="/gratuity-calculator" />
      <RelatedCalculators currentCalculator="/gratuity-calculator" />
    </div>
  );
}
