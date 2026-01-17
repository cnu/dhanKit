"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Share2, Check, TrendingDown, Clock, AlertTriangle } from "lucide-react";
import {
  InputSlider,
  ResultCard,
  DonutChart,
} from "@/components/calculator";
import { ComparisonChart } from "@/components/calculator/ComparisonChart";
import {
  calculateCostOfDelay,
  calculateCostOfDelayBreakdown,
  getInflationAdjustedCost,
  getRealReturnRate,
} from "@/lib/calculators/cost-of-delay";
import { formatIndianCurrency, formatIndianNumber } from "@/lib/format";

const DEFAULTS = {
  monthlyInvestment: 5000,
  expectedReturn: 12,
  currentAge: 25,
  retirementAge: 60,
  delayYears: 5,
  stepUpPercent: 10,
  inflationRate: 6,
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

function parseBoolean(value: string | null): boolean {
  return value === "1" || value === "true";
}

export function CostOfDelayCalculator() {
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
  const [currentAge, setCurrentAge] = useState(() =>
    parseNumber(searchParams.get("a"), DEFAULTS.currentAge, 18, 65)
  );
  const [retirementAge, setRetirementAge] = useState(() =>
    parseNumber(searchParams.get("ra"), DEFAULTS.retirementAge, 40, 75)
  );
  const [delayYears, setDelayYears] = useState(() =>
    parseNumber(searchParams.get("d"), DEFAULTS.delayYears, 1, 20)
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

  // Calculate max delay years based on age inputs
  const maxDelayYears = Math.max(1, retirementAge - currentAge - 1);

  // Auto-adjust delay if it exceeds max
  useEffect(() => {
    if (delayYears > maxDelayYears) {
      setDelayYears(maxDelayYears);
    }
  }, [delayYears, maxDelayYears]);

  // Build shareable URL
  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("m", monthlyInvestment.toString());
    params.set("r", expectedReturn.toString());
    params.set("a", currentAge.toString());
    params.set("ra", retirementAge.toString());
    params.set("d", delayYears.toString());
    if (stepUpEnabled) {
      params.set("su", "1");
      params.set("sup", stepUpPercent.toString());
    }
    if (inflationEnabled) {
      params.set("inf", "1");
      params.set("infr", inflationRate.toString());
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [
    monthlyInvestment,
    expectedReturn,
    currentAge,
    retirementAge,
    delayYears,
    stepUpEnabled,
    stepUpPercent,
    inflationEnabled,
    inflationRate,
  ]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    if (monthlyInvestment !== DEFAULTS.monthlyInvestment) {
      params.set("m", monthlyInvestment.toString());
    }
    if (expectedReturn !== DEFAULTS.expectedReturn) {
      params.set("r", expectedReturn.toString());
    }
    if (currentAge !== DEFAULTS.currentAge) {
      params.set("a", currentAge.toString());
    }
    if (retirementAge !== DEFAULTS.retirementAge) {
      params.set("ra", retirementAge.toString());
    }
    if (delayYears !== DEFAULTS.delayYears) {
      params.set("d", delayYears.toString());
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
  }, [
    monthlyInvestment,
    expectedReturn,
    currentAge,
    retirementAge,
    delayYears,
    stepUpEnabled,
    stepUpPercent,
    inflationEnabled,
    inflationRate,
    router,
  ]);

  // Copy share link to clipboard
  const handleShare = async () => {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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
    return calculateCostOfDelay(
      monthlyInvestment,
      expectedReturn,
      currentAge,
      retirementAge,
      delayYears,
      stepUpEnabled ? { stepUpEnabled: true, stepUpPercent } : undefined
    );
  }, [
    monthlyInvestment,
    expectedReturn,
    currentAge,
    retirementAge,
    delayYears,
    stepUpEnabled,
    stepUpPercent,
  ]);

  // Generate chart data
  const chartData = useMemo(() => {
    const breakdown = calculateCostOfDelayBreakdown(
      monthlyInvestment,
      expectedReturn,
      currentAge,
      retirementAge,
      delayYears,
      stepUpEnabled ? { stepUpEnabled: true, stepUpPercent } : undefined
    );

    return breakdown.map((row) => ({
      year: row.year,
      age: row.age,
      startNow: row.startNowValue,
      startLater: row.startLaterValue,
    }));
  }, [
    monthlyInvestment,
    expectedReturn,
    currentAge,
    retirementAge,
    delayYears,
    stepUpEnabled,
    stepUpPercent,
  ]);

  // Inflation-adjusted cost
  const inflationAdjustedCost = useMemo(() => {
    if (!inflationEnabled) return null;
    return getInflationAdjustedCost(
      result.costOfDelay,
      result.startNowYears,
      inflationRate
    );
  }, [inflationEnabled, result.costOfDelay, result.startNowYears, inflationRate]);

  // Real return rate
  const realReturnRate = useMemo(() => {
    if (!inflationEnabled) return null;
    return getRealReturnRate(expectedReturn, inflationRate);
  }, [inflationEnabled, expectedReturn, inflationRate]);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InputSlider
              label="Monthly SIP"
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
              label="Your Current Age"
              value={currentAge}
              onChange={setCurrentAge}
              min={18}
              max={65}
              step={1}
              suffix=" years"
              formatValue={false}
            />
            <InputSlider
              label="Target Retirement Age"
              value={retirementAge}
              onChange={setRetirementAge}
              min={40}
              max={75}
              step={1}
              suffix=" years"
              formatValue={false}
            />

            {/* Delay Input - Key Input */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Delay Period</span>
              </div>
              <InputSlider
                label="Delay in Starting SIP"
                value={delayYears}
                onChange={setDelayYears}
                min={1}
                max={maxDelayYears}
                step={1}
                suffix=" years"
                formatValue={false}
              />
            </div>

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
                    Show cost in today&apos;s money
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
          {/* Primary Result - Cost of Delay */}
          <ResultCard
            title="Cost of Delay"
            mainValue={result.costOfDelay}
            mainValueVariant="destructive"
            secondaryValue={
              inflationEnabled && inflationAdjustedCost
                ? { label: "In today's value", value: Math.round(inflationAdjustedCost) }
                : undefined
            }
            tertiaryValue={
              inflationEnabled && realReturnRate !== null
                ? {
                    label: "Real return rate",
                    value: `${realReturnRate > 0 ? "+" : ""}${realReturnRate.toFixed(1)}%`,
                    variant: realReturnRate < 0 ? "destructive" : "default",
                  }
                : undefined
            }
            items={[
              { label: "% of Potential Wealth Lost", value: Math.round(result.percentageLoss), isPercentage: true, highlight: true },
              { label: "Start Now Corpus", value: result.startNowCorpus },
              { label: `Start at Age ${currentAge + delayYears} Corpus`, value: result.startLaterCorpus },
            ]}
          />

          {/* Impact Callout */}
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Every day you wait costs you</p>
                  <p className="text-2xl font-bold font-mono text-destructive">
                    {formatIndianCurrency(result.costPerDay)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Monthly cost of waiting:{" "}
                    <span className="font-mono font-medium text-destructive">
                      {formatIndianCurrency(result.costPerMonth)}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recovery Information */}
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-700">To catch up if you delay by {delayYears} years</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You would need to invest{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {formatIndianCurrency(result.requiredSIPToMatch)}/month
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    That&apos;s{" "}
                    <span className="font-mono font-medium text-amber-700">
                      +{formatIndianNumber(result.additionalSIPNeeded)} ({result.additionalSIPPercent}% more)
                    </span>{" "}
                    than starting today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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

      {/* Comparison Chart */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Wealth Growth Comparison</h2>
        <Card>
          <CardContent className="pt-6">
            <ComparisonChart
              data={chartData}
              currentAge={currentAge}
              delayYears={delayYears}
            />
          </CardContent>
        </Card>
      </div>

      {/* Side-by-Side Scenario Comparison */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Scenario Comparison</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Start Now Scenario */}
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-primary flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                Start Now (Age {currentAge})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Duration</span>
                  <span className="font-mono">{result.startNowYears} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-mono">{formatIndianCurrency(result.startNowInvested)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Returns</span>
                  <span className="font-mono text-primary">{formatIndianCurrency(result.startNowReturns)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-medium">Final Corpus</span>
                  <span className="font-mono font-bold text-primary">{formatIndianCurrency(result.startNowCorpus)}</span>
                </div>
              </div>
              <div className="mt-4">
                <DonutChart
                  invested={result.startNowInvested}
                  returns={result.startNowReturns}
                />
              </div>
            </CardContent>
          </Card>

          {/* Start Later Scenario */}
          <Card className="border-muted bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-muted-foreground flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-400" />
                Wait {delayYears} Years (Age {currentAge + delayYears})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Duration</span>
                  <span className="font-mono">{result.startLaterYears} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Invested</span>
                  <span className="font-mono">{formatIndianCurrency(result.startLaterInvested)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Returns</span>
                  <span className="font-mono">{formatIndianCurrency(result.startLaterReturns)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="font-medium">Final Corpus</span>
                  <span className="font-mono font-bold">{formatIndianCurrency(result.startLaterCorpus)}</span>
                </div>
              </div>
              <div className="mt-4">
                <DonutChart
                  invested={result.startLaterInvested}
                  returns={result.startLaterReturns}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Educational Content */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">Why Time Matters More Than Amount</h2>
        <p className="text-muted-foreground">
          The cost of delay is one of the most underestimated factors in wealth building.
          When you delay starting your investments, you don&apos;t just miss out on a few
          years of contributions—you permanently lose the compound growth those early
          investments would have generated.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">The Power of Starting Early</h3>
        <p className="text-muted-foreground">
          Consider this: money invested early has more time to compound. At 12% annual returns,
          your money approximately doubles every 6 years. If you start at age 25 instead of 30,
          those first 5 years of investment get an extra doubling cycle—that&apos;s potentially
          2x more growth on your early contributions.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">The Catch-Up Problem</h3>
        <p className="text-muted-foreground">
          Once you delay, catching up becomes exponentially harder. As this calculator shows,
          to achieve the same corpus after a {delayYears}-year delay, you&apos;d need to invest
          significantly more each month. That&apos;s money that could have gone toward other
          financial goals—or simply enjoying life more.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Take Action Today</h3>
        <p className="text-muted-foreground">
          The best time to start investing was yesterday. The second best time is today.
          Even if you can only start with a small amount, beginning your investment journey
          now will put time on your side. You can always increase your SIP amount later
          as your income grows.
        </p>
      </div>

      {/* Formula Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How This Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator compares two scenarios: starting your SIP today versus
            starting after a delay period. It uses the standard SIP formula to
            calculate the corpus for both scenarios and shows you the difference.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Key calculations:</strong>
          </p>
          <ul className="mt-2 space-y-2">
            <li>
              <strong>Cost of Delay</strong> = Start Now Corpus - Start Later Corpus
            </li>
            <li>
              <strong>Daily Cost</strong> = Cost of Delay ÷ (Delay Years × 365)
            </li>
            <li>
              <strong>Required SIP to Match</strong> = Solving for monthly investment
              needed to reach the Start Now corpus in fewer years
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
