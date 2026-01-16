import {
  calculateFD,
  calculateFDSimple,
  calculateFDMonthlyBreakdown,
  calculateFDSimpleMonthlyBreakdown,
  getCompoundingLabel,
  CompoundingFrequency,
  FDResult,
  FDMonthlyBreakdown,
} from './fd';

describe('FD Calculator', () => {
  describe('calculateFD (compound interest)', () => {
    it('should calculate quarterly compounding correctly', () => {
      // ₹1,00,000 at 7% for 12 months with quarterly compounding
      // A = P(1 + r/n)^(nt) = 100000 × (1 + 0.07/4)^(4×1) = 107,186
      const result = calculateFD(100000, 7, 12, 'quarterly');

      expect(result.totalInvested).toBe(100000);
      expect(result.maturityAmount).toBe(107186);
      expect(result.totalInterest).toBe(7186);
    });

    it('should calculate monthly compounding correctly', () => {
      const result = calculateFD(100000, 7, 12, 'monthly');

      // Monthly compounding should give slightly higher returns than quarterly
      expect(result.maturityAmount).toBeGreaterThan(107186);
      expect(result.totalInterest).toBeGreaterThan(7186);
    });

    it('should calculate yearly compounding correctly', () => {
      const result = calculateFD(100000, 7, 12, 'yearly');

      // Yearly compounding = simple A = P(1 + r)^t for whole years
      expect(result.maturityAmount).toBe(107000);
      expect(result.totalInterest).toBe(7000);
    });

    it('should calculate half-yearly compounding correctly', () => {
      const result = calculateFD(100000, 7, 12, 'half-yearly');

      // A = 100000 × (1 + 0.07/2)^2 = 107,122.5 → rounds to 107122 or 107123
      expect(result.maturityAmount).toBeGreaterThanOrEqual(107122);
      expect(result.maturityAmount).toBeLessThanOrEqual(107123);
    });

    it('should use quarterly compounding by default', () => {
      const resultDefault = calculateFD(100000, 7, 12);
      const resultQuarterly = calculateFD(100000, 7, 12, 'quarterly');

      expect(resultDefault.maturityAmount).toBe(resultQuarterly.maturityAmount);
    });

    it('should handle partial year correctly', () => {
      // 6 months = 0.5 years
      const result = calculateFD(100000, 8, 6, 'quarterly');

      // A = 100000 × (1 + 0.08/4)^(4×0.5) = 100000 × (1.02)^2 = 104,040
      expect(result.maturityAmount).toBe(104040);
    });

    it('should calculate effective rate correctly', () => {
      const result = calculateFD(100000, 8, 12, 'quarterly');

      // Effective rate = (1 + 0.08/4)^4 - 1 = 8.24%
      expect(result.effectiveRate).toBeCloseTo(8.24, 1);
    });

    it('should show higher effective rate with more frequent compounding', () => {
      const monthly = calculateFD(100000, 8, 12, 'monthly');
      const quarterly = calculateFD(100000, 8, 12, 'quarterly');
      const yearly = calculateFD(100000, 8, 12, 'yearly');

      expect(monthly.effectiveRate).toBeGreaterThan(quarterly.effectiveRate);
      expect(quarterly.effectiveRate).toBeGreaterThan(yearly.effectiveRate);
      expect(yearly.effectiveRate).toBe(8); // Same as nominal for yearly
    });

    it('should return rounded values', () => {
      const result = calculateFD(123456, 7.25, 18, 'quarterly');

      expect(Number.isInteger(result.maturityAmount)).toBe(true);
      expect(Number.isInteger(result.totalInterest)).toBe(true);
    });

    it('should handle large principal', () => {
      const result = calculateFD(5000000, 7.5, 60, 'quarterly');

      expect(result.maturityAmount).toBeGreaterThan(7000000);
    });

    it('should handle 5-year FD correctly', () => {
      // Common FD tenure
      const result = calculateFD(100000, 7, 60, 'quarterly');

      // Expected: 100000 × (1 + 0.07/4)^20 = 141,478
      expect(result.maturityAmount).toBeGreaterThan(141000);
      expect(result.maturityAmount).toBeLessThan(142000);
    });
  });

  describe('calculateFDSimple', () => {
    it('should calculate simple interest correctly', () => {
      // ₹1,00,000 at 7% for 12 months
      // A = P(1 + rt) = 100000 × (1 + 0.07 × 1) = 107,000
      const result = calculateFDSimple(100000, 7, 12);

      expect(result.maturityAmount).toBe(107000);
      expect(result.totalInterest).toBe(7000);
    });

    it('should be less than compound interest for same parameters', () => {
      const simple = calculateFDSimple(100000, 7, 24);
      const compound = calculateFD(100000, 7, 24, 'quarterly');

      expect(simple.maturityAmount).toBeLessThan(compound.maturityAmount);
    });

    it('should handle partial year correctly', () => {
      // 6 months = 0.5 years
      // A = 100000 × (1 + 0.08 × 0.5) = 104,000
      const result = calculateFDSimple(100000, 8, 6);

      expect(result.maturityAmount).toBe(104000);
      expect(result.totalInterest).toBe(4000);
    });

    it('should have effective rate equal to nominal rate', () => {
      const result = calculateFDSimple(100000, 7.5, 12);

      expect(result.effectiveRate).toBe(7.5);
    });

    it('should return rounded values', () => {
      const result = calculateFDSimple(123456, 7.25, 18);

      expect(Number.isInteger(result.maturityAmount)).toBe(true);
      expect(Number.isInteger(result.totalInterest)).toBe(true);
    });

    it('should scale linearly with time', () => {
      const oneYear = calculateFDSimple(100000, 10, 12);
      const twoYears = calculateFDSimple(100000, 10, 24);

      // Simple interest doubles in twice the time
      expect(twoYears.totalInterest).toBe(oneYear.totalInterest * 2);
    });
  });

  describe('calculateFDMonthlyBreakdown', () => {
    it('should return entries at quarterly intervals', () => {
      const breakdown = calculateFDMonthlyBreakdown(100000, 7, 12, 'quarterly');

      // 12 months / 3 = 4 quarterly entries
      expect(breakdown.length).toBe(4);
      expect(breakdown[0].month).toBe(3);
      expect(breakdown[1].month).toBe(6);
      expect(breakdown[2].month).toBe(9);
      expect(breakdown[3].month).toBe(12);
    });

    it('should include final month if not on quarter boundary', () => {
      const breakdown = calculateFDMonthlyBreakdown(100000, 7, 14, 'quarterly');

      // Should include months 3, 6, 9, 12, and 14
      expect(breakdown.length).toBe(5);
      expect(breakdown[breakdown.length - 1].month).toBe(14);
    });

    it('should have increasing total values', () => {
      const breakdown = calculateFDMonthlyBreakdown(100000, 7, 24, 'quarterly');

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].totalValue).toBeGreaterThan(breakdown[i - 1].totalValue);
      }
    });

    it('should have constant principal', () => {
      const breakdown = calculateFDMonthlyBreakdown(100000, 7, 12, 'quarterly');

      breakdown.forEach((entry) => {
        expect(entry.principal).toBe(100000);
      });
    });

    it('should match final entry to calculateFD result', () => {
      const breakdown = calculateFDMonthlyBreakdown(100000, 7, 12, 'quarterly');
      const fdResult = calculateFD(100000, 7, 12, 'quarterly');

      const lastEntry = breakdown[breakdown.length - 1];
      expect(lastEntry.totalValue).toBe(fdResult.maturityAmount);
      expect(lastEntry.interest).toBe(fdResult.totalInterest);
    });

    it('should use quarterly compounding by default', () => {
      const withDefault = calculateFDMonthlyBreakdown(100000, 7, 12);
      const withExplicit = calculateFDMonthlyBreakdown(100000, 7, 12, 'quarterly');

      expect(withDefault).toEqual(withExplicit);
    });
  });

  describe('calculateFDSimpleMonthlyBreakdown', () => {
    it('should return entries at quarterly intervals', () => {
      const breakdown = calculateFDSimpleMonthlyBreakdown(100000, 7, 12);

      expect(breakdown.length).toBe(4);
    });

    it('should show linear interest growth', () => {
      const breakdown = calculateFDSimpleMonthlyBreakdown(100000, 12, 12);

      // Interest should grow linearly: 3k, 6k, 9k, 12k
      expect(breakdown[0].interest).toBe(3000); // 3 months
      expect(breakdown[1].interest).toBe(6000); // 6 months
      expect(breakdown[2].interest).toBe(9000); // 9 months
      expect(breakdown[3].interest).toBe(12000); // 12 months
    });

    it('should match final entry to calculateFDSimple result', () => {
      const breakdown = calculateFDSimpleMonthlyBreakdown(100000, 7, 12);
      const fdResult = calculateFDSimple(100000, 7, 12);

      const lastEntry = breakdown[breakdown.length - 1];
      expect(lastEntry.totalValue).toBe(fdResult.maturityAmount);
    });

    it('should include final month if not on quarter boundary', () => {
      const breakdown = calculateFDSimpleMonthlyBreakdown(100000, 7, 10);

      expect(breakdown[breakdown.length - 1].month).toBe(10);
    });
  });

  describe('getCompoundingLabel', () => {
    it('should return correct labels', () => {
      expect(getCompoundingLabel('monthly')).toBe('Monthly');
      expect(getCompoundingLabel('quarterly')).toBe('Quarterly');
      expect(getCompoundingLabel('half-yearly')).toBe('Half-Yearly');
      expect(getCompoundingLabel('yearly')).toBe('Yearly');
    });
  });

  describe('compounding frequency comparison', () => {
    it('should show more frequent compounding yields higher returns', () => {
      const monthly = calculateFD(100000, 8, 60, 'monthly');
      const quarterly = calculateFD(100000, 8, 60, 'quarterly');
      const halfYearly = calculateFD(100000, 8, 60, 'half-yearly');
      const yearly = calculateFD(100000, 8, 60, 'yearly');

      expect(monthly.maturityAmount).toBeGreaterThan(quarterly.maturityAmount);
      expect(quarterly.maturityAmount).toBeGreaterThan(halfYearly.maturityAmount);
      expect(halfYearly.maturityAmount).toBeGreaterThan(yearly.maturityAmount);
    });
  });
});
