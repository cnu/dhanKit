import {
  calculateSIP,
  calculateStepUpSIP,
  SIPResult,
  StepUpSIPResult,
} from "./sip";

export interface CostOfDelayResult {
  // Scenario 1: Start Now
  startNowYears: number;
  startNowCorpus: number;
  startNowInvested: number;
  startNowReturns: number;

  // Scenario 2: Start Later
  startLaterYears: number;
  startLaterCorpus: number;
  startLaterInvested: number;
  startLaterReturns: number;

  // Cost Analysis
  costOfDelay: number;
  costPerDay: number;
  costPerMonth: number;
  percentageLoss: number;

  // Missed opportunity
  missedInvestment: number;

  // Recovery metrics
  requiredSIPToMatch: number;
  additionalSIPNeeded: number;
  additionalSIPPercent: number;
}

export interface CostOfDelayBreakdown {
  year: number;
  age: number;
  startNowValue: number;
  startLaterValue: number;
  cumulativeGap: number;
  startNowInvested: number;
  startLaterInvested: number;
}

/**
 * Calculate the Cost of Delay for SIP investments.
 *
 * Compares two scenarios:
 * 1. Starting SIP immediately
 * 2. Starting SIP after a delay period
 *
 * Shows the wealth forfeited by delaying, plus what monthly SIP
 * would be needed to catch up if starting late.
 */
export function calculateCostOfDelay(
  monthlyInvestment: number,
  annualReturn: number,
  currentAge: number,
  retirementAge: number,
  delayYears: number,
  options?: {
    stepUpEnabled?: boolean;
    stepUpPercent?: number;
  }
): CostOfDelayResult {
  const startNowYears = retirementAge - currentAge;
  const startLaterYears = Math.max(1, retirementAge - currentAge - delayYears);

  // Calculate both scenarios
  let startNowResult: SIPResult | StepUpSIPResult;
  let startLaterResult: SIPResult | StepUpSIPResult;

  if (options?.stepUpEnabled && options.stepUpPercent) {
    startNowResult = calculateStepUpSIP(
      monthlyInvestment,
      annualReturn,
      startNowYears,
      options.stepUpPercent
    );
    startLaterResult = calculateStepUpSIP(
      monthlyInvestment,
      annualReturn,
      startLaterYears,
      options.stepUpPercent
    );
  } else {
    startNowResult = calculateSIP(monthlyInvestment, annualReturn, startNowYears);
    startLaterResult = calculateSIP(
      monthlyInvestment,
      annualReturn,
      startLaterYears
    );
  }

  const costOfDelay = startNowResult.maturityAmount - startLaterResult.maturityAmount;
  const daysOfDelay = delayYears * 365;
  const monthsOfDelay = delayYears * 12;

  // Calculate required SIP to match "start now" corpus
  // Solve for P in: targetCorpus = P × ((1 + r)^n - 1) / r × (1 + r)
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const months = startLaterYears * 12;
  const annuityFactor =
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);

  let requiredSIPToMatch: number;
  if (options?.stepUpEnabled && options.stepUpPercent) {
    // For step-up SIP, we need to solve iteratively or approximate
    // Using binary search to find the starting SIP needed
    requiredSIPToMatch = findRequiredStepUpSIP(
      startNowResult.maturityAmount,
      annualReturn,
      startLaterYears,
      options.stepUpPercent
    );
  } else {
    requiredSIPToMatch = startNowResult.maturityAmount / annuityFactor;
  }

  const additionalSIPNeeded = requiredSIPToMatch - monthlyInvestment;
  const additionalSIPPercent = (additionalSIPNeeded / monthlyInvestment) * 100;

  return {
    startNowYears,
    startNowCorpus: startNowResult.maturityAmount,
    startNowInvested: startNowResult.totalInvested,
    startNowReturns: startNowResult.totalReturns,

    startLaterYears,
    startLaterCorpus: startLaterResult.maturityAmount,
    startLaterInvested: startLaterResult.totalInvested,
    startLaterReturns: startLaterResult.totalReturns,

    costOfDelay,
    costPerDay: Math.round(costOfDelay / daysOfDelay),
    costPerMonth: Math.round(costOfDelay / monthsOfDelay),
    percentageLoss: (costOfDelay / startNowResult.maturityAmount) * 100,

    missedInvestment: monthlyInvestment * monthsOfDelay,

    requiredSIPToMatch: Math.round(requiredSIPToMatch),
    additionalSIPNeeded: Math.round(additionalSIPNeeded),
    additionalSIPPercent: Math.round(additionalSIPPercent),
  };
}

/**
 * Binary search to find the starting monthly SIP needed with step-up
 * to achieve a target corpus.
 */
function findRequiredStepUpSIP(
  targetCorpus: number,
  annualReturn: number,
  years: number,
  stepUpPercent: number
): number {
  let low = 1;
  let high = targetCorpus; // Upper bound (extremely conservative)
  const tolerance = 1; // Within ₹1 is close enough

  while (high - low > tolerance) {
    const mid = (low + high) / 2;
    const result = calculateStepUpSIP(mid, annualReturn, years, stepUpPercent);

    if (result.maturityAmount < targetCorpus) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return Math.ceil((low + high) / 2);
}

/**
 * Generate year-by-year breakdown comparing both scenarios.
 */
export function calculateCostOfDelayBreakdown(
  monthlyInvestment: number,
  annualReturn: number,
  currentAge: number,
  retirementAge: number,
  delayYears: number,
  options?: {
    stepUpEnabled?: boolean;
    stepUpPercent?: number;
    inflationRate?: number;
  }
): CostOfDelayBreakdown[] {
  const breakdown: CostOfDelayBreakdown[] = [];
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const stepUpRate = options?.stepUpEnabled ? (options.stepUpPercent || 10) / 100 : 0;

  let startNowValue = 0;
  let startLaterValue = 0;
  let startNowInvested = 0;
  let startLaterInvested = 0;
  let currentSIP = monthlyInvestment;
  let delayedSIP = monthlyInvestment;

  const totalYears = retirementAge - currentAge;

  for (let year = 1; year <= totalYears; year++) {
    const age = currentAge + year;
    const isInDelayPeriod = year <= delayYears;

    // Start Now scenario - always investing
    for (let month = 1; month <= 12; month++) {
      startNowValue = startNowValue * (1 + monthlyRate);
      startNowValue += currentSIP * (1 + monthlyRate);
      startNowInvested += currentSIP;
    }

    // Start Later scenario - only invest after delay period
    if (!isInDelayPeriod) {
      for (let month = 1; month <= 12; month++) {
        startLaterValue = startLaterValue * (1 + monthlyRate);
        startLaterValue += delayedSIP * (1 + monthlyRate);
        startLaterInvested += delayedSIP;
      }
      // Step up for delayed investor (if enabled)
      if (stepUpRate > 0 && year < totalYears) {
        delayedSIP = delayedSIP * (1 + stepUpRate);
      }
    } else {
      // During delay, the delayed investor's corpus is still 0
      // but we need to compound any existing amount (which is 0)
      for (let month = 1; month <= 12; month++) {
        startLaterValue = startLaterValue * (1 + monthlyRate);
      }
    }

    // Step up for immediate investor (if enabled)
    if (stepUpRate > 0 && year < totalYears) {
      currentSIP = currentSIP * (1 + stepUpRate);
    }

    breakdown.push({
      year,
      age,
      startNowValue: Math.round(startNowValue),
      startLaterValue: Math.round(startLaterValue),
      cumulativeGap: Math.round(startNowValue - startLaterValue),
      startNowInvested: Math.round(startNowInvested),
      startLaterInvested: Math.round(startLaterInvested),
    });
  }

  return breakdown;
}

/**
 * Calculate inflation-adjusted cost of delay.
 */
export function getInflationAdjustedCost(
  costOfDelay: number,
  years: number,
  inflationRate: number
): number {
  return costOfDelay / Math.pow(1 + inflationRate / 100, years);
}

/**
 * Calculate real (inflation-adjusted) rate of return.
 */
export function getRealReturnRate(
  nominalRate: number,
  inflationRate: number
): number {
  return ((1 + nominalRate / 100) / (1 + inflationRate / 100) - 1) * 100;
}
