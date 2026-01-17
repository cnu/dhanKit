export interface GoalPlannerResult {
  requiredMonthlySIP: number;
  totalInvested: number;
  totalReturns: number;
  targetAmount: number;
}

export interface StepUpGoalPlannerResult extends GoalPlannerResult {
  withoutStepUp: GoalPlannerResult;
}

export interface GoalPlannerYearlyBreakdown {
  year: number;
  invested: number;
  interest: number;
  totalValue: number;
  inflationAdjustedValue?: number;
  monthlySIP?: number;
}

/**
 * Calculate required monthly SIP to reach a target amount (reverse SIP).
 *
 * Rearranges the SIP formula to solve for P (monthly investment):
 * M = P × ((1 + r)^n – 1) / r × (1 + r)
 * P = M / [((1 + r)^n – 1) / r × (1 + r)]
 *
 * Where:
 *   M = Target amount
 *   P = Required monthly investment (what we're solving for)
 *   r = Effective monthly rate = (1 + annual_rate)^(1/12) - 1
 *   n = Number of months (years × 12)
 */
export function calculateGoalPlanner(
  targetAmount: number,
  annualReturn: number,
  years: number
): GoalPlannerResult {
  // Convert annual rate to effective monthly rate
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const months = years * 12;

  // Annuity factor for annuity due (payment at start of period)
  const annuityFactor =
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  // Solve for required monthly SIP
  const requiredMonthlySIP = targetAmount / annuityFactor;

  const totalInvested = requiredMonthlySIP * months;
  const totalReturns = targetAmount - totalInvested;

  return {
    requiredMonthlySIP: Math.round(requiredMonthlySIP),
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(totalReturns),
    targetAmount,
  };
}

/**
 * Generate year-by-year breakdown for goal planner.
 */
export function calculateGoalPlannerYearlyBreakdown(
  targetAmount: number,
  annualReturn: number,
  years: number
): GoalPlannerYearlyBreakdown[] {
  const result = calculateGoalPlanner(targetAmount, annualReturn, years);
  const breakdown: GoalPlannerYearlyBreakdown[] = [];
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;

  let cumulativeValue = 0;
  let cumulativeInvested = 0;

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      // Existing corpus grows
      cumulativeValue = cumulativeValue * (1 + monthlyRate);
      // Add new contribution at start of month (annuity due)
      cumulativeValue += result.requiredMonthlySIP * (1 + monthlyRate);
      cumulativeInvested += result.requiredMonthlySIP;
    }

    breakdown.push({
      year,
      invested: Math.round(cumulativeInvested),
      interest: Math.round(cumulativeValue - cumulativeInvested),
      totalValue: Math.round(cumulativeValue),
    });
  }

  return breakdown;
}

/**
 * Calculate required step-up SIP to reach a target amount.
 *
 * With step-up SIP, the monthly investment increases by a fixed percentage each year.
 * This requires iterative solving since there's no closed-form solution.
 * Uses binary search to find the initial SIP amount that reaches the target.
 */
export function calculateStepUpGoalPlanner(
  targetAmount: number,
  annualReturn: number,
  years: number,
  annualStepUpPercent: number
): StepUpGoalPlannerResult {
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const stepUpRate = annualStepUpPercent / 100;

  // Binary search for the initial monthly SIP
  let low = 0;
  let high = targetAmount; // Upper bound: entire target as initial SIP (won't be this high)
  let initialSIP = 0;

  // Helper function to calculate final value given initial SIP
  const calculateFinalValue = (startSIP: number): number => {
    let totalValue = 0;
    let currentMonthlyInvestment = startSIP;

    for (let year = 1; year <= years; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthsRemaining = (years - year) * 12 + (12 - month) + 1;
        totalValue +=
          currentMonthlyInvestment * Math.pow(1 + monthlyRate, monthsRemaining);
      }
      if (year < years) {
        currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUpRate);
      }
    }

    return totalValue;
  };

  // Binary search with precision
  const tolerance = 1; // Within ₹1 of target
  for (let i = 0; i < 100; i++) {
    const mid = (low + high) / 2;
    const result = calculateFinalValue(mid);

    if (Math.abs(result - targetAmount) < tolerance) {
      initialSIP = mid;
      break;
    }

    if (result < targetAmount) {
      low = mid;
    } else {
      high = mid;
    }
    initialSIP = mid;
  }

  // Calculate total invested with step-up
  let totalInvested = 0;
  let currentSIP = initialSIP;
  for (let year = 1; year <= years; year++) {
    totalInvested += currentSIP * 12;
    if (year < years) {
      currentSIP = currentSIP * (1 + stepUpRate);
    }
  }

  // Calculate what would be needed without step-up for comparison
  const withoutStepUp = calculateGoalPlanner(targetAmount, annualReturn, years);

  return {
    requiredMonthlySIP: Math.round(initialSIP),
    totalInvested: Math.round(totalInvested),
    totalReturns: Math.round(targetAmount - totalInvested),
    targetAmount,
    withoutStepUp,
  };
}

/**
 * Generate year-by-year breakdown for step-up goal planner.
 */
export function calculateStepUpGoalPlannerYearlyBreakdown(
  targetAmount: number,
  annualReturn: number,
  years: number,
  annualStepUpPercent: number
): GoalPlannerYearlyBreakdown[] {
  const result = calculateStepUpGoalPlanner(
    targetAmount,
    annualReturn,
    years,
    annualStepUpPercent
  );
  const breakdown: GoalPlannerYearlyBreakdown[] = [];
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const stepUpRate = annualStepUpPercent / 100;

  let cumulativeValue = 0;
  let cumulativeInvested = 0;
  let currentMonthlyInvestment = result.requiredMonthlySIP;

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      cumulativeValue = cumulativeValue * (1 + monthlyRate);
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

    if (year < years) {
      currentMonthlyInvestment = currentMonthlyInvestment * (1 + stepUpRate);
    }
  }

  return breakdown;
}
