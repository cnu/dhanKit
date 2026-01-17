"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Share2, Check, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  InputSlider,
  ResultCard,
  DonutChart,
} from "@/components/calculator";
import { formatIndianCurrency } from "@/lib/format";
import {
  calculateRetirement,
  calculateFIRE,
  calculateRetirementYearlyBreakdown,
} from "@/lib/calculators/retirement";

// Default values
const DEFAULTS = {
  currentAge: 30,
  retirementAge: 50,
  lifeExpectancy: 85,
  monthlyExpenses: 50000,
  inflationRate: 6,
  withdrawalRate: 4,
  expectedReturn: 12,
  currentCorpus: 0,
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

export function RetirementCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [currentAge, setCurrentAge] = useState(() =>
    parseNumber(searchParams.get("a"), DEFAULTS.currentAge, 18, 70)
  );
  const [retirementAge, setRetirementAge] = useState(() =>
    parseNumber(searchParams.get("ra"), DEFAULTS.retirementAge, 30, 80)
  );
  const [lifeExpectancy, setLifeExpectancy] = useState(() =>
    parseNumber(searchParams.get("le"), DEFAULTS.lifeExpectancy, 60, 100)
  );
  const [monthlyExpenses, setMonthlyExpenses] = useState(() =>
    parseNumber(searchParams.get("e"), DEFAULTS.monthlyExpenses, 10000, 1000000)
  );
  const [inflationRate, setInflationRate] = useState(() =>
    parseNumber(searchParams.get("inf"), DEFAULTS.inflationRate, 1, 15)
  );
  const [withdrawalRate, setWithdrawalRate] = useState(() =>
    parseNumber(searchParams.get("wr"), DEFAULTS.withdrawalRate, 2, 8)
  );
  const [expectedReturn, setExpectedReturn] = useState(() =>
    parseNumber(searchParams.get("r"), DEFAULTS.expectedReturn, 4, 20)
  );
  const [currentCorpus, setCurrentCorpus] = useState(() =>
    parseNumber(searchParams.get("c"), DEFAULTS.currentCorpus, 0, 100000000)
  );
  const [showFireNumbers, setShowFireNumbers] = useState(() =>
    parseBoolean(searchParams.get("fire"))
  );
  const [hasExistingCorpus, setHasExistingCorpus] = useState(() =>
    parseBoolean(searchParams.get("hc"))
  );

  // Ensure retirement age is always greater than current age
  useEffect(() => {
    if (retirementAge <= currentAge) {
      setRetirementAge(currentAge + 1);
    }
    if (lifeExpectancy <= retirementAge) {
      setLifeExpectancy(retirementAge + 10);
    }
  }, [currentAge, retirementAge, lifeExpectancy]);

  // Build shareable URL
  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("a", currentAge.toString());
    params.set("ra", retirementAge.toString());
    params.set("le", lifeExpectancy.toString());
    params.set("e", monthlyExpenses.toString());
    params.set("inf", inflationRate.toString());
    params.set("wr", withdrawalRate.toString());
    params.set("r", expectedReturn.toString());
    if (hasExistingCorpus && currentCorpus > 0) {
      params.set("hc", "1");
      params.set("c", currentCorpus.toString());
    }
    if (showFireNumbers) {
      params.set("fire", "1");
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    inflationRate,
    withdrawalRate,
    expectedReturn,
    currentCorpus,
    hasExistingCorpus,
    showFireNumbers,
  ]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (currentAge !== DEFAULTS.currentAge) {
      params.set("a", currentAge.toString());
    }
    if (retirementAge !== DEFAULTS.retirementAge) {
      params.set("ra", retirementAge.toString());
    }
    if (lifeExpectancy !== DEFAULTS.lifeExpectancy) {
      params.set("le", lifeExpectancy.toString());
    }
    if (monthlyExpenses !== DEFAULTS.monthlyExpenses) {
      params.set("e", monthlyExpenses.toString());
    }
    if (inflationRate !== DEFAULTS.inflationRate) {
      params.set("inf", inflationRate.toString());
    }
    if (withdrawalRate !== DEFAULTS.withdrawalRate) {
      params.set("wr", withdrawalRate.toString());
    }
    if (expectedReturn !== DEFAULTS.expectedReturn) {
      params.set("r", expectedReturn.toString());
    }
    if (hasExistingCorpus && currentCorpus > 0) {
      params.set("hc", "1");
      if (currentCorpus !== DEFAULTS.currentCorpus) {
        params.set("c", currentCorpus.toString());
      }
    }
    if (showFireNumbers) {
      params.set("fire", "1");
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    inflationRate,
    withdrawalRate,
    expectedReturn,
    currentCorpus,
    hasExistingCorpus,
    showFireNumbers,
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
    const effectiveCorpus = hasExistingCorpus ? currentCorpus : 0;
    return calculateRetirement(
      currentAge,
      retirementAge,
      lifeExpectancy,
      monthlyExpenses,
      inflationRate,
      withdrawalRate,
      expectedReturn,
      effectiveCorpus
    );
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    inflationRate,
    withdrawalRate,
    expectedReturn,
    currentCorpus,
    hasExistingCorpus,
  ]);

  const fireResult = useMemo(() => {
    if (!showFireNumbers) return null;
    const effectiveCorpus = hasExistingCorpus ? currentCorpus : 0;
    return calculateFIRE(
      currentAge,
      retirementAge,
      lifeExpectancy,
      monthlyExpenses,
      inflationRate,
      withdrawalRate,
      expectedReturn,
      effectiveCorpus
    );
  }, [
    showFireNumbers,
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    inflationRate,
    withdrawalRate,
    expectedReturn,
    currentCorpus,
    hasExistingCorpus,
  ]);

  const breakdown = useMemo(() => {
    const effectiveCorpus = hasExistingCorpus ? currentCorpus : 0;
    return calculateRetirementYearlyBreakdown(
      currentAge,
      retirementAge,
      lifeExpectancy,
      monthlyExpenses,
      inflationRate,
      withdrawalRate,
      expectedReturn,
      effectiveCorpus,
      true // show retirement phase
    );
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    inflationRate,
    withdrawalRate,
    expectedReturn,
    currentCorpus,
    hasExistingCorpus,
  ]);

  // State for showing all breakdown rows
  const [showAll, setShowAll] = useState(false);
  const initialRows = 5;
  const displayBreakdown = showAll ? breakdown : breakdown.slice(0, initialRows);
  const hasMore = breakdown.length > initialRows;

  // Calculate real return rate
  const realReturnRate = useMemo(() => {
    const realRate =
      ((1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
    return Math.round(realRate * 100) / 100;
  }, [expectedReturn, inflationRate]);

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
              label="Current Age"
              value={currentAge}
              onChange={setCurrentAge}
              min={18}
              max={70}
              step={1}
              suffix=" years"
              formatValue={false}
            />
            <InputSlider
              label="Retirement Age"
              value={retirementAge}
              onChange={setRetirementAge}
              min={Math.max(30, currentAge + 1)}
              max={80}
              step={1}
              suffix=" years"
              formatValue={false}
            />
            <InputSlider
              label="Life Expectancy"
              value={lifeExpectancy}
              onChange={setLifeExpectancy}
              min={Math.max(60, retirementAge + 5)}
              max={100}
              step={1}
              suffix=" years"
              formatValue={false}
            />
            <InputSlider
              label="Monthly Expenses (Today)"
              value={monthlyExpenses}
              onChange={setMonthlyExpenses}
              min={10000}
              max={1000000}
              step={5000}
              prefix="₹"
            />

            {/* Investment Parameters */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-4">Investment Parameters</h4>
              <div className="space-y-6">
                <InputSlider
                  label="Expected Return (p.a.)"
                  value={expectedReturn}
                  onChange={setExpectedReturn}
                  min={4}
                  max={20}
                  step={0.5}
                  suffix="%"
                  formatValue={false}
                />
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
                <InputSlider
                  label="Safe Withdrawal Rate"
                  value={withdrawalRate}
                  onChange={setWithdrawalRate}
                  min={2}
                  max={8}
                  step={0.5}
                  suffix="%"
                  formatValue={false}
                />
              </div>
            </div>

            {/* Existing Corpus Toggle */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="corpus-toggle"
                    className="text-sm font-medium"
                  >
                    Have Existing Savings?
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Include current retirement savings
                  </p>
                </div>
                <Switch
                  id="corpus-toggle"
                  checked={hasExistingCorpus}
                  onCheckedChange={setHasExistingCorpus}
                />
              </div>

              {hasExistingCorpus && (
                <div className="mt-4">
                  <InputSlider
                    label="Current Corpus"
                    value={currentCorpus}
                    onChange={setCurrentCorpus}
                    min={0}
                    max={100000000}
                    step={100000}
                    prefix="₹"
                  />
                </div>
              )}
            </div>

            {/* FIRE Numbers Toggle */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="fire-toggle" className="text-sm font-medium">
                    Show FIRE Numbers
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Financial Independence, Retire Early
                  </p>
                </div>
                <Switch
                  id="fire-toggle"
                  checked={showFireNumbers}
                  onCheckedChange={setShowFireNumbers}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-6">
          <ResultCard
            title="Required Retirement Corpus"
            mainValue={result.requiredCorpus}
            secondaryValue={{
              label: "Monthly expenses at retirement",
              value: result.monthlyExpensesAtRetirement,
            }}
            tertiaryValue={{
              label: "Real return rate",
              value: `${realReturnRate > 0 ? "+" : ""}${realReturnRate}%`,
              variant: realReturnRate < 0 ? "destructive" : "default",
            }}
            items={[
              {
                label: "Years to Retirement",
                value: `${result.yearsToRetirement} years`,
                isText: true,
              },
              {
                label: "Retirement Duration",
                value: `${result.retirementDuration} years`,
                isText: true,
              },
              {
                label: "Required Monthly SIP",
                value: result.requiredMonthlySIP,
                highlight: true,
              },
              { label: "Total SIP Investment", value: result.totalSIPInvested },
              { label: "Expected Returns", value: result.sipReturns, highlight: true },
              ...(hasExistingCorpus && currentCorpus > 0
                ? [
                    {
                      label: "Current Corpus (Future Value)",
                      value: result.currentCorpusFutureValue,
                    },
                  ]
                : []),
            ]}
          />

          {/* Corpus Sufficiency Warning/Success */}
          <Card
            className={
              result.corpusSufficient
                ? "bg-green-500/10 border-green-500/30"
                : "bg-destructive/10 border-destructive/30"
            }
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {result.corpusSufficient ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                )}
                <div>
                  <p
                    className={`font-medium ${
                      result.corpusSufficient
                        ? "text-green-700 dark:text-green-400"
                        : "text-destructive"
                    }`}
                  >
                    {result.corpusSufficient
                      ? "Corpus is sufficient!"
                      : "Corpus may not be sufficient"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.corpusLastsYears === null
                      ? "Your corpus can last indefinitely with the given withdrawal rate."
                      : `Based on the ${withdrawalRate}% withdrawal rate with inflation-adjusted expenses, your corpus would last approximately ${result.corpusLastsYears} years${
                          result.corpusLastsYears < result.retirementDuration
                            ? ` (${result.retirementDuration - result.corpusLastsYears} years short).`
                            : "."
                        }`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FIRE Numbers Card */}
          {showFireNumbers && fireResult && (
            <Card className="bg-amber-500/10 border-amber-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">FIRE Numbers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Regular FIRE</span>
                  <span className="font-mono font-medium">
                    {formatIndianCurrency(fireResult.fireNumber)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Lean FIRE (70%)</span>
                  <span className="font-mono text-sm">
                    {formatIndianCurrency(fireResult.leanFireNumber)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Fat FIRE (150%)</span>
                  <span className="font-mono text-sm">
                    {formatIndianCurrency(fireResult.fatFireNumber)}
                  </span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Coast FIRE Number</span>
                    <span className="font-mono text-sm">
                      {formatIndianCurrency(fireResult.coastFireNumber)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Amount needed today that grows to your FIRE number without
                    additional contributions
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <DonutChart
                invested={result.totalSIPInvested + (hasExistingCorpus ? currentCorpus : 0)}
                returns={result.sipReturns + (hasExistingCorpus ? result.currentCorpusFutureValue - currentCorpus : 0)}
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
        <h2 className="text-xl font-semibold mb-4">Year-by-Year Projection</h2>
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Year</th>
                  <th className="px-4 py-3 text-left font-medium">Age</th>
                  <th className="px-4 py-3 text-left font-medium">Phase</th>
                  <th className="px-4 py-3 text-right font-medium">SIP/Withdrawal</th>
                  <th className="px-4 py-3 text-right font-medium">Interest</th>
                  <th className="px-4 py-3 text-right font-medium">Corpus</th>
                </tr>
              </thead>
              <tbody>
                {displayBreakdown.map((row) => (
                  <tr key={row.year} className="border-t border-border">
                    <td className="px-4 py-3">{row.year}</td>
                    <td className="px-4 py-3">{row.age}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.phase === "accumulation"
                            ? "bg-primary/10 text-primary"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {row.phase === "accumulation" ? "Saving" : "Retirement"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {row.phase === "accumulation"
                        ? formatIndianCurrency(row.sipContribution ?? 0)
                        : `-${formatIndianCurrency(row.withdrawal ?? 0)}`}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-primary">
                      {formatIndianCurrency(row.interestEarned)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {formatIndianCurrency(row.totalValue)}
                    </td>
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
              {showAll ? "Show Less" : `Show All ${breakdown.length} Years`}
            </Button>
          )}
        </div>
      </div>

      {/* About Retirement Planning */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">
          What is Retirement Planning?
        </h2>
        <p className="text-muted-foreground">
          Retirement planning involves calculating the corpus (total savings)
          you&apos;ll need to maintain your lifestyle after you stop working.
          The goal is to build enough wealth during your working years so that
          withdrawals during retirement can sustain your expenses for the rest
          of your life.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">The 4% Rule</h3>
        <p className="text-muted-foreground">
          The 4% rule is a popular guideline suggesting you can withdraw 4% of
          your retirement corpus annually, adjusted for inflation, without
          running out of money for at least 30 years. This translates to needing
          25x your annual expenses as your retirement corpus (1 / 0.04 = 25).
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Understanding FIRE (Financial Independence, Retire Early)
        </h3>
        <p className="text-muted-foreground">
          FIRE is a movement focused on extreme savings and investment to retire
          much earlier than traditional retirement age. Different FIRE variants
          exist based on lifestyle preferences:
        </p>
        <ul className="text-muted-foreground list-disc list-inside mt-2 space-y-1">
          <li>
            <strong className="text-foreground">Lean FIRE:</strong> Minimal
            expenses, frugal lifestyle (typically 70% of normal expenses)
          </li>
          <li>
            <strong className="text-foreground">Regular FIRE:</strong> Current
            lifestyle maintained (100% of expenses)
          </li>
          <li>
            <strong className="text-foreground">Fat FIRE:</strong> Comfortable
            lifestyle with luxuries (typically 150% of expenses)
          </li>
          <li>
            <strong className="text-foreground">Coast FIRE:</strong> Having
            enough saved that compound growth alone reaches your FIRE number by
            traditional retirement age
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Why Inflation Matters
        </h3>
        <p className="text-muted-foreground">
          Inflation erodes purchasing power over time. If you spend ₹50,000/month
          today, at 6% inflation you&apos;ll need approximately ₹1.6 lakh/month
          in 20 years to maintain the same lifestyle. This calculator accounts
          for inflation in both the accumulation phase (growing your corpus) and
          withdrawal phase (increasing expenses).
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How This Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator estimates your retirement corpus requirement based on
            your current expenses, expected inflation, and chosen withdrawal rate.
            It then calculates the monthly SIP needed to reach that corpus.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Required Corpus Formula:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            Corpus = (Annual Expenses at Retirement) / Withdrawal Rate
          </code>
          <p className="mt-4">
            <strong className="text-foreground">Expenses at Retirement:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            Future Expenses = Current Expenses × (1 + Inflation)^Years
          </code>
          <p className="mt-4 text-sm">
            The required monthly SIP is calculated using the reverse SIP formula
            to fill the gap between your current savings (if any) and the required
            corpus.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
