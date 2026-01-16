export interface RDResult {
  /**
   * Total maturity amount at the end of the tenure
   */
  maturityAmount: number;

  /**
   * Total amount deposited (monthly × months)
   */
  totalDeposited: number;

  /**
   * Total interest earned
   */
  totalInterest: number;

  /**
   * Effective annual rate accounting for compounding
   */
  effectiveRate: number;
}

export interface RDMonthlyBreakdown {
  month: number;
  /**
   * Deposit made this month
   */
  deposit: number;
  /**
   * Cumulative deposits till this month
   */
  totalDeposited: number;
  /**
   * Interest earned this month
   */
  interestThisMonth: number;
  /**
   * Cumulative interest till this month
   */
  totalInterest: number;
  /**
   * Total value (deposits + interest)
   */
  totalValue: number;
}

export type CompoundingFrequency = "monthly" | "quarterly";

/**
 * Get the number of times interest is compounded per year
 */
function getCompoundingPeriods(frequency: CompoundingFrequency): number {
  switch (frequency) {
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
  }
}

/**
 * Calculate Recurring Deposit maturity amount.
 *
 * RD is a fixed deposit where you deposit a fixed amount every month.
 * Most Indian banks compound RD interest quarterly.
 *
 * For quarterly compounding, we use the formula:
 * A = P × [(1 + r/n)^(nt) - 1] / (r/n) × (1 + r/n)
 *
 * However, since deposits are made monthly but compounding is quarterly,
 * we need to calculate this iteratively for accuracy.
 *
 * @param monthlyDeposit - Fixed amount deposited each month
 * @param annualRate - Annual interest rate as percentage (e.g., 7 for 7%)
 * @param months - Tenure in months
 * @param compounding - Compounding frequency (most banks use quarterly)
 */
export function calculateRD(
  monthlyDeposit: number,
  annualRate: number,
  months: number,
  compounding: CompoundingFrequency = "quarterly"
): RDResult {
  const rate = annualRate / 100;
  const n = getCompoundingPeriods(compounding);
  const periodicRate = rate / n; // Rate per compounding period
  const monthsPerPeriod = 12 / n; // Months in each compounding period

  let balance = 0;
  let totalDeposited = 0;

  // Process month by month, compound at the appropriate intervals
  for (let month = 1; month <= months; month++) {
    // Add monthly deposit
    balance += monthlyDeposit;
    totalDeposited += monthlyDeposit;

    // Compound interest at the end of each compounding period
    if (month % monthsPerPeriod === 0) {
      balance = balance * (1 + periodicRate);
    }
  }

  // Handle any remaining partial period at the end
  const remainingMonths = months % monthsPerPeriod;
  if (remainingMonths > 0) {
    // Pro-rata interest for partial period
    const partialRate = periodicRate * (remainingMonths / monthsPerPeriod);
    balance = balance * (1 + partialRate);
  }

  const totalInterest = balance - totalDeposited;

  // Effective annual rate: (1 + r/n)^n - 1
  const effectiveRate = (Math.pow(1 + rate / n, n) - 1) * 100;

  return {
    maturityAmount: Math.round(balance),
    totalDeposited: Math.round(totalDeposited),
    totalInterest: Math.round(totalInterest),
    effectiveRate: Math.round(effectiveRate * 100) / 100,
  };
}

/**
 * Generate month-by-month breakdown of RD growth.
 * Shows every 3 months for readability, always including the final month.
 */
export function calculateRDMonthlyBreakdown(
  monthlyDeposit: number,
  annualRate: number,
  totalMonths: number,
  compounding: CompoundingFrequency = "quarterly"
): RDMonthlyBreakdown[] {
  const breakdown: RDMonthlyBreakdown[] = [];
  const rate = annualRate / 100;
  const n = getCompoundingPeriods(compounding);
  const periodicRate = rate / n;
  const monthsPerPeriod = 12 / n;

  let balance = 0;
  let totalDeposited = 0;
  let prevBalance = 0;

  const interval = 3; // Show every 3 months

  for (let month = 1; month <= totalMonths; month++) {
    // Add monthly deposit
    balance += monthlyDeposit;
    totalDeposited += monthlyDeposit;

    // Compound interest at the end of each compounding period
    if (month % monthsPerPeriod === 0) {
      balance = balance * (1 + periodicRate);
    }

    // Record at intervals or final month
    if (month % interval === 0 || month === totalMonths) {
      const interestThisInterval = balance - prevBalance - (month % interval === 0 ? interval : month % interval) * monthlyDeposit;
      const totalInterest = balance - totalDeposited;

      breakdown.push({
        month,
        deposit: monthlyDeposit,
        totalDeposited: Math.round(totalDeposited),
        interestThisMonth: Math.round(interestThisInterval),
        totalInterest: Math.round(totalInterest),
        totalValue: Math.round(balance),
      });

      prevBalance = balance;
    }
  }

  return breakdown;
}

/**
 * Calculate the monthly deposit needed to reach a target maturity amount.
 *
 * Uses binary search to find the deposit amount.
 *
 * @param targetAmount - Desired maturity amount
 * @param annualRate - Annual interest rate as percentage
 * @param months - Tenure in months
 * @param compounding - Compounding frequency
 */
export function calculateRequiredDeposit(
  targetAmount: number,
  annualRate: number,
  months: number,
  compounding: CompoundingFrequency = "quarterly"
): number {
  // Binary search for the required deposit
  let low = 100;
  let high = targetAmount / months * 2; // Upper bound: target/months with some buffer

  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    const result = calculateRD(mid, annualRate, months, compounding);

    if (result.maturityAmount < targetAmount) {
      low = mid;
    } else {
      high = mid;
    }
  }

  // Return the deposit that meets or exceeds the target
  const resultLow = calculateRD(low, annualRate, months, compounding);
  const resultHigh = calculateRD(high, annualRate, months, compounding);

  if (resultLow.maturityAmount >= targetAmount) {
    return low;
  }
  return high;
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
  }
}
