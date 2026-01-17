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
  calculateGoalPlanner,
  calculateGoalPlannerYearlyBreakdown,
  calculateStepUpGoalPlanner,
  calculateStepUpGoalPlannerYearlyBreakdown,
  type StepUpGoalPlannerResult,
} from "@/lib/calculators/goal-planner";

// Default values
const DEFAULTS = {
  targetAmount: 5000000, // ₹50 Lakhs
  expectedReturn: 12,
  timePeriod: 10,
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

export function GoalPlannerCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [targetAmount, setTargetAmount] = useState(() =>
    parseNumber(searchParams.get("t"), DEFAULTS.targetAmount, 100000, 100000000)
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
    params.set("t", targetAmount.toString());
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
  }, [
    targetAmount,
    expectedReturn,
    timePeriod,
    stepUpEnabled,
    stepUpPercent,
    inflationEnabled,
    inflationRate,
  ]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (targetAmount !== DEFAULTS.targetAmount) {
      params.set("t", targetAmount.toString());
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
  }, [
    targetAmount,
    expectedReturn,
    timePeriod,
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
      return calculateStepUpGoalPlanner(
        targetAmount,
        expectedReturn,
        timePeriod,
        stepUpPercent
      );
    }
    return calculateGoalPlanner(targetAmount, expectedReturn, timePeriod);
  }, [targetAmount, expectedReturn, timePeriod, stepUpEnabled, stepUpPercent]);

  const breakdown = useMemo(() => {
    if (stepUpEnabled) {
      return calculateStepUpGoalPlannerYearlyBreakdown(
        targetAmount,
        expectedReturn,
        timePeriod,
        stepUpPercent
      );
    }
    return calculateGoalPlannerYearlyBreakdown(
      targetAmount,
      expectedReturn,
      timePeriod
    );
  }, [targetAmount, expectedReturn, timePeriod, stepUpEnabled, stepUpPercent]);

  // For showing comparison when step-up is enabled
  const stepUpBenefit = useMemo(() => {
    if (stepUpEnabled) {
      const stepUpResult = result as StepUpGoalPlannerResult;
      // Step-up benefit: how much less you start with compared to flat SIP
      return (
        stepUpResult.withoutStepUp.requiredMonthlySIP -
        stepUpResult.requiredMonthlySIP
      );
    }
    return 0;
  }, [result, stepUpEnabled]);

  // Calculate inflation-adjusted target (what the target is worth in today's money)
  const inflationAdjustedTarget = useMemo(() => {
    if (!inflationEnabled) return null;
    return Math.round(
      targetAmount / Math.pow(1 + inflationRate / 100, timePeriod)
    );
  }, [targetAmount, inflationEnabled, inflationRate, timePeriod]);

  // Calculate real interest rate (inflation-adjusted)
  const realInterestRate = useMemo(() => {
    if (!inflationEnabled) return null;
    const realRate =
      ((1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
    return Math.round(realRate * 100) / 100;
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
            <CardTitle>Goal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InputSlider
              label="Target Amount"
              value={targetAmount}
              onChange={setTargetAmount}
              min={100000}
              max={100000000}
              step={100000}
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
                  <Label
                    htmlFor="inflation-toggle"
                    className="text-sm font-medium"
                  >
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
            title="Required Monthly SIP"
            mainValue={result.requiredMonthlySIP}
            secondaryValue={
              inflationEnabled && inflationAdjustedTarget
                ? {
                    label: "Target in today's value",
                    value: inflationAdjustedTarget,
                  }
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
              { label: "Target Amount", value: targetAmount },
              { label: "Total Investment", value: result.totalInvested },
              { label: "Est. Returns", value: result.totalReturns, highlight: true },
              ...(stepUpEnabled && stepUpBenefit > 0
                ? [
                    {
                      label: "Lower starting SIP vs flat",
                      value: stepUpBenefit,
                      highlight: true,
                    },
                  ]
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
        <h2 className="text-xl font-semibold mb-4">Year-by-Year Breakdown</h2>
        <BreakdownTable data={breakdownWithInflation} />
      </div>

      {/* About Goal Planning */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">
          What is Goal-Based Investing?
        </h2>
        <p className="text-muted-foreground">
          Goal-based investing is a strategy where you start with a specific
          financial target—like buying a home, funding education, or building a
          retirement corpus—and work backwards to determine how much you need to
          invest regularly to reach that goal. This calculator helps you find
          the required monthly SIP amount based on your target, timeline, and
          expected returns.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Benefits of Goal Planning
        </h3>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Clear Direction:</strong> Knowing
          exactly how much to invest each month removes guesswork and helps you
          stay committed to your financial plan. You can track progress against
          a concrete target instead of investing blindly.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Realistic Expectations:</strong>{" "}
          By calculating the required SIP upfront, you can assess whether your
          goal is achievable within your budget. If the required SIP is too
          high, you can either extend the timeline, adjust the target, or
          explore higher-return investments.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Step-Up Strategy:</strong> If
          starting with a higher SIP is difficult, enable the step-up feature.
          This lets you begin with a lower amount and gradually increase it as
          your income grows, making large goals more accessible.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Tips for Goal Planning</h3>
        <p className="text-muted-foreground">
          Be realistic about expected returns—equity funds historically deliver
          10-12% CAGR over long periods, while debt funds typically deliver 6-8%.
          Account for inflation when setting targets for goals more than 5 years
          away. Review and adjust your SIP annually based on actual returns and
          changing circumstances. For critical goals like retirement or
          children&apos;s education, consider maintaining a safety margin by
          investing slightly more than calculated.
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Goal Planner Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator reverses the standard SIP formula to find the
            monthly investment needed to reach your target. Enter your goal
            amount, expected annual return rate, and time horizon to see the
            required monthly SIP.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Formula used:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            P = M / [((1 + r)^n - 1) / r × (1 + r)]
          </code>
          <p className="mt-4 text-sm">
            Where P = Required monthly SIP, M = Target amount, r = Effective
            monthly rate, n = Number of months
          </p>
        </CardContent>
      </Card>
    </>
  );
}
