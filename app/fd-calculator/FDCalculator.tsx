"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Share2, Check } from "lucide-react";
import {
  InputSlider,
  ResultCard,
  DonutChart,
  BreakdownTable,
} from "@/components/calculator";
import {
  calculateFD,
  calculateFDSimple,
  calculateFDMonthlyBreakdown,
  calculateFDSimpleMonthlyBreakdown,
  getCompoundingLabel,
  type CompoundingFrequency,
} from "@/lib/calculators/fd";

// Default values
const DEFAULTS = {
  principal: 100000,
  interestRate: 7.0,
  timePeriod: 12, // in months
  compounding: "quarterly" as CompoundingFrequency,
  useSimpleInterest: false,
  inflationRate: 6,
};

const COMPOUNDING_OPTIONS: CompoundingFrequency[] = [
  "monthly",
  "quarterly",
  "half-yearly",
  "yearly",
];

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

function parseCompounding(value: string | null): CompoundingFrequency {
  if (
    value === "monthly" ||
    value === "quarterly" ||
    value === "half-yearly" ||
    value === "yearly"
  ) {
    return value;
  }
  return DEFAULTS.compounding;
}

export function FDCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [principal, setPrincipal] = useState(() =>
    parseNumber(searchParams.get("p"), DEFAULTS.principal, 1000, 100000000)
  );
  const [interestRate, setInterestRate] = useState(() =>
    parseNumber(searchParams.get("r"), DEFAULTS.interestRate, 1, 15)
  );
  const [timePeriod, setTimePeriod] = useState(() =>
    parseNumber(searchParams.get("m"), DEFAULTS.timePeriod, 1, 120)
  );
  const [compounding, setCompounding] = useState<CompoundingFrequency>(() =>
    parseCompounding(searchParams.get("c"))
  );
  const [useSimpleInterest, setUseSimpleInterest] = useState(() =>
    parseBoolean(searchParams.get("si"))
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
    params.set("p", principal.toString());
    params.set("r", interestRate.toString());
    params.set("m", timePeriod.toString());
    if (!useSimpleInterest) {
      params.set("c", compounding);
    }
    if (useSimpleInterest) {
      params.set("si", "1");
    }
    if (inflationEnabled) {
      params.set("inf", "1");
      params.set("infr", inflationRate.toString());
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [principal, interestRate, timePeriod, compounding, useSimpleInterest, inflationEnabled, inflationRate]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (principal !== DEFAULTS.principal) {
      params.set("p", principal.toString());
    }
    if (interestRate !== DEFAULTS.interestRate) {
      params.set("r", interestRate.toString());
    }
    if (timePeriod !== DEFAULTS.timePeriod) {
      params.set("m", timePeriod.toString());
    }
    if (!useSimpleInterest && compounding !== DEFAULTS.compounding) {
      params.set("c", compounding);
    }
    if (useSimpleInterest) {
      params.set("si", "1");
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
  }, [principal, interestRate, timePeriod, compounding, useSimpleInterest, inflationEnabled, inflationRate, router]);

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
    return useSimpleInterest
      ? calculateFDSimple(principal, interestRate, timePeriod)
      : calculateFD(principal, interestRate, timePeriod, compounding);
  }, [principal, interestRate, timePeriod, compounding, useSimpleInterest]);

  const breakdown = useMemo(() => {
    return useSimpleInterest
      ? calculateFDSimpleMonthlyBreakdown(principal, interestRate, timePeriod)
      : calculateFDMonthlyBreakdown(principal, interestRate, timePeriod, compounding);
  }, [principal, interestRate, timePeriod, compounding, useSimpleInterest]);

  // Calculate inflation-adjusted maturity value
  const inflationAdjustedValue = useMemo(() => {
    if (!inflationEnabled) return null;
    const years = timePeriod / 12;
    return Math.round(
      result.maturityAmount / Math.pow(1 + inflationRate / 100, years)
    );
  }, [result.maturityAmount, inflationEnabled, inflationRate, timePeriod]);

  // Calculate real interest rate (inflation-adjusted)
  // Formula: Real Rate = ((1 + nominal) / (1 + inflation) - 1) × 100
  const realInterestRate = useMemo(() => {
    if (!inflationEnabled) return null;
    const nominalRate = useSimpleInterest ? interestRate : result.effectiveRate;
    const realRate = ((1 + nominalRate / 100) / (1 + inflationRate / 100) - 1) * 100;
    return Math.round(realRate * 100) / 100; // Round to 2 decimal places
  }, [inflationEnabled, useSimpleInterest, interestRate, result.effectiveRate, inflationRate]);

  // Transform breakdown data for BreakdownTable component
  const breakdownForTable = useMemo(() => {
    if (!inflationEnabled) {
      return breakdown.map((row) => ({
        month: row.month,
        invested: row.principal,
        interest: row.interest,
        totalValue: row.totalValue,
      }));
    }
    // Add inflation-adjusted values
    return breakdown.map((row) => {
      const years = row.month / 12;
      return {
        month: row.month,
        invested: row.principal,
        interest: row.interest,
        totalValue: row.totalValue,
        inflationAdjustedValue: Math.round(
          row.totalValue / Math.pow(1 + inflationRate / 100, years)
        ),
      };
    });
  }, [breakdown, inflationEnabled, inflationRate]);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>FD Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InputSlider
              label="Principal Amount"
              value={principal}
              onChange={setPrincipal}
              min={1000}
              max={100000000}
              step={1000}
              prefix="₹"
            />
            <InputSlider
              label="Interest Rate (p.a.)"
              value={interestRate}
              onChange={setInterestRate}
              min={1}
              max={15}
              step={0.01}
              suffix="%"
              formatValue={false}
            />
            <InputSlider
              label="Time Period"
              value={timePeriod}
              onChange={setTimePeriod}
              min={1}
              max={120}
              step={1}
              suffix=" months"
              formatValue={false}
            />

            {/* Interest Type Toggle */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="simple-interest-toggle" className="text-sm font-medium">
                    Simple Interest
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Use simple interest instead of compound
                  </p>
                </div>
                <Switch
                  id="simple-interest-toggle"
                  checked={useSimpleInterest}
                  onCheckedChange={setUseSimpleInterest}
                />
              </div>

              {!useSimpleInterest && (
                <div className="mt-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Compounding Frequency
                  </Label>
                  <Select
                    value={compounding}
                    onValueChange={(value) =>
                      setCompounding(value as CompoundingFrequency)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPOUNDING_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {getCompoundingLabel(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-2">
                    Most Indian banks compound quarterly
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
            title="Maturity Amount"
            mainValue={result.maturityAmount}
            secondaryValue={
              inflationEnabled && inflationAdjustedValue
                ? { label: "Inflation adjusted", value: inflationAdjustedValue }
                : !useSimpleInterest
                  ? {
                      label: "Effective annual rate",
                      value: `${result.effectiveRate}%`,
                      isText: true,
                    }
                  : undefined
            }
            tertiaryValue={
              inflationEnabled && realInterestRate !== null
                ? {
                    label: "Real interest rate",
                    value: `${realInterestRate > 0 ? "+" : ""}${realInterestRate}%`,
                    variant: realInterestRate < 0 ? "destructive" : "default",
                  }
                : undefined
            }
            items={[
              { label: "Principal", value: result.totalInvested },
              { label: "Total Interest", value: result.totalInterest, highlight: true },
            ]}
          />

          <Card>
            <CardContent className="pt-6">
              <DonutChart
                invested={result.totalInvested}
                returns={result.totalInterest}
                investedLabel="Principal"
                returnsLabel="Interest"
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

      {/* Quarterly Breakdown */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quarterly Breakdown</h2>
        <BreakdownTable data={breakdownForTable} periodLabel="Month" />
      </div>

      {/* About FD */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">What is a Fixed Deposit?</h2>
        <p className="text-muted-foreground">
          A Fixed Deposit (FD) is a financial instrument provided by banks and NBFCs
          where you deposit a lump sum amount for a fixed tenure at a predetermined
          interest rate. FDs are one of the safest investment options in India, backed
          by deposit insurance up to ₹5 lakhs per depositor per bank.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Compound vs Simple Interest
        </h3>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Compound Interest:</strong> Interest is
          calculated on both the principal and accumulated interest. Most bank FDs use
          quarterly compounding, meaning interest is added to your principal four times
          a year. This results in higher returns compared to simple interest.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Simple Interest:</strong> Interest is
          calculated only on the original principal amount. Some short-term deposits or
          corporate FDs may use simple interest. The formula is straightforward: I = P
          × r × t.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Understanding Effective Annual Rate
        </h3>
        <p className="text-muted-foreground">
          When comparing FDs with different compounding frequencies, the effective
          annual rate (EAR) gives you the true annual return. An FD with 7% annual rate
          compounded quarterly actually yields approximately 7.19% when annualized. This
          helps you make apple-to-apple comparisons between different FD offerings.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Tax on FD Interest</h3>
        <p className="text-muted-foreground">
          Interest earned on FDs is fully taxable as &quot;Income from Other
          Sources&quot; at your applicable tax slab rate. Banks deduct TDS at 10% if
          your total interest income from that bank exceeds ₹40,000 in a financial year
          (₹50,000 for senior citizens). You can submit Form 15G/15H to avoid TDS if
          your total income is below the taxable limit.
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How FD Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator estimates your FD maturity amount using either compound or
            simple interest formulas. Enter your deposit amount, interest rate, tenure,
            and compounding frequency to see your projected returns.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Compound Interest Formula:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            A = P × (1 + r/n)^(n×t)
          </code>
          <p className="mt-4 text-sm">
            Where A = Maturity amount, P = Principal, r = Annual interest rate (as
            decimal), n = Compounding frequency per year, t = Time in years (months ÷ 12)
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Simple Interest Formula:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            A = P × (1 + r × t)
          </code>
        </CardContent>
      </Card>
    </>
  );
}
