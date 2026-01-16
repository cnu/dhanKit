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
} from "@/components/calculator";
import { formatIndianCurrency } from "@/lib/format";
import {
  calculateNPS,
  calculateNPSYearlyBreakdown,
} from "@/lib/calculators/nps";

// Default values
const DEFAULTS = {
  currentAge: 30,
  monthlyInvestment: 5000,
  expectedReturn: 10,
  annuityRate: 6,
  annuityPercent: 40,
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

export function NPSCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [currentAge, setCurrentAge] = useState(() =>
    parseNumber(searchParams.get("a"), DEFAULTS.currentAge, 18, 59)
  );
  const [monthlyInvestment, setMonthlyInvestment] = useState(() =>
    parseNumber(searchParams.get("m"), DEFAULTS.monthlyInvestment, 500, 100000)
  );
  const [expectedReturn, setExpectedReturn] = useState(() =>
    parseNumber(searchParams.get("r"), DEFAULTS.expectedReturn, 8, 14)
  );
  const [annuityRate, setAnnuityRate] = useState(() =>
    parseNumber(searchParams.get("ar"), DEFAULTS.annuityRate, 4, 8)
  );
  const [customSplitEnabled, setCustomSplitEnabled] = useState(() =>
    parseBoolean(searchParams.get("cs"))
  );
  const [annuityPercent, setAnnuityPercent] = useState(() =>
    parseNumber(searchParams.get("ap"), DEFAULTS.annuityPercent, 40, 100)
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
    params.set("a", currentAge.toString());
    params.set("m", monthlyInvestment.toString());
    params.set("r", expectedReturn.toString());
    params.set("ar", annuityRate.toString());
    if (customSplitEnabled) {
      params.set("cs", "1");
      params.set("ap", annuityPercent.toString());
    }
    if (inflationEnabled) {
      params.set("inf", "1");
      params.set("infr", inflationRate.toString());
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [currentAge, monthlyInvestment, expectedReturn, annuityRate, customSplitEnabled, annuityPercent, inflationEnabled, inflationRate]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (currentAge !== DEFAULTS.currentAge) {
      params.set("a", currentAge.toString());
    }
    if (monthlyInvestment !== DEFAULTS.monthlyInvestment) {
      params.set("m", monthlyInvestment.toString());
    }
    if (expectedReturn !== DEFAULTS.expectedReturn) {
      params.set("r", expectedReturn.toString());
    }
    if (annuityRate !== DEFAULTS.annuityRate) {
      params.set("ar", annuityRate.toString());
    }
    if (customSplitEnabled) {
      params.set("cs", "1");
      if (annuityPercent !== DEFAULTS.annuityPercent) {
        params.set("ap", annuityPercent.toString());
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
  }, [currentAge, monthlyInvestment, expectedReturn, annuityRate, customSplitEnabled, annuityPercent, inflationEnabled, inflationRate, router]);

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
    const effectiveAnnuityPercent = customSplitEnabled ? annuityPercent : 40;
    return calculateNPS(currentAge, monthlyInvestment, expectedReturn, annuityRate, effectiveAnnuityPercent);
  }, [currentAge, monthlyInvestment, expectedReturn, annuityRate, customSplitEnabled, annuityPercent]);

  const breakdown = useMemo(() => {
    return calculateNPSYearlyBreakdown(currentAge, monthlyInvestment, expectedReturn);
  }, [currentAge, monthlyInvestment, expectedReturn]);

  // Calculate inflation-adjusted corpus value (in today's money)
  const inflationAdjustedCorpus = useMemo(() => {
    if (!inflationEnabled) return null;
    return Math.round(
      result.totalCorpus / Math.pow(1 + inflationRate / 100, result.yearsToRetirement)
    );
  }, [result.totalCorpus, result.yearsToRetirement, inflationEnabled, inflationRate]);

  // Calculate inflation-adjusted monthly pension (in today's money)
  const inflationAdjustedPension = useMemo(() => {
    if (!inflationEnabled) return null;
    return Math.round(
      result.monthlyPension / Math.pow(1 + inflationRate / 100, result.yearsToRetirement)
    );
  }, [result.monthlyPension, result.yearsToRetirement, inflationEnabled, inflationRate]);

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

  // State for showing all breakdown rows
  const [showAll, setShowAll] = useState(false);
  const initialRows = 5;
  const displayBreakdown = showAll ? breakdownWithInflation : breakdownWithInflation.slice(0, initialRows);
  const hasMore = breakdownWithInflation.length > initialRows;

  // Calculate lumpsum percentage for display
  const lumpsumPercent = 100 - result.annuityPercent;

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
              label="Current Age"
              value={currentAge}
              onChange={setCurrentAge}
              min={18}
              max={59}
              step={1}
              suffix=" years"
              formatValue={false}
            />
            <InputSlider
              label="Monthly Investment"
              value={monthlyInvestment}
              onChange={setMonthlyInvestment}
              min={500}
              max={100000}
              step={500}
              prefix="₹"
            />
            <InputSlider
              label="Expected Return (p.a.)"
              value={expectedReturn}
              onChange={setExpectedReturn}
              min={8}
              max={14}
              step={0.5}
              suffix="%"
              formatValue={false}
            />
            <InputSlider
              label="Expected Annuity Rate"
              value={annuityRate}
              onChange={setAnnuityRate}
              min={4}
              max={8}
              step={0.5}
              suffix="%"
              formatValue={false}
            />

            {/* Custom Split Toggle */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="split-toggle" className="text-sm font-medium">
                    Custom Annuity Split
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allocate more to annuity for higher pension
                  </p>
                </div>
                <Switch
                  id="split-toggle"
                  checked={customSplitEnabled}
                  onCheckedChange={setCustomSplitEnabled}
                />
              </div>

              {customSplitEnabled && (
                <div className="mt-4">
                  <InputSlider
                    label="Annuity Allocation"
                    value={annuityPercent}
                    onChange={setAnnuityPercent}
                    min={40}
                    max={100}
                    step={5}
                    suffix="%"
                    formatValue={false}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {annuityPercent}% to annuity, {100 - annuityPercent}% as lumpsum
                  </p>
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
            title="Total Corpus at 60"
            mainValue={result.totalCorpus}
            secondaryValue={
              inflationEnabled && inflationAdjustedCorpus
                ? { label: "Inflation adjusted corpus", value: inflationAdjustedCorpus }
                : {
                    label: "Monthly Pension",
                    value: result.monthlyPension,
                  }
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
              { label: `Lumpsum (${lumpsumPercent}%)`, value: result.lumpsumWithdrawal },
              { label: `Annuity (${result.annuityPercent}%)`, value: result.annuityInvestment },
            ]}
          />

          {/* Monthly Pension Card - shown when inflation is enabled */}
          {inflationEnabled && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Pension</p>
                    <p className="text-2xl font-bold font-mono text-primary">
                      {formatIndianCurrency(result.monthlyPension)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Inflation Adjusted</p>
                    <p className="text-2xl font-bold font-mono text-muted-foreground">
                      {formatIndianCurrency(inflationAdjustedPension ?? 0)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  In today&apos;s money, your pension of {formatIndianCurrency(result.monthlyPension)} will have
                  the purchasing power of {formatIndianCurrency(inflationAdjustedPension ?? 0)}
                </p>
              </CardContent>
            </Card>
          )}

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
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Year</th>
                  <th className="px-4 py-3 text-left font-medium">Age</th>
                  <th className="px-4 py-3 text-right font-medium">Invested</th>
                  <th className="px-4 py-3 text-right font-medium">Interest</th>
                  <th className="px-4 py-3 text-right font-medium">Total Value</th>
                  {inflationEnabled && (
                    <th className="px-4 py-3 text-right font-medium">Adjusted Value</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayBreakdown.map((row) => (
                  <tr key={row.year} className="border-t border-border">
                    <td className="px-4 py-3">{row.year}</td>
                    <td className="px-4 py-3">{row.age}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatIndianCurrency(row.invested)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-primary">
                      {formatIndianCurrency(row.interest)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {formatIndianCurrency(row.totalValue)}
                    </td>
                    {inflationEnabled && (
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                        {formatIndianCurrency((row as typeof row & { inflationAdjustedValue?: number }).inflationAdjustedValue ?? 0)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : `Show All ${breakdownWithInflation.length} Rows`}
            </Button>
          )}
        </div>
      </div>

      {/* About NPS */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">What is NPS?</h2>
        <p className="text-muted-foreground">
          The National Pension System (NPS) is a voluntary, defined contribution retirement
          savings scheme designed by the Government of India to enable systematic savings
          during your working life. It is regulated by the Pension Fund Regulatory and
          Development Authority (PFRDA). NPS offers a mix of equity, corporate bonds, and
          government securities, allowing investors to choose their asset allocation based
          on risk appetite.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Key Features of NPS</h3>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Flexible Investment:</strong> You can invest
          as low as ₹500 per month with no upper limit on contributions. Choose between
          active choice (you select asset allocation) or auto choice (age-based automatic
          allocation).
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Tax Benefits:</strong> NPS offers triple tax
          benefits under Section 80CCD. You can claim up to ₹1.5 lakh under 80CCD(1) as part
          of 80C limit, plus an additional ₹50,000 under 80CCD(1B) exclusively for NPS.
          Employer contributions up to 10% of salary are also deductible under 80CCD(2).
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Retirement Corpus Split:</strong> At retirement
          (age 60), you can withdraw up to 60% of the corpus as a tax-free lumpsum. The
          remaining 40% (minimum) must be used to purchase an annuity from an empaneled insurance
          company. You can choose to allocate more to annuity (up to 100%) for a higher monthly
          pension.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Understanding Annuity</h3>
        <p className="text-muted-foreground">
          An annuity is a financial product that converts your retirement corpus into a
          stream of regular income. The annuity rate (typically 4-8%) determines how much
          monthly pension you&apos;ll receive. Current annuity rates in India hover around
          5-6% for immediate annuities. The pension you receive is taxable as per your
          income tax slab.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Choosing Your Split Ratio</h3>
        <p className="text-muted-foreground">
          The default 60:40 split (60% lumpsum, 40% annuity) maximizes your tax-free withdrawal.
          However, if you want higher monthly pension income, you can choose to allocate more
          to annuity. For example, a 50:50 split gives you 25% more monthly pension, while
          100% annuity gives you 2.5x the pension but no lumpsum withdrawal.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Why Inflation Adjustment Matters</h3>
        <p className="text-muted-foreground">
          Inflation erodes the purchasing power of money over time. A corpus of ₹1 crore
          30 years from now won&apos;t buy what ₹1 crore can buy today. The inflation adjustment
          feature shows you the real value of your retirement corpus and pension in today&apos;s
          terms, helping you plan more realistically for retirement.
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How NPS Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator estimates your NPS corpus at retirement using the compound
            interest formula for regular monthly investments. Enter your current age,
            monthly contribution, expected returns, annuity rate, and optionally customize
            the annuity split ratio to see your projected retirement corpus and monthly pension.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Formula used:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            Corpus = P × ((1 + r)^n - 1) / r × (1 + r)
          </code>
          <p className="mt-4 text-sm">
            Where Corpus = Total value at retirement, P = Monthly investment,
            r = Effective monthly rate, n = Months until retirement (age 60)
          </p>
          <p className="mt-4 text-sm">
            Monthly Pension = (Annuity Amount × Annuity Rate) / 12
          </p>
          <p className="mt-4 text-sm">
            Inflation Adjusted Value = Future Value / (1 + Inflation Rate)^Years
          </p>
        </CardContent>
      </Card>
    </>
  );
}
