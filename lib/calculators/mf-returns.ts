export interface MFReturnsResult {
  absoluteReturns: number; // Percentage gain/loss
  cagr: number; // Compound Annual Growth Rate
  totalGain: number; // Total gain in rupees (when units provided)
  currentValue: number; // Current value of investment
  investedAmount: number; // Total invested amount
}

/**
 * Calculate Mutual Fund Returns from NAV values.
 *
 * Formulas:
 *   Absolute Returns = ((Current NAV - Purchase NAV) / Purchase NAV) × 100
 *   CAGR = ((Current NAV / Purchase NAV)^(1/years) - 1) × 100
 *
 * For periods less than 1 year, we calculate:
 *   - Absolute returns (always valid)
 *   - Annualized returns (CAGR extrapolated, with caveat that it's indicative)
 *
 * @param purchaseNAV - NAV at which units were purchased
 * @param currentNAV - Current NAV of the fund
 * @param holdingYears - Number of years held (can be decimal, e.g., 2.5)
 * @param units - Optional: Number of units held (for calculating rupee gain)
 */
export function calculateMFReturns(
  purchaseNAV: number,
  currentNAV: number,
  holdingYears: number,
  units?: number
): MFReturnsResult {
  // Handle edge cases
  if (purchaseNAV <= 0 || holdingYears <= 0) {
    return {
      absoluteReturns: 0,
      cagr: 0,
      totalGain: 0,
      currentValue: 0,
      investedAmount: 0,
    };
  }

  // Calculate absolute returns (percentage)
  const absoluteReturns = ((currentNAV - purchaseNAV) / purchaseNAV) * 100;

  // Calculate CAGR
  // CAGR = (Current NAV / Purchase NAV)^(1/years) - 1
  const cagr = (Math.pow(currentNAV / purchaseNAV, 1 / holdingYears) - 1) * 100;

  // Calculate rupee values if units are provided
  const investedAmount = units ? purchaseNAV * units : 0;
  const currentValue = units ? currentNAV * units : 0;
  const totalGain = currentValue - investedAmount;

  return {
    absoluteReturns: Math.round(absoluteReturns * 100) / 100, // 2 decimal places
    cagr: Math.round(cagr * 100) / 100,
    totalGain: Math.round(totalGain),
    currentValue: Math.round(currentValue),
    investedAmount: Math.round(investedAmount),
  };
}

/**
 * Convert years and months to decimal years.
 * E.g., 2 years 6 months = 2.5 years
 */
export function toDecimalYears(years: number, months: number): number {
  return years + months / 12;
}

/**
 * Validate that holding period is reasonable.
 * Returns true if valid, false otherwise.
 */
export function isValidHoldingPeriod(years: number, months: number): boolean {
  const totalMonths = years * 12 + months;
  return totalMonths > 0;
}
