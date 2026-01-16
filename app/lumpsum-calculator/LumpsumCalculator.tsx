"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import {
  InputSlider,
  ResultCard,
  DonutChart,
  BreakdownTable,
} from "@/components/calculator";
import {
  calculateLumpsum,
  calculateLumpsumYearlyBreakdown,
} from "@/lib/calculators/lumpsum";

// Default values
const DEFAULTS = {
  investment: 100000,
  expectedReturn: 12,
  timePeriod: 10,
  inflationRate: 6,
};

function parseNumber(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const num = parseFloat(value);
  if (isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function parseBoolean(value: string | null): boolean {
  return value === "1" || value === "true";
}

export function LumpsumCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [investment, setInvestment] = useState(() =>
    parseNumber(searchParams.get("p"), DEFAULTS.investment, 1000, 1000000000)
  );
  const [expectedReturn, setExpectedReturn] = useState(() =>
    parseNumber(searchParams.get("r"), DEFAULTS.expectedReturn, 1, 30)
  );
  const [timePeriod, setTimePeriod] = useState(() =>
    parseNumber(searchParams.get("y"), DEFAULTS.timePeriod, 1, 40)
  );
  const [inflationEnabled, setInflationEnabled] = useState(() =>
    parseBoolean(searchParams.get("inf"))
  );
  const [inflationRate, setInflationRate] = useState(() =>
    parseNumber(searchParams.get("infr"), DEFAULTS.inflationRate, 1, 15)
  );

  // Build shareable URL
  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("p", investment.toString());
    params.set("r", expectedReturn.toString());
    params.set("y", timePeriod.toString());
    if (inflationEnabled) {
      params.set("inf", "1");
      params.set("infr", inflationRate.toString());
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [investment, expectedReturn, timePeriod, inflationEnabled, inflationRate]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (investment !== DEFAULTS.investment) {
      params.set("p", investment.toString());
    }
    if (expectedReturn !== DEFAULTS.expectedReturn) {
      params.set("r", expectedReturn.toString());
    }
    if (timePeriod !== DEFAULTS.timePeriod) {
      params.set("y", timePeriod.toString());
    }
    if (inflationEnabled) {
      params.set("inf", "1");
      if (inflationRate !== DEFAULTS.inflationRate) {
        params.set("infr", inflationRate.toString());
      }
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [investment, expectedReturn, timePeriod, inflationEnabled, inflationRate, router]);

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
    return calculateLumpsum(investment, expectedReturn, timePeriod);
  }, [investment, expectedReturn, timePeriod]);

  const breakdown = useMemo(() => {
    return calculateLumpsumYearlyBreakdown(investment, expectedReturn, timePeriod);
  }, [investment, expectedReturn, timePeriod]);

  // Calculate inflation-adjusted maturity value
  const inflationAdjustedValue = useMemo(() => {
    if (!inflationEnabled) return null;
    return Math.round(
      result.finalAmount / Math.pow(1 + inflationRate / 100, timePeriod)
    );
  }, [result.finalAmount, inflationEnabled, inflationRate, timePeriod]);

  // Add inflation-adjusted values to breakdown
  const breakdownWithInflation = useMemo(() => {
    if (!inflationEnabled) return breakdown;
    return breakdown.map((row) => ({
      ...row,
      inflationAdjustedValue: Math.round(
        row.totalValue / Math.pow(1 + inflationRate / 100, row.year)
      ),
    }));
  }, [breakdown, inflationEnabled, inflationRate]);

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
              label="Investment Amount"
              value={investment}
              onChange={setInvestment}
              min={1000}
              max={1000000000}
              step={1000}
              prefix="₹"
            />
            <InputSlider
              label="Expected Return (p.a.)"
              value={expectedReturn}
              onChange={setExpectedReturn}
              min={1}
              max={30}
              step={0.5}
              suffix="%"
              formatValue={false}
            />
            <InputSlider
              label="Time Period"
              value={timePeriod}
              onChange={setTimePeriod}
              min={1}
              max={40}
              step={1}
              suffix=" years"
              formatValue={false}
            />

            {/* Inflation Toggle */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="inflation-toggle" className="text-sm font-medium">
                    Adjust for Inflation
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show value in today&apos;s money
                  </p>
                </div>
                <Switch
                  id="inflation-toggle"
                  checked={inflationEnabled}
                  onCheckedChange={setInflationEnabled}
                />
              </div>

              {inflationEnabled && (
                <div className="mt-4">
                  <InputSlider
                    label="Expected Inflation"
                    value={inflationRate}
                    onChange={setInflationRate}
                    min={1}
                    max={15}
                    step={0.5}
                    suffix="%"
                    formatValue={false}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-6">
          <ResultCard
            title="Total Value"
            mainValue={result.finalAmount}
            secondaryValue={
              inflationEnabled && inflationAdjustedValue
                ? { label: "Inflation adjusted", value: inflationAdjustedValue }
                : undefined
            }
            items={[
              { label: "Invested Amount", value: result.totalInvested },
              { label: "Est. Returns", value: result.totalReturns, highlight: true },
            ]}
          />
          <Card>
            <CardContent className="pt-6">
              <DonutChart
                invested={result.totalInvested}
                returns={result.totalReturns}
              />
            </CardContent>
          </Card>

          {/* Share Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleShare}
          >
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
        <h2 className="text-xl font-semibold mb-4">Year-by-Year Breakdown</h2>
        <BreakdownTable data={breakdownWithInflation} />
      </div>

      {/* About Lumpsum */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">What is Lumpsum Investment?</h2>
        <p className="text-muted-foreground">
          A lumpsum investment is a one-time investment where you invest a large amount of money
          at once, as opposed to spreading it out over time through methods like SIP. Lumpsum
          investments are ideal when you receive a windfall—such as a bonus, inheritance, or
          sale proceeds—and want to put the money to work immediately in mutual funds or other
          investment vehicles.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">When to Choose Lumpsum Over SIP</h3>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Market Timing:</strong> If you believe markets are
          at a relatively low point, a lumpsum investment can capture more upside as markets
          recover. However, timing the market is notoriously difficult, even for experts.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Available Capital:</strong> Lumpsum investing
          makes sense when you have a significant amount of money ready to invest. The entire
          corpus starts earning returns immediately, rather than waiting for gradual deployment.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Long Investment Horizon:</strong> With a longer
          time horizon (10+ years), short-term market volatility matters less. Historically,
          equity markets have trended upward over extended periods.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Lumpsum vs SIP: Key Differences</h3>
        <p className="text-muted-foreground">
          In a SIP, you invest fixed amounts regularly, which averages out your purchase price
          over time (rupee cost averaging). In a lumpsum investment, your entire capital is
          exposed to market movements from day one. This means higher potential returns in
          rising markets, but also higher risk in falling markets. Many investors use a
          combination of both strategies—investing a portion as lumpsum and the rest through SIP.
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Lumpsum Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator estimates your lumpsum investment returns using the compound interest
            formula. Enter your one-time investment amount, expected annual return rate, and
            investment duration to see your projected corpus.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Formula used:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            A = P × (1 + r)^t
          </code>
          <p className="mt-4 text-sm">
            Where A = Final amount, P = Initial investment (principal),
            r = Annual return rate (as decimal), t = Time in years
          </p>
        </CardContent>
      </Card>
    </>
  );
}
