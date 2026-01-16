export interface PPFResult {
  maturityAmount: number;
  totalInvested: number;
  totalInterest: number;
}

export interface PPFYearlyBreakdown {
  year: number;
  invested: number;    // Cumulative invested
  interest: number;    // Cumulative interest
  balance: number;     // Current balance
}

/**
 * Calculate PPF (Public Provident Fund) maturity value.
 *
 * PPF Rules:
 * - Minimum investment: ₹500/year
 * - Maximum investment: ₹1,50,000/year
 * - Lock-in period: 15 years (extendable in 5-year blocks)
 * - Interest compounded annually at end of financial year
 * - Current rate: 7.1% p.a. (government rate, changes quarterly)
 *
 * Formula for each year:
 *   Balance = (Previous Balance + Yearly Deposit) × (1 + r)
 * Where r = annual interest rate / 100
 *
 * This assumes deposit at start of year, interest applied at end.
 */
export function calculatePPF(
  yearlyInvestment: number,
  years: number,
  annualRate: number
): PPFResult {
  const rate = annualRate / 100;
  let balance = 0;

  for (let year = 1; year <= years; year++) {
    // Add yearly deposit, then apply interest
    balance = (balance + yearlyInvestment) * (1 + rate);
  }

  const totalInvested = yearlyInvestment * years;
  const totalInterest = balance - totalInvested;

  return {
    maturityAmount: Math.round(balance),
    totalInvested: Math.round(totalInvested),
    totalInterest: Math.round(totalInterest),
  };
}

/**
 * Generate year-by-year breakdown for PPF investment.
 * Shows cumulative invested, interest, and balance at end of each year.
 */
export function calculatePPFYearlyBreakdown(
  yearlyInvestment: number,
  years: number,
  annualRate: number
): PPFYearlyBreakdown[] {
  const breakdown: PPFYearlyBreakdown[] = [];
  const rate = annualRate / 100;
  let balance = 0;

  for (let year = 1; year <= years; year++) {
    // Add yearly deposit, then apply interest
    balance = (balance + yearlyInvestment) * (1 + rate);

    const invested = yearlyInvestment * year;
    const interest = balance - invested;

    breakdown.push({
      year,
      invested: Math.round(invested),
      interest: Math.round(interest),
      balance: Math.round(balance),
    });
  }

  return breakdown;
}
