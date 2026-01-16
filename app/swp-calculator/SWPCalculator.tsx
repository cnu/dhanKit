"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Share2, Check, AlertTriangle } from "lucide-react";
import { InputSlider, ResultCard, DonutChart } from "@/components/calculator";
import {
  calculateSWP,
  calculateSWPYearlyBreakdown,
  calculateMaxWithdrawal,
  calculateInflationAdjustedSWP,
  calculateInflationAdjustedSWPYearlyBreakdown,
  calculateMaxInflationAdjustedWithdrawal,
  SWPYearlyBreakdown,
  InflationAdjustedSWPResult,
} from "@/lib/calculators/swp";
import { formatIndianCurrency } from "@/lib/format";

// Default values
const DEFAULTS = {
  initialCorpus: 5000000,
  monthlyWithdrawal: 30000,
  expectedReturn: 8,
  timePeriod: 20,
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

// Custom breakdown table for SWP
function SWPBreakdownTable({
  data,
  initialRows = 5,
  showInflation = false,
}: {
  data: SWPYearlyBreakdown[];
  initialRows?: number;
  showInflation?: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? data : data.slice(0, initialRows);
  const hasMore = data.length > initialRows;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Year</th>
              <th className="px-4 py-3 text-right font-medium">
                Opening Balance
              </th>
              {showInflation && (
                <th className="px-4 py-3 text-right font-medium">
                  Monthly
                </th>
              )}
              <th className="px-4 py-3 text-right font-medium">Withdrawn</th>
              <th className="px-4 py-3 text-right font-medium">
                Interest Earned
              </th>
              <th className="px-4 py-3 text-right font-medium">
                Closing Balance
              </th>
              {showInflation && (
                <th className="px-4 py-3 text-right font-medium">
                  Today&apos;s Value
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row) => (
              <tr key={row.year} className="border-t border-border">
                <td className="px-4 py-3">{row.year}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatIndianCurrency(row.openingBalance)}
                </td>
                {showInflation && (
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                    {formatIndianCurrency(row.monthlyWithdrawal || 0)}
                  </td>
                )}
                <td className="px-4 py-3 text-right font-mono text-destructive">
                  {formatIndianCurrency(row.totalWithdrawn)}
                </td>
                <td className="px-4 py-3 text-right font-mono text-primary">
                  {formatIndianCurrency(row.interestEarned)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium">
                  {formatIndianCurrency(row.closingBalance)}
                </td>
                {showInflation && (
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                    {formatIndianCurrency(row.inflationAdjustedBalance || 0)}
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
          {showAll ? "Show Less" : `Show All ${data.length} Years`}
        </Button>
      )}
    </div>
  );
}

export function SWPCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [initialCorpus, setInitialCorpus] = useState(() =>
    parseNumber(searchParams.get("c"), DEFAULTS.initialCorpus, 100000, 1000000000)
  );
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState(() =>
    parseNumber(
      searchParams.get("w"),
      DEFAULTS.monthlyWithdrawal,
      1000,
      10000000
    )
  );
  const [expectedReturn, setExpectedReturn] = useState(() =>
    parseNumber(searchParams.get("r"), DEFAULTS.expectedReturn, 1, 20)
  );
  const [timePeriod, setTimePeriod] = useState(() =>
    parseNumber(searchParams.get("y"), DEFAULTS.timePeriod, 1, 60)
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
    params.set("c", initialCorpus.toString());
    params.set("w", monthlyWithdrawal.toString());
    params.set("r", expectedReturn.toString());
    params.set("y", timePeriod.toString());
    if (inflationEnabled) {
      params.set("inf", "1");
      params.set("infr", inflationRate.toString());
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [initialCorpus, monthlyWithdrawal, expectedReturn, timePeriod, inflationEnabled, inflationRate]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (initialCorpus !== DEFAULTS.initialCorpus) {
      params.set("c", initialCorpus.toString());
    }
    if (monthlyWithdrawal !== DEFAULTS.monthlyWithdrawal) {
      params.set("w", monthlyWithdrawal.toString());
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
  }, [initialCorpus, monthlyWithdrawal, expectedReturn, timePeriod, inflationEnabled, inflationRate, router]);

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
    if (inflationEnabled) {
      return calculateInflationAdjustedSWP(
        initialCorpus,
        monthlyWithdrawal,
        expectedReturn,
        timePeriod,
        inflationRate
      );
    }
    return calculateSWP(
      initialCorpus,
      monthlyWithdrawal,
      expectedReturn,
      timePeriod
    );
  }, [initialCorpus, monthlyWithdrawal, expectedReturn, timePeriod, inflationEnabled, inflationRate]);

  const breakdown = useMemo(() => {
    if (inflationEnabled) {
      return calculateInflationAdjustedSWPYearlyBreakdown(
        initialCorpus,
        monthlyWithdrawal,
        expectedReturn,
        timePeriod,
        inflationRate
      );
    }
    return calculateSWPYearlyBreakdown(
      initialCorpus,
      monthlyWithdrawal,
      expectedReturn,
      timePeriod
    );
  }, [initialCorpus, monthlyWithdrawal, expectedReturn, timePeriod, inflationEnabled, inflationRate]);

  const maxWithdrawal = useMemo(() => {
    if (inflationEnabled) {
      return calculateMaxInflationAdjustedWithdrawal(
        initialCorpus,
        expectedReturn,
        timePeriod,
        inflationRate
      );
    }
    return calculateMaxWithdrawal(initialCorpus, expectedReturn, timePeriod);
  }, [initialCorpus, expectedReturn, timePeriod, inflationEnabled, inflationRate]);

  // Format duration for display
  const formatDuration = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${remainingMonths} months`;
    if (remainingMonths === 0)
      return `${years} ${years === 1 ? "year" : "years"}`;
    return `${years} ${years === 1 ? "year" : "years"} ${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`;
  };

  // Calculate what percentage of withdrawals came from returns vs principal
  const returnsPortion = Math.min(result.totalInterestEarned, result.totalWithdrawn);
  const principalPortion = result.totalWithdrawn - returnsPortion;

  // Type guard to check if result is inflation-adjusted
  const isInflationResult = (r: typeof result): r is InflationAdjustedSWPResult => {
    return "inflationAdjustedFinalCorpus" in r;
  };

  // Extract inflation-specific values if available
  const inflationResult = isInflationResult(result) ? result : null;

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InputSlider
              label="Initial Corpus"
              value={initialCorpus}
              onChange={setInitialCorpus}
              min={100000}
              max={1000000000}
              step={100000}
              prefix="₹"
            />
            <InputSlider
              label="Monthly Withdrawal"
              value={monthlyWithdrawal}
              onChange={setMonthlyWithdrawal}
              min={1000}
              max={10000000}
              step={1000}
              prefix="₹"
            />
            <InputSlider
              label="Expected Return (p.a.)"
              value={expectedReturn}
              onChange={setExpectedReturn}
              min={1}
              max={20}
              step={0.5}
              suffix="%"
              formatValue={false}
            />
            <InputSlider
              label="Time Period"
              value={timePeriod}
              onChange={setTimePeriod}
              min={1}
              max={60}
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
                    Increase withdrawals yearly to maintain purchasing power
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

            {/* Max withdrawal hint */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Max sustainable withdrawal:
                </span>{" "}
                {formatIndianCurrency(maxWithdrawal)}/month
                {inflationEnabled && " (Year 1)"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This is the maximum you can withdraw monthly while ensuring your
                corpus lasts {timePeriod} years at {expectedReturn}% returns
                {inflationEnabled && ` with ${inflationRate}% annual increase`}.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-6">
          {/* Warning if corpus depletes */}
          {!result.corpusLasted && (
            <Card className="border-destructive bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">
                      Corpus Depletes Early
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your corpus will last only{" "}
                      <span className="font-medium text-foreground">
                        {formatDuration(result.monthsLasted)}
                      </span>{" "}
                      instead of {timePeriod} years. Consider reducing your
                      monthly withdrawal to {formatIndianCurrency(maxWithdrawal)}
                      /month.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <ResultCard
            title={result.corpusLasted ? "Final Corpus" : "Corpus Duration"}
            mainValue={result.corpusLasted ? result.finalCorpus : 0}
            items={[
              { label: "Total Withdrawn", value: result.totalWithdrawn },
              {
                label: "Interest Earned",
                value: result.totalInterestEarned,
                highlight: true,
              },
            ]}
            secondaryValue={
              inflationResult && result.corpusLasted
                ? {
                    label: "Inflation adjusted",
                    value: inflationResult.inflationAdjustedFinalCorpus,
                  }
                : result.corpusLasted
                  ? {
                      label: "Corpus lasted full period",
                      value: `${timePeriod * 12} months`,
                      isText: true,
                    }
                  : {
                      label: "Corpus lasted",
                      value: formatDuration(result.monthsLasted),
                      isText: true,
                    }
            }
            tertiaryValue={
              inflationResult
                ? {
                    label: "Real return rate",
                    value: `${inflationResult.realReturnRate > 0 ? "+" : ""}${inflationResult.realReturnRate}%`,
                    variant: inflationResult.realReturnRate < 0 ? "destructive" : "default",
                  }
                : undefined
            }
          />

          {/* Withdrawal Range Card (for inflation-adjusted) */}
          {inflationResult && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-3">
                  Monthly Withdrawal Range
                </p>
                <div className="flex justify-between items-baseline">
                  <div>
                    <p className="text-xs text-muted-foreground">Year 1</p>
                    <p className="font-mono text-lg">
                      {formatIndianCurrency(inflationResult.firstYearWithdrawal)}
                    </p>
                  </div>
                  <div className="text-muted-foreground">→</div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      Year {Math.ceil(result.monthsLasted / 12)}
                    </p>
                    <p className="font-mono text-lg text-primary">
                      {formatIndianCurrency(inflationResult.finalYearWithdrawal)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Withdrawals increase by {inflationRate}% annually to maintain
                  purchasing power
                </p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="pt-6">
              <DonutChart
                invested={principalPortion}
                returns={returnsPortion}
                investedLabel="From Principal"
                returnsLabel="From Returns"
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
        <SWPBreakdownTable data={breakdown} showInflation={inflationEnabled} />
      </div>

      {/* About SWP */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">
          What is Systematic Withdrawal Plan (SWP)?
        </h2>
        <p className="text-muted-foreground">
          A Systematic Withdrawal Plan (SWP) allows you to withdraw a fixed
          amount regularly from your mutual fund investments. It&apos;s the
          opposite of a SIP—instead of investing periodically, you withdraw
          periodically. SWP is particularly useful for retirees who want a
          regular income stream while keeping their corpus invested.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          How Does SWP Work?
        </h3>
        <p className="text-muted-foreground">
          When you set up an SWP, the fund house redeems units from your
          investment each month to provide you with the withdrawal amount. The
          remaining units continue to stay invested and earn returns. This means
          your corpus can potentially last longer than if you withdrew the
          entire amount at once.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Key Benefits of SWP
        </h3>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Regular Income:</strong> Get a
          predictable monthly income, ideal for meeting regular expenses in
          retirement.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Tax Efficiency:</strong> Only the
          gains portion of each withdrawal is taxable, not the entire withdrawal
          amount. This can be more tax-efficient than interest from FDs.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Continued Growth:</strong> Your
          remaining investment continues to earn returns, potentially extending
          how long your corpus lasts.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Flexibility:</strong> You can
          modify or stop your SWP at any time, unlike fixed-term instruments.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          SWP vs Fixed Deposit Interest
        </h3>
        <p className="text-muted-foreground">
          While FD interest provides guaranteed returns, SWP from equity or
          hybrid funds can potentially offer higher returns over the long term.
          However, SWP comes with market risk—your corpus value can fluctuate.
          Many retirees use a combination of both for income stability.
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How SWP Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator simulates your SWP month by month. Each month, your
            corpus earns returns at the expected rate, and then your withdrawal
            is deducted. The calculation shows how long your corpus will last
            and what you&apos;ll accumulate over time.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Monthly calculation:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            New Balance = (Previous Balance × (1 + Monthly Rate)) - Withdrawal
          </code>
          <p className="mt-4 text-sm">
            Where Monthly Rate = Annual Rate / 12. The process repeats each
            month until either the time period ends or the corpus is exhausted.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
