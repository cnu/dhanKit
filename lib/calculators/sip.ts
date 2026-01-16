export interface SIPResult {
  maturityAmount: number;
  totalInvested: number;
  totalReturns: number;
}

export interface StepUpSIPResult extends SIPResult {
  withoutStepUp: SIPResult;
}

export interface SIPYearlyBreakdown {
  year: number;
  invested: number;
  interest: number;
  totalValue: number;
  inflationAdjustedValue?: number;
  monthlySIP?: number;
}


/**
 * Calculate SIP (Systematic Investment Plan) returns.
 *
 * Formula: M = P × ((1 + r)^n – 1) / r × (1 + r)
 * Where:
 *   M = Maturity amount
 *   P = Monthly investment
 *   r = Effective monthly rate = (1 + annual_rate)^(1/12) - 1
 *   n = Number of months (years × 12)
 *
 * Uses annuity due formula with effective monthly rate,
 * which matches sipcalculator.in and other Indian SIP calculators.
 */
export function calculateSIP(
  monthlyInvestment: number,
  annualReturn: number,
  years: number
): SIPResult {
  // Convert annual rate to effective monthly rate
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const months = years * 12;

  // Annuity due formula (payment at start of period)
  const maturityAmount =
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  const totalInvested = monthlyInvestment * months;
  const totalReturns = maturityAmount - totalInvested;

  return {
    maturityAmount: Math.round(maturityAmount),
    totalInvested,
    totalReturns: Math.round(totalReturns),
  };
}

/**
 * Generate year-by-year breakdown of SIP growth.
 */
export function calculateSIPYearlyBreakdown(
  monthlyInvestment: number,
  annualReturn: number,
  years: number
): SIPYearlyBreakdown[] {
  const breakdown: SIPYearlyBreakdown[] = [];
  // Convert annual rate to effective monthly rate
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;

  for (let year = 1; year <= years; year++) {
    const months = year * 12;
    const totalValue =
      monthlyInvestment *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);
    const invested = monthlyInvestment * months;
    const interest = totalValue - invested;

    breakdown.push({
      year,
      invested,
      interest: Math.round(interest),
      totalValue: Math.round(totalValue),
    });
  }

  return breakdown;
}

/**
 * Calculate Step-Up SIP returns.
 *
 * Step-Up SIP increases the monthly investment by a fixed percentage annually.
 * For example, with 10% step-up:
 *   Year 1: ₹5,000/month
 *   Year 2: ₹5,500/month
 *   Year 3: ₹6,050/month
 *
 * The calculation works by computing each year's contributions separately
 * and compounding them to the end of the investment period.
 */
export function calculateStepUpSIP(
  monthlyInvestment: number,
  annualReturn: number,
  years: number,
  annualStepUpPercent: number
): StepUpSIPResult {
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const stepUpRate = annualStepUpPercent / 100;

  let totalValue = 0;
  let totalInvested = 0;
  let currentMonthlyInvestment = monthlyInvestment;

  for (let year = 1; year <= years; year++) {
    // Calculate future value of this year's 12 monthly contributions
    // Each contribution is made at the start of the month (annuity due)
    // and compounded to the end of the total investment period

    for (let month = 1; month <= 12; month++) {
      // Months remaining from this contribution to end of investment
      const monthsRemaining = (years - year) * 12 + (12 - month) + 1;
      totalValue +=
        currentMonthlyInvestment * Math.pow(1 + monthlyRate, monthsRemaining);
      totalInvested += currentMonthlyInvestment;
    }

    // Increase monthly investment for next year
    if (year < years) {
      currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUpRate);
    }
  }

  // Calculate what the result would be without step-up for comparison
  const withoutStepUp = calculateSIP(monthlyInvestment, annualReturn, years);

  return {
    maturityAmount: Math.round(totalValue),
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalValue - totalInvested),
    withoutStepUp,
  };
}

/**
 * Generate year-by-year breakdown of Step-Up SIP growth.
 */
export function calculateStepUpSIPYearlyBreakdown(
  monthlyInvestment: number,
  annualReturn: number,
  years: number,
  annualStepUpPercent: number
): SIPYearlyBreakdown[] {
  const breakdown: SIPYearlyBreakdown[] = [];
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const stepUpRate = annualStepUpPercent / 100;

  let cumulativeValue = 0;
  let cumulativeInvested = 0;
  let currentMonthlyInvestment = monthlyInvestment;

  for (let year = 1; year <= years; year++) {
    // Compound the previous year's value for 12 months
    // and add this year's contributions
    for (let month = 1; month <= 12; month++) {
      // Existing corpus grows
      cumulativeValue = cumulativeValue * (1 + monthlyRate);
      // Add new contribution at start of month (annuity due)
      cumulativeValue += currentMonthlyInvestment * (1 + monthlyRate);
      cumulativeInvested += currentMonthlyInvestment;
    }

    breakdown.push({
      year,
      invested: Math.round(cumulativeInvested),
      interest: Math.round(cumulativeValue - cumulativeInvested),
      totalValue: Math.round(cumulativeValue),
      monthlySIP: Math.round(currentMonthlyInvestment),
    });

    // Increase monthly investment for next year
    if (year < years) {
      currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUpRate);
    }
  }

  return breakdown;
}
