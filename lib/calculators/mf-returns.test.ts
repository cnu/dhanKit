import {
  calculateMFReturns,
  toDecimalYears,
  isValidHoldingPeriod,
} from "./mf-returns";

describe("MF Returns Calculator", () => {
  describe("calculateMFReturns", () => {
    it("should calculate basic returns correctly", () => {
      // NAV 100 -> 150 in 3 years = 50% absolute, ~14.47% CAGR
      const result = calculateMFReturns(100, 150, 3);

      expect(result.absoluteReturns).toBe(50);
      expect(result.cagr).toBeCloseTo(14.47, 1);
    });

    it("should calculate returns for doubling NAV", () => {
      // NAV 100 -> 200 in 5 years = 100% absolute, ~14.87% CAGR
      const result = calculateMFReturns(100, 200, 5);

      expect(result.absoluteReturns).toBe(100);
      expect(result.cagr).toBeCloseTo(14.87, 1);
    });

    it("should handle negative returns (loss)", () => {
      // NAV 100 -> 80 in 2 years = -20% absolute
      const result = calculateMFReturns(100, 80, 2);

      expect(result.absoluteReturns).toBe(-20);
      expect(result.cagr).toBeLessThan(0);
    });

    it("should handle no change in NAV", () => {
      const result = calculateMFReturns(100, 100, 3);

      expect(result.absoluteReturns).toBe(0);
      expect(result.cagr).toBe(0);
    });

    it("should handle fractional NAV values", () => {
      // NAV 45.67 -> 78.90 in 2 years
      const result = calculateMFReturns(45.67, 78.9, 2);

      const expectedAbsolute = ((78.9 - 45.67) / 45.67) * 100;
      expect(result.absoluteReturns).toBeCloseTo(expectedAbsolute, 1);
    });

    it("should handle single year holding period", () => {
      // NAV 100 -> 112 in 1 year = 12% absolute = 12% CAGR
      const result = calculateMFReturns(100, 112, 1);

      expect(result.absoluteReturns).toBe(12);
      expect(result.cagr).toBe(12);
    });

    it("should handle decimal holding periods", () => {
      // NAV 100 -> 150 in 2.5 years
      const result = calculateMFReturns(100, 150, 2.5);

      const expectedCAGR = (Math.pow(150 / 100, 1 / 2.5) - 1) * 100;
      expect(result.cagr).toBeCloseTo(expectedCAGR, 1);
    });

    it("should calculate rupee values when units provided", () => {
      // NAV 100 -> 150, 1000 units
      // Invested: 100 * 1000 = 100000
      // Current: 150 * 1000 = 150000
      // Gain: 50000
      const result = calculateMFReturns(100, 150, 3, 1000);

      expect(result.investedAmount).toBe(100000);
      expect(result.currentValue).toBe(150000);
      expect(result.totalGain).toBe(50000);
    });

    it("should handle fractional units", () => {
      // NAV 100 -> 150, 500.5 units
      const result = calculateMFReturns(100, 150, 3, 500.5);

      expect(result.investedAmount).toBe(50050);
      expect(result.currentValue).toBe(75075);
      expect(result.totalGain).toBe(25025);
    });

    it("should return 0 for units when not provided", () => {
      const result = calculateMFReturns(100, 150, 3);

      expect(result.investedAmount).toBe(0);
      expect(result.currentValue).toBe(0);
      expect(result.totalGain).toBe(0);
    });

    it("should handle edge case of zero purchase NAV", () => {
      const result = calculateMFReturns(0, 150, 3);

      expect(result.absoluteReturns).toBe(0);
      expect(result.cagr).toBe(0);
    });

    it("should handle edge case of zero holding period", () => {
      const result = calculateMFReturns(100, 150, 0);

      expect(result.absoluteReturns).toBe(0);
      expect(result.cagr).toBe(0);
    });

    it("should return rounded values", () => {
      const result = calculateMFReturns(123.45, 234.56, 2.5);

      // Check that values are rounded to 2 decimal places
      const cagrDecimals = result.cagr.toString().split(".")[1]?.length || 0;
      const absDecimals = result.absoluteReturns.toString().split(".")[1]?.length || 0;

      expect(cagrDecimals).toBeLessThanOrEqual(2);
      expect(absDecimals).toBeLessThanOrEqual(2);
    });

    it("should handle very small NAV changes", () => {
      // NAV 100 -> 100.01 in 1 year
      const result = calculateMFReturns(100, 100.01, 1);

      expect(result.absoluteReturns).toBe(0.01);
      expect(result.cagr).toBe(0.01);
    });

    it("should handle loss scenario with units", () => {
      // NAV 100 -> 80, 1000 units = ₹20,000 loss
      const result = calculateMFReturns(100, 80, 2, 1000);

      expect(result.investedAmount).toBe(100000);
      expect(result.currentValue).toBe(80000);
      expect(result.totalGain).toBe(-20000);
    });

    it("should handle periods less than 1 year", () => {
      // NAV 100 -> 110 in 6 months (0.5 years)
      const result = calculateMFReturns(100, 110, 0.5);

      expect(result.absoluteReturns).toBe(10);
      // CAGR should be higher for shorter period
      expect(result.cagr).toBeGreaterThan(10);
    });

    it("should match CAGR inverse calculation", () => {
      // If CAGR is 15% for 5 years, NAV should grow by (1.15)^5
      const initialNAV = 100;
      const cagr = 15;
      const years = 5;
      const expectedFinalNAV = initialNAV * Math.pow(1 + cagr / 100, years);

      const result = calculateMFReturns(initialNAV, expectedFinalNAV, years);

      expect(result.cagr).toBeCloseTo(cagr, 0);
    });
  });

  describe("toDecimalYears", () => {
    it("should convert years only", () => {
      expect(toDecimalYears(3, 0)).toBe(3);
    });

    it("should convert months only", () => {
      expect(toDecimalYears(0, 6)).toBe(0.5);
    });

    it("should convert years and months", () => {
      expect(toDecimalYears(2, 6)).toBe(2.5);
    });

    it("should handle 11 months", () => {
      expect(toDecimalYears(0, 11)).toBeCloseTo(0.917, 2);
    });

    it("should handle 1 month", () => {
      expect(toDecimalYears(0, 1)).toBeCloseTo(0.083, 2);
    });

    it("should handle full year in months", () => {
      expect(toDecimalYears(0, 12)).toBe(1);
    });
  });

  describe("isValidHoldingPeriod", () => {
    it("should return true for valid periods", () => {
      expect(isValidHoldingPeriod(1, 0)).toBe(true);
      expect(isValidHoldingPeriod(0, 1)).toBe(true);
      expect(isValidHoldingPeriod(2, 6)).toBe(true);
    });

    it("should return false for zero holding period", () => {
      expect(isValidHoldingPeriod(0, 0)).toBe(false);
    });

    it("should return true for years only", () => {
      expect(isValidHoldingPeriod(5, 0)).toBe(true);
    });

    it("should return true for months only", () => {
      expect(isValidHoldingPeriod(0, 3)).toBe(true);
    });
  });
});
