export interface SWPResult {
  /**
   * Total amount withdrawn over the period
   */
  totalWithdrawn: number;

  /**
   * Remaining corpus at the end of the period
   * Will be 0 if corpus depleted
   */
  finalCorpus: number;

  /**
   * Total interest/returns earned during the period
   */
  totalInterestEarned: number;

  /**
   * Whether the corpus lasted the entire withdrawal period
   */
  corpusLasted: boolean;

  /**
   * Number of months the corpus actually lasted
   * Equals years * 12 if corpus didn't deplete
   */
  monthsLasted: number;
}

export interface SWPYearlyBreakdown {
  year: number;
  openingBalance: number;
  totalWithdrawn: number;
  interestEarned: number;
  closingBalance: number;
  /** Monthly withdrawal amount for this year (for inflation-adjusted SWP) */
  monthlyWithdrawal?: number;
  /** Closing balance in today's purchasing power */
  inflationAdjustedBalance?: number;
}

export interface InflationAdjustedSWPResult extends SWPResult {
  /**
   * Monthly withdrawal in the first year
   */
  firstYearWithdrawal: number;

  /**
   * Monthly withdrawal in the final year (stepped up for inflation)
   */
  finalYearWithdrawal: number;

  /**
   * Final corpus value in today's purchasing power
   */
  inflationAdjustedFinalCorpus: number;

  /**
   * Real return rate after inflation (using Fisher equation)
   */
  realReturnRate: number;

  /**
   * Result without inflation adjustment for comparison
   */
  withoutInflation: SWPResult;
}

/**
 * Calculate SWP (Systematic Withdrawal Plan) results.
 *
 * SWP allows you to withdraw a fixed amount monthly from your investment
 * while the remaining corpus continues to earn returns.
 *
 * The calculation works month by month:
 * 1. Start with opening balance
 * 2. Earn monthly return on opening balance
 * 3. Deduct monthly withdrawal
 * 4. Result is next month's opening balance
 *
 * Uses effective monthly rate = (1 + annual_rate)^(1/12) - 1
 * This matches industry-standard calculators like Groww.
 *
 * @param initialCorpus - Starting investment amount
 * @param monthlyWithdrawal - Fixed amount to withdraw each month
 * @param expectedReturn - Annual return rate as percentage (e.g., 12 for 12%)
 * @param years - Withdrawal period in years
 */
export function calculateSWP(
  initialCorpus: number,
  monthlyWithdrawal: number,
  expectedReturn: number,
  years: number
): SWPResult {
  // Convert annual rate to effective monthly rate (matches SIP calculator and Groww)
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;
  const totalMonths = years * 12;

  let balance = initialCorpus;
  let totalWithdrawn = 0;
  let totalInterestEarned = 0;
  let monthsLasted = 0;

  for (let month = 1; month <= totalMonths; month++) {
    // If balance is already 0, stop
    if (balance <= 0) {
      break;
    }

    // Earn interest on current balance
    const monthlyInterest = balance * monthlyRate;
    balance += monthlyInterest;
    totalInterestEarned += monthlyInterest;

    // Withdraw monthly amount
    if (balance >= monthlyWithdrawal) {
      balance -= monthlyWithdrawal;
      totalWithdrawn += monthlyWithdrawal;
      monthsLasted = month;
    } else if (balance > 0) {
      // Corpus exhausted - withdraw whatever is left
      totalWithdrawn += balance;
      balance = 0;
      monthsLasted = month;
      break;
    }
  }

  return {
    totalWithdrawn: Math.round(totalWithdrawn),
    finalCorpus: Math.round(balance),
    totalInterestEarned: Math.round(totalInterestEarned),
    corpusLasted: balance > 0 || monthsLasted >= totalMonths,
    monthsLasted,
  };
}

/**
 * Generate year-by-year breakdown of SWP withdrawals.
 */
export function calculateSWPYearlyBreakdown(
  initialCorpus: number,
  monthlyWithdrawal: number,
  expectedReturn: number,
  years: number
): SWPYearlyBreakdown[] {
  const breakdown: SWPYearlyBreakdown[] = [];
  // Convert annual rate to effective monthly rate
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;

  let balance = initialCorpus;

  for (let year = 1; year <= years; year++) {
    const openingBalance = balance;
    let yearlyInterest = 0;
    let yearlyWithdrawn = 0;

    // Process 12 months
    for (let month = 1; month <= 12; month++) {
      if (balance <= 0) break;

      // Earn interest
      const monthlyInterest = balance * monthlyRate;
      balance += monthlyInterest;
      yearlyInterest += monthlyInterest;

      // Withdraw
      if (balance >= monthlyWithdrawal) {
        balance -= monthlyWithdrawal;
        yearlyWithdrawn += monthlyWithdrawal;
      } else {
        yearlyWithdrawn += balance;
        balance = 0;
        break;
      }
    }

    breakdown.push({
      year,
      openingBalance: Math.round(openingBalance),
      totalWithdrawn: Math.round(yearlyWithdrawn),
      interestEarned: Math.round(yearlyInterest),
      closingBalance: Math.round(balance),
    });

    // Stop if corpus depleted
    if (balance <= 0) break;
  }

  return breakdown;
}

/**
 * Calculate the maximum sustainable monthly withdrawal for a given corpus.
 *
 * This finds the withdrawal amount where the corpus exactly depletes
 * at the end of the period (final balance approaches 0).
 *
 * Uses the perpetuity/annuity formula to calculate maximum withdrawal
 * that can be sustained over the given period.
 *
 * @param initialCorpus - Starting investment amount
 * @param expectedReturn - Annual return rate as percentage
 * @param years - Desired withdrawal period in years
 * @returns Maximum monthly withdrawal amount
 */
export function calculateMaxWithdrawal(
  initialCorpus: number,
  expectedReturn: number,
  years: number
): number {
  const totalMonths = years * 12;

  // If rate is 0, simply divide corpus by months
  if (expectedReturn === 0) {
    return Math.round(initialCorpus / totalMonths);
  }

  // Convert annual rate to effective monthly rate
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;

  // Use annuity formula: PMT = PV × r / (1 - (1 + r)^-n)
  // Where: PMT = monthly withdrawal, PV = initial corpus,
  // r = monthly rate, n = total months
  const maxWithdrawal =
    (initialCorpus * monthlyRate) /
    (1 - Math.pow(1 + monthlyRate, -totalMonths));

  return Math.round(maxWithdrawal);
}

/**
 * Calculate how long a corpus will last with given withdrawals.
 *
 * @param initialCorpus - Starting investment amount
 * @param monthlyWithdrawal - Fixed amount to withdraw each month
 * @param expectedReturn - Annual return rate as percentage
 * @returns Object with years and months the corpus will last, or null if it lasts forever
 */
export function calculateCorpusDuration(
  initialCorpus: number,
  monthlyWithdrawal: number,
  expectedReturn: number
): { years: number; months: number } | null {
  // Special case: 0% return - simple division
  if (expectedReturn === 0) {
    const totalMonths = Math.floor(initialCorpus / monthlyWithdrawal);
    return {
      years: Math.floor(totalMonths / 12),
      months: totalMonths % 12,
    };
  }

  // Convert annual rate to effective monthly rate
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;

  // If monthly withdrawal is less than or equal to monthly interest, corpus lasts forever
  const monthlyInterest = initialCorpus * monthlyRate;
  if (monthlyWithdrawal <= monthlyInterest) {
    return null; // Corpus never depletes
  }

  // Use logarithmic formula: n = -ln(1 - PV×r/PMT) / ln(1+r)
  // Where n = number of months
  // Note: ratio > 0 is guaranteed since we already checked withdrawal > interest above
  const ratio = 1 - (initialCorpus * monthlyRate) / monthlyWithdrawal;
  const monthsTotal = -Math.log(ratio) / Math.log(1 + monthlyRate);
  const totalMonths = Math.floor(monthsTotal);

  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
  };
}

/**
 * Calculate SWP with inflation-adjusted (step-up) withdrawals.
 *
 * This simulates a realistic retirement scenario where withdrawals increase
 * each year to maintain purchasing power against inflation.
 *
 * @param initialCorpus - Starting investment amount
 * @param monthlyWithdrawal - Starting monthly withdrawal (Year 1)
 * @param expectedReturn - Annual return rate as percentage
 * @param years - Withdrawal period in years
 * @param inflationRate - Annual inflation rate as percentage (e.g., 6 for 6%)
 */
export function calculateInflationAdjustedSWP(
  initialCorpus: number,
  monthlyWithdrawal: number,
  expectedReturn: number,
  years: number,
  inflationRate: number
): InflationAdjustedSWPResult {
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;
  const totalMonths = years * 12;

  let balance = initialCorpus;
  let totalWithdrawn = 0;
  let totalInterestEarned = 0;
  let monthsLasted = 0;
  let currentYearWithdrawal = monthlyWithdrawal;
  let finalYearWithdrawal = monthlyWithdrawal;

  for (let month = 1; month <= totalMonths; month++) {
    if (balance <= 0) break;

    // Update withdrawal at the start of each year (except year 1)
    if (month > 1 && (month - 1) % 12 === 0) {
      currentYearWithdrawal =
        currentYearWithdrawal * (1 + inflationRate / 100);
    }

    // Earn interest
    const monthlyInterest = balance * monthlyRate;
    balance += monthlyInterest;
    totalInterestEarned += monthlyInterest;

    // Withdraw
    if (balance >= currentYearWithdrawal) {
      balance -= currentYearWithdrawal;
      totalWithdrawn += currentYearWithdrawal;
      monthsLasted = month;
      finalYearWithdrawal = currentYearWithdrawal;
    } else if (balance > 0) {
      totalWithdrawn += balance;
      balance = 0;
      monthsLasted = month;
      break;
    }
  }

  // Calculate inflation-adjusted final corpus (today's purchasing power)
  const yearsElapsed = monthsLasted / 12;
  const inflationAdjustedFinalCorpus = Math.round(
    balance / Math.pow(1 + inflationRate / 100, yearsElapsed)
  );

  // Real return rate using Fisher equation: (1 + nominal) / (1 + inflation) - 1
  const realReturnRate =
    Math.round(
      (((1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1) * 100) * 100
    ) / 100;

  // Calculate without inflation for comparison
  const withoutInflation = calculateSWP(
    initialCorpus,
    monthlyWithdrawal,
    expectedReturn,
    years
  );

  return {
    totalWithdrawn: Math.round(totalWithdrawn),
    finalCorpus: Math.round(balance),
    totalInterestEarned: Math.round(totalInterestEarned),
    corpusLasted: balance > 0 || monthsLasted >= totalMonths,
    monthsLasted,
    firstYearWithdrawal: monthlyWithdrawal,
    finalYearWithdrawal: Math.round(finalYearWithdrawal),
    inflationAdjustedFinalCorpus,
    realReturnRate,
    withoutInflation,
  };
}

/**
 * Generate year-by-year breakdown for inflation-adjusted SWP.
 */
export function calculateInflationAdjustedSWPYearlyBreakdown(
  initialCorpus: number,
  monthlyWithdrawal: number,
  expectedReturn: number,
  years: number,
  inflationRate: number
): SWPYearlyBreakdown[] {
  const breakdown: SWPYearlyBreakdown[] = [];
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;

  let balance = initialCorpus;
  let currentYearWithdrawal = monthlyWithdrawal;

  for (let year = 1; year <= years; year++) {
    const openingBalance = balance;
    let yearlyInterest = 0;
    let yearlyWithdrawn = 0;

    // Step up withdrawal at the start of each year (except year 1)
    if (year > 1) {
      currentYearWithdrawal =
        currentYearWithdrawal * (1 + inflationRate / 100);
    }

    // Process 12 months
    for (let month = 1; month <= 12; month++) {
      if (balance <= 0) break;

      // Earn interest
      const monthlyInterest = balance * monthlyRate;
      balance += monthlyInterest;
      yearlyInterest += monthlyInterest;

      // Withdraw
      if (balance >= currentYearWithdrawal) {
        balance -= currentYearWithdrawal;
        yearlyWithdrawn += currentYearWithdrawal;
      } else {
        yearlyWithdrawn += balance;
        balance = 0;
        break;
      }
    }

    // Calculate inflation-adjusted closing balance
    const inflationAdjustedBalance = Math.round(
      balance / Math.pow(1 + inflationRate / 100, year)
    );

    breakdown.push({
      year,
      openingBalance: Math.round(openingBalance),
      totalWithdrawn: Math.round(yearlyWithdrawn),
      interestEarned: Math.round(yearlyInterest),
      closingBalance: Math.round(balance),
      monthlyWithdrawal: Math.round(currentYearWithdrawal),
      inflationAdjustedBalance,
    });

    if (balance <= 0) break;
  }

  return breakdown;
}

/**
 * Calculate max withdrawal with inflation adjustment.
 *
 * This uses binary search to find the starting monthly withdrawal
 * that will deplete the corpus exactly at the end of the period,
 * while increasing withdrawals each year for inflation.
 */
export function calculateMaxInflationAdjustedWithdrawal(
  initialCorpus: number,
  expectedReturn: number,
  years: number,
  inflationRate: number
): number {
  // Binary search for the max starting withdrawal
  let low = 1;
  let high = initialCorpus / 12; // Can't withdraw more than corpus in first year

  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    const result = calculateInflationAdjustedSWP(
      initialCorpus,
      mid,
      expectedReturn,
      years,
      inflationRate
    );

    if (result.corpusLasted) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return low;
}
