"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import { InputSlider, ResultCard } from "@/components/calculator";
import {
  calculateMFReturns,
  toDecimalYears,
} from "@/lib/calculators/mf-returns";

// Default values
const DEFAULTS = {
  purchaseNAV: 100,
  currentNAV: 150,
  holdingYears: 3,
  holdingMonths: 0,
  units: 1000,
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

export function MFReturnsCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [purchaseNAV, setPurchaseNAV] = useState(() =>
    parseNumber(searchParams.get("pn"), DEFAULTS.purchaseNAV, 0.01, 100000)
  );
  const [currentNAV, setCurrentNAV] = useState(() =>
    parseNumber(searchParams.get("cn"), DEFAULTS.currentNAV, 0.01, 100000)
  );
  const [holdingYears, setHoldingYears] = useState(() =>
    parseNumber(searchParams.get("y"), DEFAULTS.holdingYears, 0, 50)
  );
  const [holdingMonths, setHoldingMonths] = useState(() =>
    parseNumber(searchParams.get("m"), DEFAULTS.holdingMonths, 0, 11)
  );
  const [showUnits, setShowUnits] = useState(() =>
    parseBoolean(searchParams.get("su"))
  );
  const [units, setUnits] = useState(() =>
    parseNumber(searchParams.get("u"), DEFAULTS.units, 0.001, 10000000)
  );

  // Build shareable URL
  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("pn", purchaseNAV.toString());
    params.set("cn", currentNAV.toString());
    params.set("y", holdingYears.toString());
    if (holdingMonths > 0) {
      params.set("m", holdingMonths.toString());
    }
    if (showUnits) {
      params.set("su", "1");
      params.set("u", units.toString());
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [purchaseNAV, currentNAV, holdingYears, holdingMonths, showUnits, units]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (purchaseNAV !== DEFAULTS.purchaseNAV) {
      params.set("pn", purchaseNAV.toString());
    }
    if (currentNAV !== DEFAULTS.currentNAV) {
      params.set("cn", currentNAV.toString());
    }
    if (holdingYears !== DEFAULTS.holdingYears) {
      params.set("y", holdingYears.toString());
    }
    if (holdingMonths !== DEFAULTS.holdingMonths) {
      params.set("m", holdingMonths.toString());
    }
    if (showUnits) {
      params.set("su", "1");
      if (units !== DEFAULTS.units) {
        params.set("u", units.toString());
      }
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [purchaseNAV, currentNAV, holdingYears, holdingMonths, showUnits, units, router]);

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

  const holdingPeriod = useMemo(() => {
    return toDecimalYears(holdingYears, holdingMonths);
  }, [holdingYears, holdingMonths]);

  const result = useMemo(() => {
    return calculateMFReturns(
      purchaseNAV,
      currentNAV,
      holdingPeriod,
      showUnits ? units : undefined
    );
  }, [purchaseNAV, currentNAV, holdingPeriod, showUnits, units]);

  // Determine if returns are positive or negative
  const isPositiveReturn = result.absoluteReturns >= 0;

  // Format holding period for display
  const holdingPeriodText = useMemo(() => {
    const parts = [];
    if (holdingYears > 0) {
      parts.push(`${holdingYears} year${holdingYears > 1 ? "s" : ""}`);
    }
    if (holdingMonths > 0) {
      parts.push(`${holdingMonths} month${holdingMonths > 1 ? "s" : ""}`);
    }
    return parts.length > 0 ? parts.join(" ") : "0 months";
  }, [holdingYears, holdingMonths]);

  // Build items array based on whether units are shown
  const resultItems = useMemo((): ResultItem[] => {
    const items: ResultItem[] = [
      { label: "Purchase NAV", value: `₹${purchaseNAV.toFixed(4)}`, isText: true },
      { label: "Current NAV", value: `₹${currentNAV.toFixed(4)}`, isText: true },
      { label: "Holding Period", value: holdingPeriodText, isText: true },
    ];

    if (showUnits) {
      items.push(
        { label: "Units Held", value: units.toLocaleString("en-IN", { maximumFractionDigits: 3 }), isText: true },
        { label: "Invested Amount", value: result.investedAmount },
        { label: "Current Value", value: result.currentValue },
        { label: "Gain/Loss", value: result.totalGain, highlight: isPositiveReturn }
      );
    }

    return items;
  }, [purchaseNAV, currentNAV, holdingPeriodText, showUnits, units, result, isPositiveReturn]);

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
              label="Purchase NAV"
              value={purchaseNAV}
              onChange={setPurchaseNAV}
              min={0.0001}
              max={50000}
              step={0.0001}
              prefix="₹"
              formatValue={false}
            />
            <InputSlider
              label="Current NAV"
              value={currentNAV}
              onChange={setCurrentNAV}
              min={0.0001}
              max={50000}
              step={0.0001}
              prefix="₹"
              formatValue={false}
            />
            <InputSlider
              label="Holding Period (Years)"
              value={holdingYears}
              onChange={setHoldingYears}
              min={0}
              max={50}
              step={1}
              suffix=" years"
              formatValue={false}
            />
            <InputSlider
              label="Additional Months"
              value={holdingMonths}
              onChange={setHoldingMonths}
              min={0}
              max={11}
              step={1}
              suffix=" months"
              formatValue={false}
            />

            {/* Units Toggle */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="units-toggle" className="text-sm font-medium">
                    Show Units & Values
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Calculate total gain in rupees
                  </p>
                </div>
                <Switch
                  id="units-toggle"
                  checked={showUnits}
                  onCheckedChange={setShowUnits}
                />
              </div>

              {showUnits && (
                <div className="mt-4">
                  <InputSlider
                    label="Number of Units"
                    value={units}
                    onChange={setUnits}
                    min={0.001}
                    max={10000000}
                    step={0.001}
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
            title="CAGR (Annualized Return)"
            mainValue={result.cagr}
            mainValueIsPercentage
            mainValueVariant={isPositiveReturn ? "default" : "destructive"}
            secondaryValue={{
              label: "Absolute Return",
              value: `${isPositiveReturn ? "+" : ""}${result.absoluteReturns}%`,
              isText: true,
            }}
            tertiaryValue={
              holdingPeriod < 1
                ? {
                    label: "Note",
                    value: "CAGR extrapolated for < 1 year",
                    variant: "default",
                  }
                : undefined
            }
            items={resultItems}
          />

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

      {/* About MF Returns */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">
          Understanding Mutual Fund Returns
        </h2>
        <p className="text-muted-foreground">
          When evaluating mutual fund performance, two key metrics help you
          understand your actual returns: <strong className="text-foreground">Absolute Returns</strong> and{" "}
          <strong className="text-foreground">CAGR (Compound Annual Growth Rate)</strong>.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Absolute Returns</h3>
        <p className="text-muted-foreground">
          Absolute return is the simple percentage gain or loss on your
          investment from start to finish. If you bought units at NAV ₹100 and
          the current NAV is ₹150, your absolute return is 50%. This metric is
          useful for understanding total gains but doesn&apos;t account for time.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">CAGR (Annualized Returns)</h3>
        <p className="text-muted-foreground">
          CAGR normalizes returns to an annual basis, making it easier to compare
          different investments held for different periods. A 50% absolute return
          over 3 years translates to ~14.5% CAGR—the equivalent annual growth
          rate needed to achieve the same result.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">When to use which:</strong> Use
          absolute returns when you want to know your total gain. Use CAGR when
          comparing fund performance across different time periods or when
          benchmarking against index returns (which are typically quoted as CAGR).
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">What is NAV?</h3>
        <p className="text-muted-foreground">
          NAV (Net Asset Value) is the per-unit price of a mutual fund. It&apos;s
          calculated by dividing the total value of the fund&apos;s assets by the
          number of outstanding units. When you invest in a mutual fund, you buy
          units at the current NAV, and your returns depend on how the NAV
          changes over time.
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How This Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            Enter the NAV at which you purchased your mutual fund units and the
            current NAV to see your returns. The holding period helps calculate
            the annualized return (CAGR).
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Formulas used:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            Absolute Return = ((Current NAV - Purchase NAV) / Purchase NAV) × 100
          </code>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            CAGR = ((Current NAV / Purchase NAV)^(1/years) - 1) × 100
          </code>
          <p className="mt-4 text-sm">
            Enable &quot;Show Units & Values&quot; to see your total invested amount,
            current portfolio value, and gain/loss in rupees.
          </p>
        </CardContent>
      </Card>
    </>
  );
}

// Type for result items to avoid TypeScript errors
interface ResultItem {
  label: string;
  value: number | string;
  highlight?: boolean;
  isPercentage?: boolean;
  isText?: boolean;
}
