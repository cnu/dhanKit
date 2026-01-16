"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
import {
  InputSlider,
  ResultCard,
  DonutChart,
} from "@/components/calculator";
import {
  calculateEMI,
  calculateEMIYearlyBreakdown,
  type EMIYearlyBreakdown,
} from "@/lib/calculators/emi";
import { formatIndianCurrency } from "@/lib/format";

// Default values
const DEFAULTS = {
  loanAmount: 5000000, // 50 lakhs
  interestRate: 8.5,
  tenureYears: 20,
};

function parseNumber(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const num = parseFloat(value);
  if (isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}

export function EMICalculator() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);

  // Initialize state from URL params or defaults
  const [loanAmount, setLoanAmount] = useState(() =>
    parseNumber(searchParams.get("p"), DEFAULTS.loanAmount, 100000, 100000000)
  );
  const [interestRate, setInterestRate] = useState(() =>
    parseNumber(searchParams.get("r"), DEFAULTS.interestRate, 1, 20)
  );
  const [tenureYears, setTenureYears] = useState(() =>
    parseNumber(searchParams.get("y"), DEFAULTS.tenureYears, 1, 30)
  );

  const tenureMonths = tenureYears * 12;

  // Build shareable URL
  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("p", loanAmount.toString());
    params.set("r", interestRate.toString());
    params.set("y", tenureYears.toString());
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [loanAmount, interestRate, tenureYears]);

  // Update URL when values change
  useEffect(() => {
    const params = new URLSearchParams();

    // Only add non-default values to keep URL clean
    if (loanAmount !== DEFAULTS.loanAmount) {
      params.set("p", loanAmount.toString());
    }
    if (interestRate !== DEFAULTS.interestRate) {
      params.set("r", interestRate.toString());
    }
    if (tenureYears !== DEFAULTS.tenureYears) {
      params.set("y", tenureYears.toString());
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;

    router.replace(newUrl, { scroll: false });
  }, [loanAmount, interestRate, tenureYears, router]);

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
    return calculateEMI(loanAmount, interestRate, tenureMonths);
  }, [loanAmount, interestRate, tenureMonths]);

  const yearlyBreakdown = useMemo(() => {
    return calculateEMIYearlyBreakdown(loanAmount, interestRate, tenureMonths);
  }, [loanAmount, interestRate, tenureMonths]);

  // Show first 5 years by default
  const displayedBreakdown = showAllRows
    ? yearlyBreakdown
    : yearlyBreakdown.slice(0, 5);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <InputSlider
              label="Loan Amount"
              value={loanAmount}
              onChange={setLoanAmount}
              min={100000}
              max={100000000}
              step={100000}
              prefix="₹"
            />
            <InputSlider
              label="Interest Rate (p.a.)"
              value={interestRate}
              onChange={setInterestRate}
              min={1}
              max={20}
              step={0.01}
              suffix="%"
              formatValue={false}
            />
            <InputSlider
              label="Loan Tenure"
              value={tenureYears}
              onChange={setTenureYears}
              min={1}
              max={30}
              step={1}
              suffix=" years"
              formatValue={false}
            />
          </CardContent>
        </Card>

        {/* Result Section */}
        <div className="space-y-6">
          <ResultCard
            title="Monthly EMI"
            mainValue={result.monthlyEMI}
            items={[
              { label: "Principal Amount", value: result.principalAmount },
              { label: "Total Interest", value: result.totalInterest, highlight: true },
              { label: "Total Amount", value: result.totalAmount },
            ]}
          />
          <Card>
            <CardContent className="pt-6">
              <DonutChart
                invested={result.principalAmount}
                returns={result.totalInterest}
                investedLabel="Principal"
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
        <h2 className="text-xl font-semibold mb-4">Amortization Schedule</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Year</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Principal</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Interest</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Total Paid</th>
                    <th className="text-right py-3 px-2 font-medium text-muted-foreground">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedBreakdown.map((row: EMIYearlyBreakdown) => (
                    <tr key={row.year} className="border-b last:border-0">
                      <td className="py-3 px-2 font-medium">{row.year}</td>
                      <td className="text-right py-3 px-2 font-mono">
                        {formatIndianCurrency(row.principalPaid)}
                      </td>
                      <td className="text-right py-3 px-2 font-mono text-destructive">
                        {formatIndianCurrency(row.interestPaid)}
                      </td>
                      <td className="text-right py-3 px-2 font-mono">
                        {formatIndianCurrency(row.totalPaid)}
                      </td>
                      <td className="text-right py-3 px-2 font-mono">
                        {formatIndianCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {yearlyBreakdown.length > 5 && (
              <Button
                variant="ghost"
                className="w-full mt-4"
                onClick={() => setShowAllRows(!showAllRows)}
              >
                {showAllRows ? "Show Less" : `Show All ${yearlyBreakdown.length} Years`}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* About EMI */}
      <div className="mt-8 prose prose-neutral max-w-none">
        <h2 className="text-xl font-semibold mb-4">What is EMI?</h2>
        <p className="text-muted-foreground">
          EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower to a
          lender on a specified date each month. EMIs are used to pay off both principal and
          interest over a set period, making loan repayments predictable and easier to budget.
          Whether you&apos;re taking a home loan, car loan, or personal loan, understanding your
          EMI helps you plan your finances better.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">How EMI is Calculated</h3>
        <p className="text-muted-foreground">
          The EMI is calculated using the reducing balance method, where interest is charged
          only on the outstanding loan balance. In the early months, a larger portion of your
          EMI goes toward interest. As you continue paying, the principal component increases
          while the interest component decreases. This is why prepaying your loan early saves
          more interest than prepaying later.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Tips for Loan Borrowers</h3>
        <p className="text-muted-foreground">
          <strong className="text-foreground">Choose the right tenure:</strong> A longer tenure
          means lower EMI but higher total interest. A shorter tenure means higher EMI but you
          save significantly on interest. Find the balance that suits your monthly budget while
          minimizing total cost.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Consider prepayment:</strong> Many banks allow
          partial prepayment without penalties. Use bonuses or windfalls to reduce your principal,
          which directly reduces your interest burden. Even small prepayments can save lakhs over
          the loan tenure.
        </p>
        <p className="text-muted-foreground mt-3">
          <strong className="text-foreground">Compare rates:</strong> Even a 0.5% difference in
          interest rate can translate to lakhs of rupees over a long tenure like a home loan.
          Always compare rates from multiple lenders before finalizing.
        </p>
      </div>

      {/* How it works */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How EMI Calculator Works</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral max-w-none text-muted-foreground">
          <p>
            This calculator uses the standard reducing balance EMI formula used by all Indian
            banks and financial institutions. Enter your loan amount, annual interest rate, and
            tenure to see your monthly EMI and complete amortization schedule.
          </p>
          <p className="mt-4">
            <strong className="text-foreground">Formula used:</strong>
          </p>
          <code className="block bg-muted p-4 rounded-lg mt-2 text-sm font-mono">
            EMI = P × [r(1+r)^n] / [(1+r)^n - 1]
          </code>
          <p className="mt-4 text-sm">
            Where P = Principal, r = Monthly interest rate (annual rate / 12 / 100),
            n = Number of monthly installments
          </p>
        </CardContent>
      </Card>
    </>
  );
}
