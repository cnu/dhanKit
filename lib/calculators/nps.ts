export interface NPSResult {
  totalCorpus: number;
  lumpsumWithdrawal: number;
  annuityInvestment: number;
  monthlyPension: number;
  totalInvested: number;
  totalReturns: number;
  yearsToRetirement: number;
  annuityPercent: number; // The annuity percentage used (40-100)
}

export interface NPSYearlyBreakdown {
  year: number;
  age: number;
  invested: number;
  interest: number;
  totalValue: number;
}

const RETIREMENT_AGE = 60;

/**
 * Calculate NPS (National Pension System) returns.
 *
 * NPS is a government-backed pension scheme where:
 * - Contributions are invested until retirement (age 60)
 * - At maturity: Up to 60% can be withdrawn tax-free as lumpsum
 * - Minimum 40% must be used to purchase an annuity for monthly pension
 * - Users can choose to allocate more to annuity (40-100%) for higher pension
 *
 * Formula for corpus accumulation (SIP formula):
 *   M = P × ((1 + r)^n – 1) / r × (1 + r)
 * Where:
 *   M = Maturity amount (total corpus)
 *   P = Monthly investment
 *   r = Effective monthly rate = (1 + annual_rate)^(1/12) - 1
 *   n = Number of months until retirement
 *
 * Monthly pension calculation:
 *   Pension = (Annuity Investment × Annuity Rate / 100) / 12
 *
 * @param annuityPercent - Percentage of corpus to allocate to annuity (40-100, default 40)
 */
export function calculateNPS(
  currentAge: number,
  monthlyInvestment: number,
  expectedReturn: number,
  annuityRate: number,
  annuityPercent: number = 40
): NPSResult {
  const yearsToRetirement = RETIREMENT_AGE - currentAge;
  const months = yearsToRetirement * 12;

  // Convert annual rate to effective monthly rate
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;

  // Calculate corpus using SIP formula (annuity due - payment at start of period)
  const totalCorpus =
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  // Configurable split: annuityPercent for annuity, rest for lumpsum
  // Minimum 40% must go to annuity, maximum 60% can be withdrawn as lumpsum
  const clampedAnnuityPercent = Math.min(100, Math.max(40, annuityPercent));
  const lumpsumPercent = 100 - clampedAnnuityPercent;

  const lumpsumWithdrawal = totalCorpus * (lumpsumPercent / 100);
  const annuityInvestment = totalCorpus * (clampedAnnuityPercent / 100);

  // Monthly pension from annuity
  const monthlyPension = (annuityInvestment * (annuityRate / 100)) / 12;

  const totalInvested = monthlyInvestment * months;
  const totalReturns = totalCorpus - totalInvested;

  return {
    totalCorpus: Math.round(totalCorpus),
    lumpsumWithdrawal: Math.round(lumpsumWithdrawal),
    annuityInvestment: Math.round(annuityInvestment),
    monthlyPension: Math.round(monthlyPension),
    totalInvested,
    totalReturns: Math.round(totalReturns),
    yearsToRetirement,
    annuityPercent: clampedAnnuityPercent,
  };
}

/**
 * Generate year-by-year breakdown of NPS corpus growth.
 * Includes age column to help visualize retirement timeline.
 */
export function calculateNPSYearlyBreakdown(
  currentAge: number,
  monthlyInvestment: number,
  expectedReturn: number
): NPSYearlyBreakdown[] {
  const breakdown: NPSYearlyBreakdown[] = [];
  const yearsToRetirement = RETIREMENT_AGE - currentAge;

  // Convert annual rate to effective monthly rate
  const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;

  for (let year = 1; year <= yearsToRetirement; year++) {
    const months = year * 12;
    const totalValue =
      monthlyInvestment *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);
    const invested = monthlyInvestment * months;
    const interest = totalValue - invested;

    breakdown.push({
      year,
      age: currentAge + year,
      invested,
      interest: Math.round(interest),
      totalValue: Math.round(totalValue),
    });
  }

  return breakdown;
}
