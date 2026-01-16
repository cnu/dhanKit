"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Check, Info } from "lucide-react";
import {
  InputSlider,
  ResultCard,
  DonutChart,
  BreakdownTable,
} from "@/components/calculator";
import { calculatePPF, calculatePPFYearlyBreakdown } from "@/lib/calculators/ppf";

// Default values
const DEFAULTS = {
  yearlyInvestment: 150000, // ₹1.5 lakh (max allowed)
  timePeriod: 15, // 15 years (minimum lock-in)
  interestRate: 7.1, // Current government rate
  inflationEnabled: false,
  inflationRate: 6,
};

function parseNumber(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const num = parseFloat(value);
  if (isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

function parseBoolean(value: string | null, fallback: boolean): boolean {
  if (!value) return fallback;
  return value === "1";
}

export function PPFCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [yearlyInvestment, setYearlyInvestment] = useState(() =>
    parseNumber(searchParams.get("y"), DEFAULTS.yearlyInvestment, 500, 150000)
  );
  const [timePeriod, setTimePeriod] = useState(() =>
    parseNumber(searchParams.get("years"), DEFAULTS.timePeriod, 15, 50)
  );
  const [interestRate, setInterestRate] = useState(() =>
    parseNumber(searchParams.get("r"), DEFAULTS.interestRate, 5, 10)
  );
  const [inflationEnabled, setInflationEnabled] = useState(() =>
    parseBoolean(searchParams.get("inf"), DEFAULTS.inflationEnabled)
  );
  const [inflationRate, setInflationRate] = useState(() =>
    parseNumber(searchParams.get("infr"), DEFAULTS.inflationRate, 1, 15)
  );

  // Build shareable URL
  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("y", yearlyInvestment.toString());
    params.set("years", timePeriod.toString());
    params.set("r", interestRate.toString());
    if (inflationEnabled) {
      params.set("inf", "1");
      params.set("infr", inflationRate.toString());
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [yearlyInvestment, timePeriod, interestRate, inflationEnabled, inflationRate]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (yearlyInvestment !== DEFAULTS.yearlyInvestment) {
      params.set("y", yearlyInvestment.toString());
    }
    if (timePeriod !== DEFAULTS.timePeriod) {
      params.set("years", timePeriod.toString());
    }
    if (interestRate !== DEFAULTS.interestRate) {
      params.set("r", interestRate.toString());
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
  }, [yearlyInvestment, timePeriod, interestRate, inflationEnabled, inflationRate, router]);

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

  // Calculate results
  const result = useMemo(() => {
    return calculatePPF(yearlyInvestment, timePeriod, interestRate);
  }, [yearlyInvestment, timePeriod, interestRate]);

  const yearlyBreakdown = useMemo(() => {
    return calculatePPFYearlyBreakdown(yearlyInvestment, timePeriod, interestRate);
  }, [yearlyInvestment, timePeriod, interestRate]);

  // Inflation adjustments
  const inflationAdjustedValue = useMemo(() => {
    if (!inflationEnabled) return null;
    return result.maturityAmount / Math.pow(1 + inflationRate / 100, timePeriod);
  }, [inflationEnabled, inflationRate, result.maturityAmount, timePeriod]);

  const realInterestRate = useMemo(() => {
    if (!inflationEnabled) return null;
    return ((1 + interestRate / 100) / (1 + inflationRate / 100) - 1) * 100;
  }, [inflationEnabled, interestRate, inflationRate]);

  // Prepare breakdown data for table
  const breakdownData = useMemo(() => {
    return yearlyBreakdown.map((row, index) => ({
      year: row.year,
      invested: row.invested,
      interest: row.interest,
      totalValue: row.balance,
      inflationAdjustedValue: inflationEnabled
        ? row.balance / Math.pow(1 + inflationRate / 100, index + 1)
        : undefined,
    }));
  }, [yearlyBreakdown, inflationEnabled, inflationRate]);

  return (
    <>
      {/* Info Banner */}
      <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
        <CardContent className="flex items-start gap-3 pt-4 pb-4">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            PPF interest rate is set by the Government of India and may change quarterly.
            Current rate: <strong>7.1% p.a.</strong> (FY 2024-25 Q4). Always check the latest rate before making decisions.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InputSlider
              label="Yearly Investment"
              value={yearlyInvestment}
              onChange={setYearlyInvestment}
              min={500}
              max={150000}
              step={500}
              prefix="₹"
            />
            <InputSlider
              label="Time Period"
              value={timePeriod}
              onChange={setTimePeriod}
              min={15}
              max={50}
              step={5}
              suffix=" years"
              formatValue={false}
            />
            <InputSlider
              label="Interest Rate (p.a.)"
              value={interestRate}
              onChange={setInterestRate}
              min={5}
              max={10}
              step={0.1}
              suffix="%"
              formatValue={false}
            />

            {/* Inflation Toggle */}
            <div className="pt-4 border-t">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inflationEnabled}
                  onChange={(e) => setInflationEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">
                  Adjust for inflation
                </span>
              </label>
              {inflationEnabled && (
                <div className="mt-4">
                  <InputSlider
                    label="Expected Inflation Rate"
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
            title="Maturity Value"
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
                    value: `${realInterestRate > 0 ? "+" : ""}${realInterestRate.toFixed(2)}%`,
                    variant: realInterestRate < 0 ? "destructive" : "default",
                  }
                : undefined
            }
            items={[
              { label: "Total Invested", value: result.totalInvested },
              { label: "Interest Earned", value: result.totalInterest, highlight: true },
            ]}
          />
          <Card>
            <CardContent className="pt-6">
              <DonutChart
                invested={result.totalInvested}
                returns={result.totalInterest}
                investedLabel="Invested"
                returnsLabel="Interest"
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
        <BreakdownTable data={breakdownData} periodLabel="Year" />
      </div>

      {/* About PPF */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">What is PPF?</h2>
        <p className="text-muted-foreground">
          PPF (Public Provident Fund) is a government-backed savings scheme in India that offers
          guaranteed returns with tax benefits. It&apos;s one of the safest long-term investment options
          available to Indian residents. The scheme is backed by the Government of India, making it
          virtually risk-free.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Key Features</h3>
        <ul className="text-muted-foreground space-y-2 list-disc list-inside">
          <li><strong className="text-foreground">Lock-in Period:</strong> 15 years minimum, with option to extend in 5-year blocks</li>
          <li><strong className="text-foreground">Investment Limits:</strong> Minimum ₹500/year, Maximum ₹1,50,000/year</li>
          <li><strong className="text-foreground">Tax Benefits:</strong> EEE status - contributions (up to ₹1.5L under 80C), interest, and maturity are all tax-free</li>
          <li><strong className="text-foreground">Compounding:</strong> Interest compounded annually at end of financial year</li>
          <li><strong className="text-foreground">Partial Withdrawal:</strong> Allowed from 7th year onwards under certain conditions</li>
          <li><strong className="text-foreground">Loan Facility:</strong> Available from 3rd to 6th year against PPF balance</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">Why Invest in PPF?</h3>
        <p className="text-muted-foreground">
          PPF is ideal for conservative investors looking for guaranteed, tax-free returns. The 15-year
          lock-in makes it perfect for long-term goals like retirement or children&apos;s education. Since
          returns are government-guaranteed, there&apos;s zero market risk. The triple tax exemption (EEE)
          makes it one of the most tax-efficient instruments available.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Tip:</strong> To maximize PPF returns, invest before the 5th of each month.
          Interest is calculated on the lowest balance between the 5th and end of month, so early
          deposits earn more interest.
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How PPF Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator uses the standard PPF compounding formula where interest is compounded
            annually at the end of each financial year. Enter your yearly investment amount, time
            period, and expected interest rate to see your maturity value.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Formula used:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            Balance = (Previous Balance + Yearly Deposit) × (1 + r)
          </code>
          <p className="mt-4 text-sm">
            Where r = annual interest rate / 100. This formula is applied for each year of the
            investment period, assuming deposit at the start of the year.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
