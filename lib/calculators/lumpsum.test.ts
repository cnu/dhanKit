import {
  calculateLumpsum,
  calculateLumpsumYearlyBreakdown,
  LumpsumResult,
  LumpsumYearlyBreakdown,
} from './lumpsum';

describe('Lumpsum Calculator', () => {
  describe('calculateLumpsum', () => {
    it('should calculate basic compound interest correctly', () => {
      // ₹1,00,000 at 12% for 10 years
      // Formula: 100000 × (1.12)^10 = 310,584.82
      const result = calculateLumpsum(100000, 12, 10);

      expect(result.totalInvested).toBe(100000);
      expect(result.finalAmount).toBe(310585); // Rounded
      expect(result.totalReturns).toBe(210585);
    });

    it('should double money at ~7.2% in 10 years (Rule of 72)', () => {
      const result = calculateLumpsum(100000, 7.2, 10);

      // Rule of 72: Money doubles in 72/r years
      expect(result.finalAmount).toBeGreaterThan(199000);
      expect(result.finalAmount).toBeLessThan(201000);
    });

    it('should handle 1 year investment', () => {
      const result = calculateLumpsum(100000, 10, 1);

      expect(result.finalAmount).toBe(110000);
      expect(result.totalReturns).toBe(10000);
    });

    it('should handle high returns correctly', () => {
      const result = calculateLumpsum(100000, 25, 20);

      // Should grow significantly
      expect(result.finalAmount).toBeGreaterThan(8000000);
    });

    it('should handle 0% return', () => {
      const result = calculateLumpsum(100000, 0, 10);

      expect(result.finalAmount).toBe(100000);
      expect(result.totalReturns).toBe(0);
    });

    it('should return rounded values', () => {
      const result = calculateLumpsum(123456, 8.5, 7);

      expect(Number.isInteger(result.finalAmount)).toBe(true);
      expect(Number.isInteger(result.totalReturns)).toBe(true);
    });

    it('should preserve principal in totalInvested', () => {
      const principal = 500000;
      const result = calculateLumpsum(principal, 10, 5);

      expect(result.totalInvested).toBe(principal);
    });

    it('should satisfy returns = finalAmount - invested', () => {
      const result = calculateLumpsum(100000, 12, 10);

      expect(result.totalReturns).toBe(result.finalAmount - result.totalInvested);
    });

    it('should calculate correctly for fractional rates', () => {
      const result = calculateLumpsum(100000, 7.5, 5);

      // 100000 × (1.075)^5 = 143,562.93
      expect(result.finalAmount).toBe(143563);
    });

    it('should handle large principal amounts', () => {
      const result = calculateLumpsum(10000000, 8, 15);

      expect(result.finalAmount).toBeGreaterThan(31000000);
    });
  });

  describe('calculateLumpsumYearlyBreakdown', () => {
    it('should return correct number of entries', () => {
      const breakdown = calculateLumpsumYearlyBreakdown(100000, 12, 5);

      expect(breakdown.length).toBe(5);
      expect(breakdown[0].year).toBe(1);
      expect(breakdown[4].year).toBe(5);
    });

    it('should have increasing total value each year', () => {
      const breakdown = calculateLumpsumYearlyBreakdown(100000, 12, 10);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].totalValue).toBeGreaterThan(breakdown[i - 1].totalValue);
      }
    });

    it('should have constant invested amount', () => {
      const breakdown = calculateLumpsumYearlyBreakdown(100000, 12, 10);

      breakdown.forEach((entry) => {
        expect(entry.invested).toBe(100000);
      });
    });

    it('should match final year to calculateLumpsum result', () => {
      const breakdown = calculateLumpsumYearlyBreakdown(100000, 12, 10);
      const lumpsumResult = calculateLumpsum(100000, 12, 10);

      const lastYear = breakdown[breakdown.length - 1];
      expect(lastYear.totalValue).toBe(lumpsumResult.finalAmount);
      expect(lastYear.interest).toBe(lumpsumResult.totalReturns);
    });

    it('should have interest equal to totalValue minus invested', () => {
      const breakdown = calculateLumpsumYearlyBreakdown(100000, 12, 5);

      breakdown.forEach((entry) => {
        expect(Math.abs(entry.interest - (entry.totalValue - entry.invested))).toBeLessThanOrEqual(1);
      });
    });

    it('should show compound growth pattern', () => {
      const breakdown = calculateLumpsumYearlyBreakdown(100000, 10, 5);

      // Year 1: 110000 (10% gain)
      // Year 2: 121000 (10% of 110000 = 11000 gain)
      // etc. - interest should grow each year
      const yearlyGains: number[] = [];
      yearlyGains.push(breakdown[0].interest);
      for (let i = 1; i < breakdown.length; i++) {
        yearlyGains.push(breakdown[i].interest - breakdown[i - 1].interest);
      }

      // Each year's gain should be larger than the previous
      for (let i = 1; i < yearlyGains.length; i++) {
        expect(yearlyGains[i]).toBeGreaterThan(yearlyGains[i - 1]);
      }
    });

    it('should return rounded values', () => {
      const breakdown = calculateLumpsumYearlyBreakdown(123456, 8.7, 7);

      breakdown.forEach((entry) => {
        expect(Number.isInteger(entry.interest)).toBe(true);
        expect(Number.isInteger(entry.totalValue)).toBe(true);
      });
    });

    it('should handle single year', () => {
      const breakdown = calculateLumpsumYearlyBreakdown(100000, 10, 1);

      expect(breakdown.length).toBe(1);
      expect(breakdown[0].year).toBe(1);
      expect(breakdown[0].totalValue).toBe(110000);
    });
  });
});
