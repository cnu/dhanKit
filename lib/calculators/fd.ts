export interface FDResult {
  maturityAmount: number;
  totalInvested: number;
  totalInterest: number;
  effectiveRate: number;
}

export interface FDMonthlyBreakdown {
  month: number;
  principal: number;
  interest: number;
  totalValue: number;
}

export type CompoundingFrequency = "monthly" | "quarterly" | "half-yearly" | "yearly";

/**
 * Get the number of times interest is compounded per year
 */
function getCompoundingPeriods(frequency: CompoundingFrequency): number {
  switch (frequency) {
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "half-yearly":
      return 2;
    case "yearly":
      return 1;
  }
}

/**
 * Calculate Fixed Deposit maturity with compound interest.
 *
 * Formula: A = P(1 + r/n)^(nt)
 * Where:
 *   A = Maturity amount
 *   P = Principal (initial deposit)
 *   r = Annual interest rate (as decimal)
 *   n = Number of times interest is compounded per year
 *   t = Time in years (months / 12)
 *
 * Effective Annual Rate: (1 + r/n)^n - 1
 * This shows the true annual return accounting for compounding.
 */
export function calculateFD(
  principal: number,
  annualRate: number,
  months: number,
  compounding: CompoundingFrequency = "quarterly"
): FDResult {
  const rate = annualRate / 100;
  const n = getCompoundingPeriods(compounding);
  const years = months / 12;

  // Compound interest formula: A = P(1 + r/n)^(nt)
  const maturityAmount = principal * Math.pow(1 + rate / n, n * years);
  const totalInterest = maturityAmount - principal;

  // Effective annual rate: (1 + r/n)^n - 1
  const effectiveRate = (Math.pow(1 + rate / n, n) - 1) * 100;

  return {
    maturityAmount: Math.round(maturityAmount),
    totalInvested: principal,
    totalInterest: Math.round(totalInterest),
    effectiveRate: Math.round(effectiveRate * 100) / 100, // Round to 2 decimal places
  };
}

/**
 * Calculate Fixed Deposit maturity with simple interest.
 *
 * Formula: A = P(1 + rt)
 * Where:
 *   A = Maturity amount
 *   P = Principal
 *   r = Annual interest rate (as decimal)
 *   t = Time in years (months / 12)
 */
export function calculateFDSimple(
  principal: number,
  annualRate: number,
  months: number
): FDResult {
  const rate = annualRate / 100;
  const years = months / 12;

  // Simple interest formula: A = P(1 + rt)
  const maturityAmount = principal * (1 + rate * years);
  const totalInterest = maturityAmount - principal;

  return {
    maturityAmount: Math.round(maturityAmount),
    totalInvested: principal,
    totalInterest: Math.round(totalInterest),
    effectiveRate: annualRate, // For simple interest, effective rate equals nominal rate
  };
}

/**
 * Generate month-by-month breakdown of FD growth (showing every 3 months for readability).
 */
export function calculateFDMonthlyBreakdown(
  principal: number,
  annualRate: number,
  totalMonths: number,
  compounding: CompoundingFrequency = "quarterly"
): FDMonthlyBreakdown[] {
  const breakdown: FDMonthlyBreakdown[] = [];
  const rate = annualRate / 100;
  const n = getCompoundingPeriods(compounding);

  // Show quarterly intervals for readability, but always include the final month
  const interval = 3;
  for (let month = interval; month <= totalMonths; month += interval) {
    const years = month / 12;
    const totalValue = principal * Math.pow(1 + rate / n, n * years);
    const interest = totalValue - principal;

    breakdown.push({
      month,
      principal,
      interest: Math.round(interest),
      totalValue: Math.round(totalValue),
    });
  }

  // Add final month if not already included
  if (totalMonths % interval !== 0) {
    const years = totalMonths / 12;
    const totalValue = principal * Math.pow(1 + rate / n, n * years);
    const interest = totalValue - principal;

    breakdown.push({
      month: totalMonths,
      principal,
      interest: Math.round(interest),
      totalValue: Math.round(totalValue),
    });
  }

  return breakdown;
}

/**
 * Generate month-by-month breakdown for simple interest FD.
 */
export function calculateFDSimpleMonthlyBreakdown(
  principal: number,
  annualRate: number,
  totalMonths: number
): FDMonthlyBreakdown[] {
  const breakdown: FDMonthlyBreakdown[] = [];
  const rate = annualRate / 100;

  // Show quarterly intervals for readability
  const interval = 3;
  for (let month = interval; month <= totalMonths; month += interval) {
    const years = month / 12;
    const interest = principal * rate * years;
    const totalValue = principal + interest;

    breakdown.push({
      month,
      principal,
      interest: Math.round(interest),
      totalValue: Math.round(totalValue),
    });
  }

  // Add final month if not already included
  if (totalMonths % interval !== 0) {
    const years = totalMonths / 12;
    const interest = principal * rate * years;
    const totalValue = principal + interest;

    breakdown.push({
      month: totalMonths,
      principal,
      interest: Math.round(interest),
      totalValue: Math.round(totalValue),
    });
  }

  return breakdown;
}

/**
 * Get compounding frequency label for display
 */
export function getCompoundingLabel(frequency: CompoundingFrequency): string {
  switch (frequency) {
    case "monthly":
      return "Monthly";
    case "quarterly":
      return "Quarterly";
    case "half-yearly":
      return "Half-Yearly";
    case "yearly":
      return "Yearly";
  }
}
