export interface RetirementResult {
  /**
   * Total corpus needed at retirement
   */
  requiredCorpus: number;

  /**
   * Monthly expenses in today's money
   */
  currentMonthlyExpenses: number;

  /**
   * Monthly expenses at retirement (inflation-adjusted)
   */
  monthlyExpensesAtRetirement: number;

  /**
   * Annual expenses at retirement
   */
  annualExpensesAtRetirement: number;

  /**
   * Safe withdrawal rate used (as decimal, e.g., 0.04 for 4%)
   */
  withdrawalRate: number;

  /**
   * Number of years until retirement
   */
  yearsToRetirement: number;

  /**
   * Expected retirement duration in years
   */
  retirementDuration: number;

  /**
   * Required monthly SIP to reach corpus (if starting from zero)
   */
  requiredMonthlySIP: number;

  /**
   * Total amount that would be invested via SIP
   */
  totalSIPInvested: number;

  /**
   * Returns earned from SIP investments
   */
  sipReturns: number;

  /**
   * How many years the corpus would last based on withdrawals
   * null if corpus lasts indefinitely
   */
  corpusLastsYears: number | null;

  /**
   * Whether the corpus is sufficient for the retirement period
   */
  corpusSufficient: boolean;

  /**
   * Current corpus value (if user has existing savings)
   */
  currentCorpus: number;

  /**
   * Future value of current corpus at retirement
   */
  currentCorpusFutureValue: number;

  /**
   * Gap between required corpus and future value of current savings
   */
  corpusGap: number;
}

export interface RetirementYearlyBreakdown {
  year: number;
  age: number;
  phase: "accumulation" | "retirement";
  invested?: number;
  sipContribution?: number;
  interestEarned: number;
  withdrawal?: number;
  totalValue: number;
  inflationAdjustedValue?: number;
}

export interface FIREResult extends RetirementResult {
  /**
   * FIRE number (25x annual expenses - based on 4% rule)
   */
  fireNumber: number;

  /**
   * Lean FIRE number (based on minimum expenses)
   */
  leanFireNumber: number;

  /**
   * Fat FIRE number (based on comfortable expenses)
   */
  fatFireNumber: number;

  /**
   * Coast FIRE number - corpus that grows to FIRE number without additional contributions
   */
  coastFireNumber: number;

  /**
   * Barista FIRE - partial income needed to cover gap
   */
  baristaFireMonthlyIncome: number;
}

/**
 * Calculate required retirement corpus using expense-based method.
 *
 * Uses the formula: Corpus = (Annual Expenses at Retirement) / Withdrawal Rate
 *
 * The withdrawal rate is based on the 4% rule (or custom rate):
 * - 4% rule: Withdraw 4% of corpus annually, historically sustainable for 30 years
 * - Lower rates (3%) provide more safety margin
 * - Higher rates (5%) may deplete corpus faster
 *
 * Expenses are inflation-adjusted to retirement year:
 * Future Expenses = Current Expenses × (1 + inflation)^years
 *
 * @param currentAge - Current age of the user
 * @param retirementAge - Target retirement age
 * @param lifeExpectancy - Expected lifespan
 * @param monthlyExpenses - Current monthly expenses
 * @param inflationRate - Expected annual inflation (percentage)
 * @param withdrawalRate - Safe withdrawal rate (percentage, default 4%)
 * @param expectedReturn - Expected return during accumulation (percentage)
 * @param currentCorpus - Existing retirement savings (default 0)
 */
export function calculateRetirement(
  currentAge: number,
  retirementAge: number,
  lifeExpectancy: number,
  monthlyExpenses: number,
  inflationRate: number,
  withdrawalRate: number,
  expectedReturn: number,
  currentCorpus: number = 0
): RetirementResult {
  const yearsToRetirement = retirementAge - currentAge;
  const retirementDuration = lifeExpectancy - retirementAge;

  // Calculate expenses at retirement (inflation-adjusted)
  const monthlyExpensesAtRetirement =
    monthlyExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
  const annualExpensesAtRetirement = monthlyExpensesAtRetirement * 12;

  // Required corpus using withdrawal rate
  // Corpus = Annual Expenses / Withdrawal Rate
  const requiredCorpus = annualExpensesAtRetirement / (withdrawalRate / 100);

  // Future value of current corpus at retirement
  const currentCorpusFutureValue =
    currentCorpus * Math.pow(1 + expectedReturn / 100, yearsToRetirement);

  // Gap that needs to be filled via SIP
  const corpusGap = Math.max(0, requiredCorpus - currentCorpusFutureValue);

  // Calculate required monthly SIP to fill the gap
  let requiredMonthlySIP = 0;
  let totalSIPInvested = 0;
  let sipReturns = 0;

  if (corpusGap > 0 && yearsToRetirement > 0) {
    // SIP formula reversed: P = M / [((1 + r)^n - 1) / r × (1 + r)]
    const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;
    const months = yearsToRetirement * 12;
    const annuityFactor =
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);

    requiredMonthlySIP = corpusGap / annuityFactor;
    totalSIPInvested = requiredMonthlySIP * months;
    sipReturns = corpusGap - totalSIPInvested;
  }

  // Calculate how long corpus would last
  const corpusLastsYears = calculateCorpusLongevity(
    requiredCorpus,
    monthlyExpensesAtRetirement,
    expectedReturn - inflationRate, // Real return during retirement
    inflationRate
  );

  const corpusSufficient =
    corpusLastsYears === null || corpusLastsYears >= retirementDuration;

  return {
    requiredCorpus: Math.round(requiredCorpus),
    currentMonthlyExpenses: monthlyExpenses,
    monthlyExpensesAtRetirement: Math.round(monthlyExpensesAtRetirement),
    annualExpensesAtRetirement: Math.round(annualExpensesAtRetirement),
    withdrawalRate: withdrawalRate / 100,
    yearsToRetirement,
    retirementDuration,
    requiredMonthlySIP: Math.round(requiredMonthlySIP),
    totalSIPInvested: Math.round(totalSIPInvested),
    sipReturns: Math.round(sipReturns),
    corpusLastsYears,
    corpusSufficient,
    currentCorpus,
    currentCorpusFutureValue: Math.round(currentCorpusFutureValue),
    corpusGap: Math.round(corpusGap),
  };
}

/**
 * Calculate how long a corpus will last with inflation-adjusted withdrawals.
 *
 * @param corpus - Initial corpus at retirement
 * @param monthlyWithdrawal - Starting monthly withdrawal
 * @param realReturn - Real return rate (nominal - inflation)
 * @param inflationRate - Annual inflation rate
 * @returns Years the corpus will last, or null if indefinite
 */
function calculateCorpusLongevity(
  corpus: number,
  monthlyWithdrawal: number,
  realReturn: number,
  inflationRate: number
): number | null {
  const monthlyRealReturn = Math.pow(1 + realReturn / 100, 1 / 12) - 1;

  // If monthly interest exceeds withdrawal, corpus lasts forever
  const monthlyInterest = corpus * monthlyRealReturn;
  if (monthlyWithdrawal <= monthlyInterest && realReturn > 0) {
    return null;
  }

  // Simulate withdrawals year by year
  let balance = corpus;
  let currentWithdrawal = monthlyWithdrawal;
  let years = 0;
  const maxYears = 100; // Safety limit

  while (balance > 0 && years < maxYears) {
    years++;

    // Process 12 months
    for (let month = 0; month < 12; month++) {
      // Earn return
      balance *= 1 + monthlyRealReturn;

      // Withdraw
      if (balance >= currentWithdrawal) {
        balance -= currentWithdrawal;
      } else {
        return years;
      }
    }

    // Increase withdrawal for next year (inflation)
    currentWithdrawal *= 1 + inflationRate / 100;
  }

  return years >= maxYears ? null : years;
}

/**
 * Calculate FIRE (Financial Independence, Retire Early) numbers.
 *
 * FIRE variations:
 * - Regular FIRE: 25x current annual expenses (4% rule)
 * - Lean FIRE: 25x minimum annual expenses (frugal lifestyle)
 * - Fat FIRE: 25x comfortable annual expenses (no lifestyle compromise)
 * - Coast FIRE: Amount that grows to FIRE number without contributions
 * - Barista FIRE: Partial FIRE with part-time income
 */
export function calculateFIRE(
  currentAge: number,
  retirementAge: number,
  lifeExpectancy: number,
  monthlyExpenses: number,
  inflationRate: number,
  withdrawalRate: number,
  expectedReturn: number,
  currentCorpus: number = 0,
  leanMultiplier: number = 0.7, // 70% of expenses for lean FIRE
  fatMultiplier: number = 1.5 // 150% of expenses for fat FIRE
): FIREResult {
  const baseResult = calculateRetirement(
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    inflationRate,
    withdrawalRate,
    expectedReturn,
    currentCorpus
  );

  const yearsToRetirement = retirementAge - currentAge;

  // FIRE Number: 25x annual expenses (based on 4% rule)
  // Adjusted for inflation to retirement
  const currentAnnualExpenses = monthlyExpenses * 12;
  const fireNumber = (currentAnnualExpenses / (withdrawalRate / 100));

  // Lean FIRE: Based on minimum/frugal expenses
  const leanFireNumber = fireNumber * leanMultiplier;

  // Fat FIRE: Based on comfortable/luxury expenses
  const fatFireNumber = fireNumber * fatMultiplier;

  // Coast FIRE: Amount needed today that grows to FIRE number
  // without additional contributions
  const coastFireNumber =
    fireNumber / Math.pow(1 + expectedReturn / 100, yearsToRetirement);

  // Barista FIRE: Monthly income needed if you have some corpus
  // but not enough for full FIRE
  const futureCorpusValue =
    currentCorpus * Math.pow(1 + expectedReturn / 100, yearsToRetirement);
  const gap = Math.max(0, fireNumber - futureCorpusValue);

  // Monthly income needed to cover the gap over working years
  // Using simple division (could use more complex SIP-based calculation)
  const baristaFireMonthlyIncome =
    yearsToRetirement > 0 ? gap / (yearsToRetirement * 12) : 0;

  return {
    ...baseResult,
    fireNumber: Math.round(fireNumber),
    leanFireNumber: Math.round(leanFireNumber),
    fatFireNumber: Math.round(fatFireNumber),
    coastFireNumber: Math.round(coastFireNumber),
    baristaFireMonthlyIncome: Math.round(baristaFireMonthlyIncome),
  };
}

/**
 * Generate year-by-year breakdown for retirement planning.
 * Shows both accumulation and retirement phases.
 */
export function calculateRetirementYearlyBreakdown(
  currentAge: number,
  retirementAge: number,
  lifeExpectancy: number,
  monthlyExpenses: number,
  inflationRate: number,
  withdrawalRate: number,
  expectedReturn: number,
  currentCorpus: number = 0,
  showRetirementPhase: boolean = true
): RetirementYearlyBreakdown[] {
  const result = calculateRetirement(
    currentAge,
    retirementAge,
    lifeExpectancy,
    monthlyExpenses,
    inflationRate,
    withdrawalRate,
    expectedReturn,
    currentCorpus
  );

  const breakdown: RetirementYearlyBreakdown[] = [];
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;

  // Accumulation Phase
  let corpusValue = currentCorpus;
  let cumulativeInvested = currentCorpus;

  for (let year = 1; year <= result.yearsToRetirement; year++) {
    const age = currentAge + year;
    let yearlyInterest = 0;
    let yearlySIP = 0;

    // Process 12 months
    for (let month = 0; month < 12; month++) {
      // Existing corpus earns interest
      const interest = corpusValue * monthlyRate;
      corpusValue += interest;
      yearlyInterest += interest;

      // Add SIP contribution (annuity due - at start of month)
      corpusValue += result.requiredMonthlySIP * (1 + monthlyRate);
      yearlySIP += result.requiredMonthlySIP;
    }

    cumulativeInvested += yearlySIP;

    breakdown.push({
      year,
      age,
      phase: "accumulation",
      invested: Math.round(cumulativeInvested),
      sipContribution: Math.round(yearlySIP),
      interestEarned: Math.round(yearlyInterest),
      totalValue: Math.round(corpusValue),
      inflationAdjustedValue: Math.round(
        corpusValue / Math.pow(1 + inflationRate / 100, year)
      ),
    });
  }

  // Retirement Phase (withdrawal)
  if (showRetirementPhase && result.retirementDuration > 0) {
    let monthlyWithdrawal =
      result.monthlyExpensesAtRetirement;
    const retirementMonthlyRate = monthlyRate; // Could use different rate

    for (
      let year = result.yearsToRetirement + 1;
      year <= result.yearsToRetirement + Math.min(result.retirementDuration, 50);
      year++
    ) {
      if (corpusValue <= 0) break;

      const age = currentAge + year;
      let yearlyInterest = 0;
      let yearlyWithdrawal = 0;

      // Increase withdrawal for inflation at start of each retirement year
      if (year > result.yearsToRetirement + 1) {
        monthlyWithdrawal *= 1 + inflationRate / 100;
      }

      // Process 12 months
      for (let month = 0; month < 12; month++) {
        if (corpusValue <= 0) break;

        // Earn interest
        const interest = corpusValue * retirementMonthlyRate;
        corpusValue += interest;
        yearlyInterest += interest;

        // Withdraw
        const withdrawal = Math.min(monthlyWithdrawal, corpusValue);
        corpusValue -= withdrawal;
        yearlyWithdrawal += withdrawal;
      }

      breakdown.push({
        year,
        age,
        phase: "retirement",
        withdrawal: Math.round(yearlyWithdrawal),
        interestEarned: Math.round(yearlyInterest),
        totalValue: Math.round(Math.max(0, corpusValue)),
        inflationAdjustedValue: Math.round(
          Math.max(0, corpusValue) / Math.pow(1 + inflationRate / 100, year)
        ),
      });
    }
  }

  return breakdown;
}

/**
 * Calculate years to FIRE based on savings rate.
 *
 * This is the classic FIRE calculation: given a savings rate,
 * how many years until you can retire?
 *
 * Based on the formula from Mr. Money Mustache:
 * Years to FIRE = log((1 + (expenses/savings) × (1 - SWR/return)) / (1 - SWR/return)) / log(1 + return)
 *
 * Simplified: Higher savings rate = faster FIRE
 */
export function calculateYearsToFIRE(
  annualIncome: number,
  annualExpenses: number,
  currentCorpus: number,
  expectedReturn: number,
  withdrawalRate: number
): number | null {
  const annualSavings = annualIncome - annualExpenses;

  // Can't FIRE if spending more than earning
  if (annualSavings <= 0) {
    return null;
  }

  const savingsRate = annualSavings / annualIncome;

  // FIRE number
  const fireNumber = annualExpenses / (withdrawalRate / 100);

  // Already FIRE?
  if (currentCorpus >= fireNumber) {
    return 0;
  }

  // Calculate years using compound growth formula
  // FV = PV × (1+r)^n + PMT × ((1+r)^n - 1) / r
  // Solving for n is complex, use iterative approach

  const r = expectedReturn / 100;
  let corpus = currentCorpus;
  let years = 0;
  const maxYears = 100;

  while (corpus < fireNumber && years < maxYears) {
    // Add yearly returns and savings
    corpus = corpus * (1 + r) + annualSavings;
    years++;
  }

  return years >= maxYears ? null : years;
}
