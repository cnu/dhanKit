"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { InputSlider, ResultCard, BreakdownTable } from "@/components/calculator";
import {
  calculateCAGR,
  calculateCAGRYearlyBreakdown,
} from "@/lib/calculators/cagr";

// Default values
const DEFAULTS = {
  initialValue: 100000,
  finalValue: 200000,
  timePeriod: 5,
};

function parseNumber(
  value: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  if (!value) return fallback;
  const num = parseFloat(value);
  if (isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

export function CAGRCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [initialValue, setInitialValue] = useState(() =>
    parseNumber(searchParams.get("iv"), DEFAULTS.initialValue, 1000, 1000000000)
  );
  const [finalValue, setFinalValue] = useState(() =>
    parseNumber(searchParams.get("fv"), DEFAULTS.finalValue, 1000, 1000000000)
  );
  const [timePeriod, setTimePeriod] = useState(() =>
    parseNumber(searchParams.get("y"), DEFAULTS.timePeriod, 1, 50)
  );

  // Build shareable URL
  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("iv", initialValue.toString());
    params.set("fv", finalValue.toString());
    params.set("y", timePeriod.toString());
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [initialValue, finalValue, timePeriod]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (initialValue !== DEFAULTS.initialValue) {
      params.set("iv", initialValue.toString());
    }
    if (finalValue !== DEFAULTS.finalValue) {
      params.set("fv", finalValue.toString());
    }
    if (timePeriod !== DEFAULTS.timePeriod) {
      params.set("y", timePeriod.toString());
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [initialValue, finalValue, timePeriod, router]);

  // Copy share link to clipboard
  const handleShare = async () => {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const result = useMemo(() => {
    return calculateCAGR(initialValue, finalValue, timePeriod);
  }, [initialValue, finalValue, timePeriod]);

  const breakdown = useMemo(() => {
    return calculateCAGRYearlyBreakdown(initialValue, result.cagr, timePeriod);
  }, [initialValue, result.cagr, timePeriod]);

  // Transform breakdown for the BreakdownTable component
  const tableData = useMemo(() => {
    return breakdown.map((row) => ({
      year: row.year,
      invested: initialValue,
      interest: row.yearlyGrowth,
      totalValue: row.value,
    }));
  }, [breakdown, initialValue]);

  // Determine if returns are positive or negative
  const isPositiveReturn = result.cagr >= 0;

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InputSlider
              label="Initial Investment"
              value={initialValue}
              onChange={setInitialValue}
              min={1000}
              max={1000000000}
              step={1000}
              prefix="₹"
            />
            <InputSlider
              label="Final Value"
              value={finalValue}
              onChange={setFinalValue}
              min={1000}
              max={1000000000}
              step={1000}
              prefix="₹"
            />
            <InputSlider
              label="Time Period"
              value={timePeriod}
              onChange={setTimePeriod}
              min={1}
              max={50}
              step={1}
              suffix=" years"
              formatValue={false}
            />
          </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-6">
          <ResultCard
            title="Compound Annual Growth Rate"
            mainValue={result.cagr}
            mainValueIsPercentage
            mainValueVariant={isPositiveReturn ? "default" : "destructive"}
            secondaryValue={{
              label: "Per year (annualized return)",
              value: `${timePeriod} year${timePeriod > 1 ? "s" : ""}`,
              isText: true,
            }}
            items={[
              { label: "Initial Value", value: initialValue },
              { label: "Final Value", value: finalValue },
              { label: "Absolute Returns", value: result.absoluteReturns, highlight: isPositiveReturn },
              { label: "Total Returns %", value: result.absoluteReturnsPercent, isPercentage: true, highlight: isPositiveReturn },
            ]}
          />

          {/* Share Button */}
          <Button variant="outline" className="w-full" onClick={handleShare}>
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Link Copied!
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                Share This Calculation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Year-by-Year Breakdown */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Year-by-Year Growth</h2>
        <BreakdownTable data={tableData} periodLabel="Year" />
      </div>

      {/* About CAGR */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">
          What is CAGR?
        </h2>
        <p className="text-muted-foreground">
          CAGR (Compound Annual Growth Rate) is the annualized average rate of
          return for an investment over a specified period longer than one year.
          Unlike simple average returns, CAGR accounts for the effect of
          compounding—it tells you what consistent yearly growth rate would be
          needed to take an investment from its initial to final value.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Why Use CAGR?
        </h3>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Compare Investments:</strong> CAGR
          lets you compare returns across different investments, regardless of
          their holding periods. A 5-year investment and a 10-year investment
          can be compared on equal footing using CAGR.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Smooth Out Volatility:</strong>{" "}
          Real investments fluctuate year-to-year. CAGR provides a single,
          smooth growth rate that represents the overall performance, making it
          easier to understand and communicate investment returns.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Measure Historical Performance:</strong>{" "}
          CAGR is widely used to measure the historical performance of stocks,
          mutual funds, real estate, and other assets. When someone says "Nifty
          50 has given 12% CAGR over the last 20 years," they mean the annualized
          compounded return.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          CAGR vs Simple Average Return
        </h3>
        <p className="text-muted-foreground">
          Consider an investment that goes up 100% in year 1 and down 50% in
          year 2. The simple average return is 25% ((100% - 50%) / 2). But if
          you invested ₹100, you would have ₹200 after year 1 and ₹100 after
          year 2—ending exactly where you started! The CAGR is 0%, which
          accurately reflects the actual outcome.
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How CAGR Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator computes the CAGR using the standard formula. Enter
            your initial investment value, final value, and the number of years
            to find the annualized rate of return.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Formula used:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            CAGR = (Final Value / Initial Value)^(1/n) - 1
          </code>
          <p className="mt-4 text-sm">
            Where n = Number of years. The result is expressed as a percentage.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
