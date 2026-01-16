import {
  calculateCAGR,
  calculateCAGRYearlyBreakdown,
  CAGRResult,
  CAGRYearlyBreakdown,
} from "./cagr";

describe("CAGR Calculator", () => {
  describe("calculateCAGR", () => {
    it("should calculate basic CAGR correctly", () => {
      // ₹1,00,000 growing to ₹2,00,000 in 5 years
      // CAGR = (200000/100000)^(1/5) - 1 = 14.87%
      const result = calculateCAGR(100000, 200000, 5);

      expect(result.cagr).toBe(14.87);
      expect(result.absoluteReturns).toBe(100000);
      expect(result.absoluteReturnsPercent).toBe(100);
    });

    it("should calculate CAGR for doubling investment (Rule of 72)", () => {
      // Rule of 72: Money doubles at ~7.2% in 10 years
      const result = calculateCAGR(100000, 200000, 10);

      expect(result.cagr).toBeCloseTo(7.18, 1);
    });

    it("should handle tripling investment", () => {
      // ₹1,00,000 growing to ₹3,00,000 in 5 years
      // CAGR = (300000/100000)^(1/5) - 1 = 24.57%
      const result = calculateCAGR(100000, 300000, 5);

      expect(result.cagr).toBeCloseTo(24.57, 1);
      expect(result.absoluteReturnsPercent).toBe(200);
    });

    it("should handle negative returns (loss)", () => {
      // ₹1,00,000 declining to ₹50,000 in 5 years
      const result = calculateCAGR(100000, 50000, 5);

      expect(result.cagr).toBeLessThan(0);
      expect(result.absoluteReturns).toBe(-50000);
      expect(result.absoluteReturnsPercent).toBe(-50);
    });

    it("should return 0% for no change", () => {
      const result = calculateCAGR(100000, 100000, 5);

      expect(result.cagr).toBe(0);
      expect(result.absoluteReturns).toBe(0);
      expect(result.absoluteReturnsPercent).toBe(0);
    });

    it("should handle single year calculation", () => {
      // 10% return in 1 year = 10% CAGR
      const result = calculateCAGR(100000, 110000, 1);

      expect(result.cagr).toBe(10);
      expect(result.absoluteReturnsPercent).toBe(10);
    });

    it("should handle long time periods", () => {
      // ₹1,00,000 growing to ₹10,00,000 in 30 years (10x)
      const result = calculateCAGR(100000, 1000000, 30);

      expect(result.cagr).toBeCloseTo(8.01, 1);
    });

    it("should handle edge case of zero initial value", () => {
      const result = calculateCAGR(0, 100000, 5);

      expect(result.cagr).toBe(0);
      expect(result.absoluteReturns).toBe(0);
      expect(result.absoluteReturnsPercent).toBe(0);
    });

    it("should handle edge case of zero years", () => {
      const result = calculateCAGR(100000, 200000, 0);

      expect(result.cagr).toBe(0);
    });

    it("should return rounded values to 2 decimal places", () => {
      const result = calculateCAGR(123456, 234567, 7);

      // Check that CAGR is rounded to 2 decimal places
      const decimalPlaces = result.cagr.toString().split(".")[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it("should calculate correct absolute returns", () => {
      const result = calculateCAGR(150000, 375000, 10);

      expect(result.absoluteReturns).toBe(225000);
      expect(result.absoluteReturnsPercent).toBe(150);
    });

    it("should match inverse of lumpsum calculation", () => {
      // If we invest 100000 at 12% for 10 years, we get ~310585
      // CAGR of 100000 -> 310585 in 10 years should be ~12%
      const finalValue = 100000 * Math.pow(1.12, 10);
      const result = calculateCAGR(100000, Math.round(finalValue), 10);

      expect(result.cagr).toBeCloseTo(12, 0);
    });
  });

  describe("calculateCAGRYearlyBreakdown", () => {
    it("should return correct number of entries including year 0", () => {
      const breakdown = calculateCAGRYearlyBreakdown(100000, 10, 5);

      expect(breakdown.length).toBe(6); // Year 0 through Year 5
      expect(breakdown[0].year).toBe(0);
      expect(breakdown[5].year).toBe(5);
    });

    it("should start with initial value at year 0", () => {
      const breakdown = calculateCAGRYearlyBreakdown(100000, 10, 5);

      expect(breakdown[0].value).toBe(100000);
      expect(breakdown[0].yearlyGrowth).toBe(0);
    });

    it("should show compound growth at given CAGR", () => {
      const breakdown = calculateCAGRYearlyBreakdown(100000, 10, 3);

      // Year 0: 100000
      // Year 1: 100000 * 1.10 = 110000
      // Year 2: 100000 * 1.10^2 = 121000
      // Year 3: 100000 * 1.10^3 = 133100
      expect(breakdown[0].value).toBe(100000);
      expect(breakdown[1].value).toBe(110000);
      expect(breakdown[2].value).toBe(121000);
      expect(breakdown[3].value).toBe(133100);
    });

    it("should calculate yearly growth correctly", () => {
      const breakdown = calculateCAGRYearlyBreakdown(100000, 10, 3);

      // Year 1 growth: 110000 - 100000 = 10000
      // Year 2 growth: 121000 - 110000 = 11000
      // Year 3 growth: 133100 - 121000 = 12100
      expect(breakdown[1].yearlyGrowth).toBe(10000);
      expect(breakdown[2].yearlyGrowth).toBe(11000);
      expect(breakdown[3].yearlyGrowth).toBe(12100);
    });

    it("should have increasing value each year for positive CAGR", () => {
      const breakdown = calculateCAGRYearlyBreakdown(100000, 15, 10);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].value).toBeGreaterThan(breakdown[i - 1].value);
      }
    });

    it("should have decreasing value each year for negative CAGR", () => {
      const breakdown = calculateCAGRYearlyBreakdown(100000, -10, 5);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].value).toBeLessThan(breakdown[i - 1].value);
      }
    });

    it("should return rounded values", () => {
      const breakdown = calculateCAGRYearlyBreakdown(123456, 8.7, 7);

      breakdown.forEach((entry) => {
        expect(Number.isInteger(entry.value)).toBe(true);
        expect(Number.isInteger(entry.yearlyGrowth)).toBe(true);
      });
    });

    it("should handle 0% CAGR", () => {
      const breakdown = calculateCAGRYearlyBreakdown(100000, 0, 5);

      breakdown.forEach((entry) => {
        expect(entry.value).toBe(100000);
      });
      // Yearly growth should be 0 for all years except potentially year 0
      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].yearlyGrowth).toBe(0);
      }
    });

    it("should handle single year breakdown", () => {
      const breakdown = calculateCAGRYearlyBreakdown(100000, 10, 1);

      expect(breakdown.length).toBe(2); // Year 0 and Year 1
      expect(breakdown[0].value).toBe(100000);
      expect(breakdown[1].value).toBe(110000);
    });

    it("should match final value to compound interest formula", () => {
      const initialValue = 100000;
      const cagr = 12;
      const years = 10;

      const breakdown = calculateCAGRYearlyBreakdown(initialValue, cagr, years);
      const expectedFinalValue = Math.round(
        initialValue * Math.pow(1 + cagr / 100, years)
      );

      expect(breakdown[years].value).toBe(expectedFinalValue);
    });
  });
});
