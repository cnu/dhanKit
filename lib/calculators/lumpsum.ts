export interface LumpsumResult {
  finalAmount: number;
  totalInvested: number;
  totalReturns: number;
}

export interface LumpsumYearlyBreakdown {
  year: number;
  invested: number;
  interest: number;
  totalValue: number;
  inflationAdjustedValue?: number;
}

/**
 * Calculate Lumpsum investment returns.
 *
 * Formula: A = P × (1 + r)^t
 * Where:
 *   A = Final amount
 *   P = Initial investment (principal)
 *   r = Annual return rate (as decimal)
 *   t = Time in years
 *
 * This is standard compound interest for a one-time investment.
 */
export function calculateLumpsum(
  investment: number,
  annualReturn: number,
  years: number
): LumpsumResult {
  const rate = annualReturn / 100;
  const finalAmount = investment * Math.pow(1 + rate, years);

  return {
    finalAmount: Math.round(finalAmount),
    totalInvested: investment,
    totalReturns: Math.round(finalAmount - investment),
  };
}

/**
 * Generate year-by-year breakdown of lumpsum investment growth.
 */
export function calculateLumpsumYearlyBreakdown(
  investment: number,
  annualReturn: number,
  years: number
): LumpsumYearlyBreakdown[] {
  const breakdown: LumpsumYearlyBreakdown[] = [];
  const rate = annualReturn / 100;

  for (let year = 1; year <= years; year++) {
    const totalValue = investment * Math.pow(1 + rate, year);
    const interest = totalValue - investment;

    breakdown.push({
      year,
      invested: investment,
      interest: Math.round(interest),
      totalValue: Math.round(totalValue),
    });
  }

  return breakdown;
}
