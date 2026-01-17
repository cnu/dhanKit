"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Check, AlertCircle } from "lucide-react";
import { InputSlider, ResultCard } from "@/components/calculator";
import {
  calculateGratuityWithCap,
  GRATUITY_CAP,
} from "@/lib/calculators/gratuity";
import { formatIndianCurrency } from "@/lib/format";

// Default values
const DEFAULTS = {
  lastDrawnSalary: 50000,
  yearsOfService: 10,
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

export function GratuityCalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // Initialize state from URL params or defaults
  const [lastDrawnSalary, setLastDrawnSalary] = useState(() =>
    parseNumber(searchParams.get("s"), DEFAULTS.lastDrawnSalary, 1000, 10000000)
  );
  const [yearsOfService, setYearsOfService] = useState(() =>
    parseNumber(searchParams.get("y"), DEFAULTS.yearsOfService, 1, 50)
  );

  // Build shareable URL
  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("s", lastDrawnSalary.toString());
    params.set("y", yearsOfService.toString());
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [lastDrawnSalary, yearsOfService]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (lastDrawnSalary !== DEFAULTS.lastDrawnSalary) {
      params.set("s", lastDrawnSalary.toString());
    }
    if (yearsOfService !== DEFAULTS.yearsOfService) {
      params.set("y", yearsOfService.toString());
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [lastDrawnSalary, yearsOfService, router]);

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
    return calculateGratuityWithCap(lastDrawnSalary, yearsOfService);
  }, [lastDrawnSalary, yearsOfService]);

  // Calculate months equivalent (gratuity / monthly salary)
  const monthsEquivalent = useMemo(() => {
    return Math.round((result.gratuityAmount / lastDrawnSalary) * 10) / 10;
  }, [result.gratuityAmount, lastDrawnSalary]);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InputSlider
              label="Last Drawn Salary (Basic + DA)"
              value={lastDrawnSalary}
              onChange={setLastDrawnSalary}
              min={1000}
              max={10000000}
              step={1000}
              prefix="₹"
            />
            <InputSlider
              label="Years of Service"
              value={yearsOfService}
              onChange={setYearsOfService}
              min={1}
              max={50}
              step={1}
              suffix=" years"
              formatValue={false}
            />
          </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-6">
          <ResultCard
            title="Gratuity Amount"
            mainValue={result.gratuityAmount}
            secondaryValue={{
              label: "Equivalent to",
              value: `${monthsEquivalent} months salary`,
              isText: true,
            }}
            tertiaryValue={
              result.isCapped
                ? {
                    label: "Statutory cap applied",
                    value: formatIndianCurrency(GRATUITY_CAP),
                    variant: "destructive",
                  }
                : undefined
            }
            items={[
              { label: "Last Drawn Salary", value: lastDrawnSalary },
              { label: "Years of Service", value: `${yearsOfService} years`, isText: true },
              ...(result.isCapped
                ? [
                    {
                      label: "Uncapped Amount",
                      value: result.uncappedAmount,
                    },
                  ]
                : []),
            ]}
          />

          {/* Eligibility Warning */}
          {!result.isEligible && (
            <Card className="border-amber-500/50 bg-amber-500/10">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-600 dark:text-amber-400">
                      Not Eligible Yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gratuity eligibility requires a minimum of 5 years of
                      continuous service. You need {5 - yearsOfService} more
                      year{5 - yearsOfService > 1 ? "s" : ""} to become eligible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

      {/* About Gratuity */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">What is Gratuity?</h2>
        <p className="text-muted-foreground">
          Gratuity is a lump-sum payment made by employers to employees as a
          token of appreciation for their long service. It is governed by the
          Payment of Gratuity Act, 1972, which applies to establishments with 10
          or more employees. Gratuity is one of the key retirement benefits in
          India, alongside EPF and pension.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Eligibility Criteria</h3>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Minimum Service:</strong> An
          employee must complete at least 5 years of continuous service with the
          same employer to be eligible for gratuity. However, this rule is
          relaxed in cases of death or disability—employees receive gratuity
          regardless of their tenure.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Covered Establishments:</strong>{" "}
          The Gratuity Act applies to factories, mines, oilfields, plantations,
          ports, railway companies, shops, and other establishments with 10 or
          more employees on any day in the preceding 12 months.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">
          Maximum Gratuity Limit
        </h3>
        <p className="text-muted-foreground">
          As per the 2019 amendment, the maximum gratuity payable under the Act
          is <strong className="text-foreground">₹20,00,000</strong>. This cap
          applies to employees covered under the Payment of Gratuity Act.
          However, many private companies, especially in IT and other sectors,
          voluntarily pay higher gratuity amounts as part of their HR policies.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Tax Treatment</h3>
        <p className="text-muted-foreground">
          For government employees, the entire gratuity received is exempt from
          income tax. For private sector employees covered under the Gratuity
          Act, the exemption is the least of: (a) actual gratuity received, (b)
          ₹20 lakhs, or (c) 15 days&apos; salary for each completed year of
          service. Any amount above this is taxable as per your income tax slab.
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Gratuity Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator uses the formula prescribed under the Payment of
            Gratuity Act, 1972. Enter your last drawn salary (Basic + Dearness
            Allowance) and years of service to calculate your gratuity
            entitlement.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Formula used:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            Gratuity = (15 × Last Drawn Salary × Years of Service) / 26
          </code>
          <p className="mt-4 text-sm">
            Where 15 represents 15 days of salary for each year of service, and
            26 is the number of working days in a month as per the Act.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
