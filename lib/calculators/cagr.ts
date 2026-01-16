export interface CAGRResult {
  cagr: number;
  absoluteReturns: number;
  absoluteReturnsPercent: number;
}

/**
 * Calculate Compound Annual Growth Rate (CAGR).
 *
 * Formula: CAGR = (Final Value / Initial Value)^(1/n) - 1
 * Where:
 *   n = Number of years
 *
 * CAGR represents the annualized rate of return that would
 * take an investment from its initial to final value over
 * a given period, assuming profits are reinvested.
 */
export function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): CAGRResult {
  // Handle edge cases
  if (initialValue <= 0 || years <= 0) {
    return {
      cagr: 0,
      absoluteReturns: 0,
      absoluteReturnsPercent: 0,
    };
  }

  const absoluteReturns = finalValue - initialValue;
  const absoluteReturnsPercent = (absoluteReturns / initialValue) * 100;

  // CAGR = (FV/IV)^(1/n) - 1
  const cagr = (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100;

  return {
    cagr: Math.round(cagr * 100) / 100, // Round to 2 decimal places
    absoluteReturns: Math.round(absoluteReturns),
    absoluteReturnsPercent: Math.round(absoluteReturnsPercent * 100) / 100,
  };
}

export interface CAGRYearlyBreakdown {
  year: number;
  value: number;
  yearlyGrowth: number;
}

/**
 * Generate year-by-year breakdown showing how an investment
 * would grow at the calculated CAGR.
 */
export function calculateCAGRYearlyBreakdown(
  initialValue: number,
  cagr: number,
  years: number
): CAGRYearlyBreakdown[] {
  const breakdown: CAGRYearlyBreakdown[] = [];
  const rate = cagr / 100;

  // Year 0 - starting point
  breakdown.push({
    year: 0,
    value: initialValue,
    yearlyGrowth: 0,
  });

  for (let year = 1; year <= years; year++) {
    const previousValue = breakdown[year - 1].value;
    const currentValue = initialValue * Math.pow(1 + rate, year);
    const yearlyGrowth = currentValue - previousValue;

    breakdown.push({
      year,
      value: Math.round(currentValue),
      yearlyGrowth: Math.round(yearlyGrowth),
    });
  }

  return breakdown;
}
