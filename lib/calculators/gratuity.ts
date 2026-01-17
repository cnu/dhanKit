export interface GratuityResult {
  gratuityAmount: number;
  lastDrawnSalary: number;
  yearsOfService: number;
  isEligible: boolean;
}

/**
 * Calculate Gratuity as per the Payment of Gratuity Act, 1972.
 *
 * Formula: Gratuity = (15 × Last Drawn Salary × Years of Service) / 26
 *
 * Where:
 *   - Last Drawn Salary = Basic Pay + Dearness Allowance (DA)
 *   - Years of Service = Completed years (minimum 5 years for eligibility)
 *   - 15 = Number of days of salary for each year of service
 *   - 26 = Working days in a month (as per the Act)
 *
 * Note: The maximum gratuity under the Act is ₹20,00,000 (as of 2019 amendment).
 * However, some organizations may pay more as per their policy.
 */
export function calculateGratuity(
  lastDrawnSalary: number,
  yearsOfService: number
): GratuityResult {
  const isEligible = yearsOfService >= 5;

  // Gratuity formula: (15 × salary × years) / 26
  const gratuityAmount = Math.round((15 * lastDrawnSalary * yearsOfService) / 26);

  return {
    gratuityAmount,
    lastDrawnSalary,
    yearsOfService,
    isEligible,
  };
}

/**
 * Calculate the maximum gratuity cap as per the Payment of Gratuity Act.
 * As of the 2019 amendment, the maximum gratuity is ₹20,00,000.
 */
export const GRATUITY_CAP = 2000000;

/**
 * Calculate gratuity with the statutory cap applied.
 */
export function calculateGratuityWithCap(
  lastDrawnSalary: number,
  yearsOfService: number
): GratuityResult & { isCapped: boolean; uncappedAmount: number } {
  const result = calculateGratuity(lastDrawnSalary, yearsOfService);
  const isCapped = result.gratuityAmount > GRATUITY_CAP;

  return {
    ...result,
    gratuityAmount: isCapped ? GRATUITY_CAP : result.gratuityAmount,
    isCapped,
    uncappedAmount: result.gratuityAmount,
  };
}
