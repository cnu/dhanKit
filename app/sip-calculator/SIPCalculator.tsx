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
  calculateSIP,
  calculateSIPYearlyBreakdown,
  calculateStepUpSIP,
  calculateStepUpSIPYearlyBreakdown,
  type StepUpSIPResult,
} from "@/lib/calculators/sip";

// Default values
const DEFAULTS = {
  monthlyInvestment: 5000,
  expectedReturn: 12,
  timePeriod: 10,
  stepUpPercent: 10,
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

export function SIPCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [monthlyInvestment, setMonthlyInvestment] = useState(() =>
    parseNumber(searchParams.get("m"), DEFAULTS.monthlyInvestment, 500, 1000000)
  );
  const [expectedReturn, setExpectedReturn] = useState(() =>
    parseNumber(searchParams.get("r"), DEFAULTS.expectedReturn, 1, 30)
  );
  const [timePeriod, setTimePeriod] = useState(() =>
    parseNumber(searchParams.get("y"), DEFAULTS.timePeriod, 1, 40)
  );
  const [stepUpEnabled, setStepUpEnabled] = useState(() =>
    parseBoolean(searchParams.get("su"))
  );
  const [stepUpPercent, setStepUpPercent] = useState(() =>
    parseNumber(searchParams.get("sup"), DEFAULTS.stepUpPercent, 1, 50)
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
    params.set("m", monthlyInvestment.toString());
    params.set("r", expectedReturn.toString());
    params.set("y", timePeriod.toString());
    if (stepUpEnabled) {
      params.set("su", "1");
      params.set("sup", stepUpPercent.toString());
    }
    if (inflationEnabled) {
      params.set("inf", "1");
      params.set("infr", inflationRate.toString());
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [monthlyInvestment, expectedReturn, timePeriod, stepUpEnabled, stepUpPercent, inflationEnabled, inflationRate]);

  // Update URL when values change (debounced)
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (monthlyInvestment !== DEFAULTS.monthlyInvestment) {
      params.set("m", monthlyInvestment.toString());
    }
    if (expectedReturn !== DEFAULTS.expectedReturn) {
      params.set("r", expectedReturn.toString());
    }
    if (timePeriod !== DEFAULTS.timePeriod) {
      params.set("y", timePeriod.toString());
    }
    if (stepUpEnabled) {
      params.set("su", "1");
      if (stepUpPercent !== DEFAULTS.stepUpPercent) {
        params.set("sup", stepUpPercent.toString());
      }
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
  }, [monthlyInvestment, expectedReturn, timePeriod, stepUpEnabled, stepUpPercent, inflationEnabled, inflationRate, router]);

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
    if (stepUpEnabled) {
      return calculateStepUpSIP(
        monthlyInvestment,
        expectedReturn,
        timePeriod,
        stepUpPercent
      );
    }
    return calculateSIP(monthlyInvestment, expectedReturn, timePeriod);
  }, [monthlyInvestment, expectedReturn, timePeriod, stepUpEnabled, stepUpPercent]);

  const breakdown = useMemo(() => {
    if (stepUpEnabled) {
      return calculateStepUpSIPYearlyBreakdown(
        monthlyInvestment,
        expectedReturn,
        timePeriod,
        stepUpPercent
      );
    }
    return calculateSIPYearlyBreakdown(monthlyInvestment, expectedReturn, timePeriod);
  }, [monthlyInvestment, expectedReturn, timePeriod, stepUpEnabled, stepUpPercent]);

  // For showing comparison when step-up is enabled
  const stepUpBenefit = useMemo(() => {
    if (stepUpEnabled) {
      const stepUpResult = result as StepUpSIPResult;
      return stepUpResult.maturityAmount - stepUpResult.withoutStepUp.maturityAmount;
    }
    return 0;
  }, [result, stepUpEnabled]);

  // Calculate inflation-adjusted maturity value
  const inflationAdjustedValue = useMemo(() => {
    if (!inflationEnabled) return null;
    return Math.round(
      result.maturityAmount / Math.pow(1 + inflationRate / 100, timePeriod)
    );
  }, [result.maturityAmount, inflationEnabled, inflationRate, timePeriod]);

  // Calculate real interest rate (inflation-adjusted)
  // Formula: Real Rate = ((1 + nominal) / (1 + inflation) - 1) × 100
  const realInterestRate = useMemo(() => {
    if (!inflationEnabled) return null;
    const realRate = ((1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
    return Math.round(realRate * 100) / 100; // Round to 2 decimal places
  }, [inflationEnabled, expectedReturn, inflationRate]);

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
              label="Monthly Investment"
              value={monthlyInvestment}
              onChange={setMonthlyInvestment}
              min={500}
              max={1000000}
              step={500}
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

            {/* Step-Up Toggle */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="step-up-toggle" className="text-sm font-medium">
                    Annual Step-Up
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Increase SIP amount yearly
                  </p>
                </div>
                <Switch
                  id="step-up-toggle"
                  checked={stepUpEnabled}
                  onCheckedChange={setStepUpEnabled}
                />
              </div>

              {stepUpEnabled && (
                <div className="mt-4">
                  <InputSlider
                    label="Annual Step-Up"
                    value={stepUpPercent}
                    onChange={setStepUpPercent}
                    min={1}
                    max={50}
                    step={1}
                    suffix="%"
                    formatValue={false}
                  />
                </div>
              )}
            </div>

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
            mainValue={result.maturityAmount}
            secondaryValue={
              inflationEnabled && inflationAdjustedValue
                ? { label: "Inflation adjusted", value: inflationAdjustedValue }
                : undefined
            }
            tertiaryValue={
              inflationEnabled && realInterestRate !== null
                ? {
                    label: "Real return rate",
                    value: `${realInterestRate > 0 ? "+" : ""}${realInterestRate}%`,
                    variant: realInterestRate < 0 ? "destructive" : "default",
                  }
                : undefined
            }
            items={[
              { label: "Invested Amount", value: result.totalInvested },
              { label: "Est. Returns", value: result.totalReturns, highlight: true },
              ...(stepUpEnabled && stepUpBenefit > 0
                ? [{ label: "Step-Up Benefit", value: stepUpBenefit, highlight: true }]
                : []),
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

      {/* About SIP */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">What is a SIP?</h2>
        <p className="text-muted-foreground">
          A Systematic Investment Plan (SIP) is a method of investing a fixed amount regularly
          in mutual funds. Instead of investing a lump sum, you invest smaller amounts at
          regular intervals (usually monthly), making it easier to build wealth over time
          without straining your budget. SIPs have become one of the most popular investment
          options for salaried individuals in India.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Benefits of SIP Investing</h3>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Rupee Cost Averaging:</strong> When markets are
          down, your fixed SIP amount buys more units. When markets are up, you buy fewer units.
          Over time, this averages out your purchase cost and reduces the impact of market
          volatility on your investment.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Power of Compounding:</strong> The returns you
          earn get reinvested, generating their own returns. Starting early and staying
          invested for the long term can significantly multiply your wealth. Even a modest
          monthly investment can grow into a substantial corpus over 15-20 years.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Disciplined Investing:</strong> SIPs automate
          your investments, removing the temptation to time the market or skip contributions.
          This discipline is often the difference between successful and unsuccessful investors.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Tips for SIP Investors</h3>
        <p className="text-muted-foreground">
          Start as early as possible—time in the market matters more than timing the market.
          Choose funds based on your risk appetite and investment horizon. Consider using the
          step-up feature to increase your SIP amount annually as your income grows. Most
          importantly, stay invested through market ups and downs; stopping your SIP during
          market corrections often means missing the recovery.
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How SIP Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator estimates your SIP returns using the compound interest formula
            for regular investments. Enter your monthly investment amount, expected annual
            return rate, and investment duration to see your projected corpus.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Formula used:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            M = P × ((1 + r)^n - 1) / r × (1 + r)
          </code>
          <p className="mt-4 text-sm">
            Where M = Maturity amount, P = Monthly investment,
            r = Effective monthly rate, n = Number of months
          </p>
        </CardContent>
      </Card>
    </>
  );
}
