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
  calculateRD,
  calculateRDMonthlyBreakdown,
  getCompoundingLabel,
  type CompoundingFrequency,
} from "@/lib/calculators/rd";

// Default values
const DEFAULTS = {
  monthlyDeposit: 5000,
  interestRate: 7.0,
  timePeriod: 12, // in months
  compounding: "quarterly" as CompoundingFrequency,
  inflationRate: 6,
};

const COMPOUNDING_OPTIONS: CompoundingFrequency[] = ["monthly", "quarterly"];

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
  if (value === "monthly" || value === "quarterly") {
    return value;
  }
  return DEFAULTS.compounding;
}

export function RDCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [monthlyDeposit, setMonthlyDeposit] = useState(() =>
    parseNumber(searchParams.get("d"), DEFAULTS.monthlyDeposit, 500, 1000000)
  );
  const [interestRate, setInterestRate] = useState(() =>
    parseNumber(searchParams.get("r"), DEFAULTS.interestRate, 1, 15)
  );
  const [timePeriod, setTimePeriod] = useState(() =>
    parseNumber(searchParams.get("m"), DEFAULTS.timePeriod, 6, 120)
  );
  const [compounding, setCompounding] = useState<CompoundingFrequency>(() =>
    parseCompounding(searchParams.get("c"))
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
    params.set("d", monthlyDeposit.toString());
    params.set("r", interestRate.toString());
    params.set("m", timePeriod.toString());
    params.set("c", compounding);
    if (inflationEnabled) {
      params.set("inf", "1");
      params.set("infr", inflationRate.toString());
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [monthlyDeposit, interestRate, timePeriod, compounding, inflationEnabled, inflationRate]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (monthlyDeposit !== DEFAULTS.monthlyDeposit) {
      params.set("d", monthlyDeposit.toString());
    }
    if (interestRate !== DEFAULTS.interestRate) {
      params.set("r", interestRate.toString());
    }
    if (timePeriod !== DEFAULTS.timePeriod) {
      params.set("m", timePeriod.toString());
    }
    if (compounding !== DEFAULTS.compounding) {
      params.set("c", compounding);
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
  }, [monthlyDeposit, interestRate, timePeriod, compounding, inflationEnabled, inflationRate, router]);

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
    return calculateRD(monthlyDeposit, interestRate, timePeriod, compounding);
  }, [monthlyDeposit, interestRate, timePeriod, compounding]);

  const breakdown = useMemo(() => {
    return calculateRDMonthlyBreakdown(monthlyDeposit, interestRate, timePeriod, compounding);
  }, [monthlyDeposit, interestRate, timePeriod, compounding]);

  // Calculate inflation-adjusted maturity value
  const inflationAdjustedValue = useMemo(() => {
    if (!inflationEnabled) return null;
    const years = timePeriod / 12;
    return Math.round(
      result.maturityAmount / Math.pow(1 + inflationRate / 100, years)
    );
  }, [result.maturityAmount, inflationEnabled, inflationRate, timePeriod]);

  // Calculate real interest rate (inflation-adjusted)
  const realInterestRate = useMemo(() => {
    if (!inflationEnabled) return null;
    const realRate = ((1 + result.effectiveRate / 100) / (1 + inflationRate / 100) - 1) * 100;
    return Math.round(realRate * 100) / 100;
  }, [inflationEnabled, result.effectiveRate, inflationRate]);

  // Transform breakdown data for BreakdownTable component
  const breakdownForTable = useMemo(() => {
    if (!inflationEnabled) {
      return breakdown.map((row) => ({
        month: row.month,
        invested: row.totalDeposited,
        interest: row.totalInterest,
        totalValue: row.totalValue,
      }));
    }
    // Add inflation-adjusted values
    return breakdown.map((row) => {
      const years = row.month / 12;
      return {
        month: row.month,
        invested: row.totalDeposited,
        interest: row.totalInterest,
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
            <CardTitle>RD Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InputSlider
              label="Monthly Deposit"
              value={monthlyDeposit}
              onChange={setMonthlyDeposit}
              min={500}
              max={1000000}
              step={500}
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
              min={6}
              max={120}
              step={1}
              suffix=" months"
              formatValue={false}
            />

            {/* Compounding Frequency */}
            <div className="pt-4 border-t">
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
                Most Indian banks compound RD interest quarterly
              </p>
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
                : {
                    label: "Effective annual rate",
                    value: `${result.effectiveRate}%`,
                    isText: true,
                  }
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
              { label: "Total Deposited", value: result.totalDeposited },
              { label: "Total Interest", value: result.totalInterest, highlight: true },
            ]}
          />

          <Card>
            <CardContent className="pt-6">
              <DonutChart
                invested={result.totalDeposited}
                returns={result.totalInterest}
                investedLabel="Deposited"
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

      {/* About RD */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">What is a Recurring Deposit?</h2>
        <p className="text-muted-foreground">
          A Recurring Deposit (RD) is a type of term deposit offered by banks where you
          deposit a fixed amount every month for a predetermined period. It&apos;s an
          excellent savings tool for those who want to build a corpus through regular
          small deposits rather than a lump sum investment.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Key Features of RD
        </h3>
        <ul className="text-muted-foreground space-y-2">
          <li>
            <strong className="text-foreground">Fixed Monthly Deposits:</strong> You
            commit to depositing a fixed amount every month for the tenure.
          </li>
          <li>
            <strong className="text-foreground">Guaranteed Returns:</strong> Interest
            rates are fixed at the time of opening, providing predictable returns.
          </li>
          <li>
            <strong className="text-foreground">Flexible Tenure:</strong> Typically
            ranges from 6 months to 10 years.
          </li>
          <li>
            <strong className="text-foreground">Low Minimum Amount:</strong> Start with
            as low as ₹500/month at most banks.
          </li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">
          RD vs FD vs SIP
        </h3>
        <p className="text-muted-foreground">
          <strong className="text-foreground">RD vs FD:</strong> Both offer guaranteed
          returns, but RD allows monthly deposits while FD requires a lump sum. RD is
          ideal for salaried individuals building savings gradually.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">RD vs SIP:</strong> SIPs invest in mutual
          funds with market-linked returns (higher risk, potentially higher returns).
          RD offers fixed, guaranteed returns but typically lower than equity SIPs over
          the long term.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Tax on RD Interest</h3>
        <p className="text-muted-foreground">
          Interest earned on RD is fully taxable as &quot;Income from Other
          Sources&quot; at your applicable tax slab rate. TDS is deducted at 10% if
          total interest from RD and FD combined exceeds ₹40,000 in a financial year
          (₹50,000 for senior citizens).
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How RD Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator estimates your RD maturity amount based on your monthly
            deposit, interest rate, tenure, and compounding frequency. Most Indian banks
            compound RD interest quarterly.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Calculation Method:</strong>
          </p>
          <p className="mt-2">
            Since deposits are made monthly but interest is compounded quarterly, the
            calculator processes each month iteratively, adding deposits and compounding
            interest at quarter ends for accurate results.
          </p>
          <p className="mt-4 text-sm">
            The effective annual rate shown accounts for compounding frequency. A 7%
            nominal rate compounded quarterly yields approximately 7.19% effective annual
            return.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
