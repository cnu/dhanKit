import {
  calculateNPS,
  calculateNPSYearlyBreakdown,
  NPSResult,
  NPSYearlyBreakdown,
} from './nps';

describe('NPS Calculator', () => {
  describe('calculateNPS', () => {
    it('should calculate basic NPS returns correctly', () => {
      // 30-year-old, ₹5,000/month, 10% return, 6% annuity
      // 30 years to retirement = 360 months
      const result = calculateNPS(30, 5000, 10, 6);

      expect(result.yearsToRetirement).toBe(30);
      expect(result.totalInvested).toBe(1800000); // 5,000 × 360 months
      expect(result.totalCorpus).toBeGreaterThan(10000000); // Should be substantial after 30 years
      expect(result.totalCorpus).toBeLessThan(12000000);
    });

    it('should correctly split corpus 60/40', () => {
      const result = calculateNPS(30, 5000, 10, 6);

      // Verify 60/40 split (allow for rounding)
      expect(result.lumpsumWithdrawal).toBeCloseTo(result.totalCorpus * 0.6, -1);
      expect(result.annuityInvestment).toBeCloseTo(result.totalCorpus * 0.4, -1);
      expect(result.lumpsumWithdrawal + result.annuityInvestment).toBeCloseTo(result.totalCorpus, -1);
    });

    it('should calculate monthly pension correctly', () => {
      const result = calculateNPS(30, 5000, 10, 6);

      // Monthly pension = (annuityInvestment × 6%) / 12
      const expectedPension = (result.annuityInvestment * 0.06) / 12;
      expect(result.monthlyPension).toBeCloseTo(expectedPension, -1);
    });

    it('should handle 59-year-old (1 year to retirement)', () => {
      const result = calculateNPS(59, 10000, 10, 6);

      expect(result.yearsToRetirement).toBe(1);
      expect(result.totalInvested).toBe(120000); // 10,000 × 12 months
      expect(result.totalCorpus).toBeGreaterThan(120000);
      expect(result.totalCorpus).toBeLessThan(140000);
    });

    it('should handle 18-year-old (maximum investment period)', () => {
      const result = calculateNPS(18, 5000, 10, 6);

      expect(result.yearsToRetirement).toBe(42);
      expect(result.totalInvested).toBe(2520000); // 5,000 × 504 months
      expect(result.totalCorpus).toBeGreaterThan(30000000); // Should be very large after 42 years
    });

    it('should handle low returns correctly', () => {
      const result = calculateNPS(30, 5000, 8, 6);

      expect(result.totalCorpus).toBeGreaterThan(7000000);
      expect(result.totalCorpus).toBeLessThan(8500000);
    });

    it('should handle high returns correctly', () => {
      const result = calculateNPS(30, 5000, 14, 6);

      expect(result.totalCorpus).toBeGreaterThan(20000000);
    });

    it('should vary monthly pension with annuity rate', () => {
      const result4 = calculateNPS(30, 5000, 10, 4);
      const result8 = calculateNPS(30, 5000, 10, 8);

      // Same corpus, but different pension based on annuity rate
      expect(result4.totalCorpus).toBe(result8.totalCorpus);
      expect(result8.monthlyPension).toBeGreaterThan(result4.monthlyPension);
      expect(result8.monthlyPension).toBeCloseTo(result4.monthlyPension * 2, -2);
    });

    it('should return rounded values', () => {
      const result = calculateNPS(30, 5000, 10, 6);

      expect(Number.isInteger(result.totalCorpus)).toBe(true);
      expect(Number.isInteger(result.lumpsumWithdrawal)).toBe(true);
      expect(Number.isInteger(result.annuityInvestment)).toBe(true);
      expect(Number.isInteger(result.monthlyPension)).toBe(true);
      expect(Number.isInteger(result.totalReturns)).toBe(true);
    });

    it('should calculate returns as corpus minus invested', () => {
      const result = calculateNPS(30, 5000, 10, 6);

      expect(result.totalReturns).toBe(result.totalCorpus - result.totalInvested);
    });

    it('should default to 40% annuity ratio', () => {
      const result = calculateNPS(30, 5000, 10, 6);

      expect(result.annuityPercent).toBe(40);
      expect(result.annuityInvestment).toBeCloseTo(result.totalCorpus * 0.4, -1);
      expect(result.lumpsumWithdrawal).toBeCloseTo(result.totalCorpus * 0.6, -1);
    });

    it('should support custom annuity ratio (50%)', () => {
      const result = calculateNPS(30, 5000, 10, 6, 50);

      expect(result.annuityPercent).toBe(50);
      expect(result.annuityInvestment).toBeCloseTo(result.totalCorpus * 0.5, -1);
      expect(result.lumpsumWithdrawal).toBeCloseTo(result.totalCorpus * 0.5, -1);
    });

    it('should support 100% annuity (no lumpsum)', () => {
      const result = calculateNPS(30, 5000, 10, 6, 100);

      expect(result.annuityPercent).toBe(100);
      expect(result.annuityInvestment).toBeCloseTo(result.totalCorpus, -1);
      expect(result.lumpsumWithdrawal).toBe(0);
    });

    it('should clamp annuity ratio to minimum 40%', () => {
      const result = calculateNPS(30, 5000, 10, 6, 20); // Try to set 20%

      expect(result.annuityPercent).toBe(40); // Clamped to minimum
      expect(result.annuityInvestment).toBeCloseTo(result.totalCorpus * 0.4, -1);
    });

    it('should clamp annuity ratio to maximum 100%', () => {
      const result = calculateNPS(30, 5000, 10, 6, 120); // Try to set 120%

      expect(result.annuityPercent).toBe(100); // Clamped to maximum
      expect(result.annuityInvestment).toBeCloseTo(result.totalCorpus, -1);
    });

    it('should increase monthly pension with higher annuity ratio', () => {
      const result40 = calculateNPS(30, 5000, 10, 6, 40);
      const result60 = calculateNPS(30, 5000, 10, 6, 60);
      const result100 = calculateNPS(30, 5000, 10, 6, 100);

      // Same corpus for all
      expect(result40.totalCorpus).toBe(result60.totalCorpus);
      expect(result60.totalCorpus).toBe(result100.totalCorpus);

      // Higher annuity ratio = higher pension
      expect(result60.monthlyPension).toBeGreaterThan(result40.monthlyPension);
      expect(result100.monthlyPension).toBeGreaterThan(result60.monthlyPension);

      // 100% annuity should give 2.5x pension of 40% annuity
      expect(result100.monthlyPension).toBeCloseTo(result40.monthlyPension * 2.5, -2);
    });
  });

  describe('calculateNPSYearlyBreakdown', () => {
    it('should return correct number of entries', () => {
      const breakdown = calculateNPSYearlyBreakdown(30, 5000, 10);

      expect(breakdown.length).toBe(30); // 30 years to retirement
      expect(breakdown[0].year).toBe(1);
      expect(breakdown[29].year).toBe(30);
    });

    it('should include age in breakdown', () => {
      const breakdown = calculateNPSYearlyBreakdown(30, 5000, 10);

      expect(breakdown[0].age).toBe(31); // 30 + 1
      expect(breakdown[29].age).toBe(60); // Retirement age
    });

    it('should have increasing values each year', () => {
      const breakdown = calculateNPSYearlyBreakdown(30, 5000, 10);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].invested).toBeGreaterThan(breakdown[i - 1].invested);
        expect(breakdown[i].totalValue).toBeGreaterThan(breakdown[i - 1].totalValue);
      }
    });

    it('should match final year to calculateNPS result', () => {
      const breakdown = calculateNPSYearlyBreakdown(30, 5000, 10);
      const npsResult = calculateNPS(30, 5000, 10, 6); // annuity rate doesn't affect corpus

      const lastYear = breakdown[breakdown.length - 1];
      expect(lastYear.totalValue).toBe(npsResult.totalCorpus);
      expect(lastYear.invested).toBe(npsResult.totalInvested);
    });

    it('should correctly calculate yearly invested amounts', () => {
      const breakdown = calculateNPSYearlyBreakdown(30, 5000, 10);

      expect(breakdown[0].invested).toBe(60000);   // Year 1: 12 months
      expect(breakdown[1].invested).toBe(120000);  // Year 2: 24 months
      expect(breakdown[2].invested).toBe(180000);  // Year 3: 36 months
    });

    it('should have interest equal to totalValue minus invested', () => {
      const breakdown = calculateNPSYearlyBreakdown(30, 5000, 10);

      breakdown.forEach((entry) => {
        // Allow for rounding differences of ±1
        expect(Math.abs(entry.interest - (entry.totalValue - entry.invested))).toBeLessThanOrEqual(1);
      });
    });

    it('should handle 1 year to retirement', () => {
      const breakdown = calculateNPSYearlyBreakdown(59, 10000, 10);

      expect(breakdown.length).toBe(1);
      expect(breakdown[0].year).toBe(1);
      expect(breakdown[0].age).toBe(60);
    });

    it('should end at retirement age 60', () => {
      const breakdown25 = calculateNPSYearlyBreakdown(25, 5000, 10);
      const breakdown45 = calculateNPSYearlyBreakdown(45, 5000, 10);

      expect(breakdown25[breakdown25.length - 1].age).toBe(60);
      expect(breakdown45[breakdown45.length - 1].age).toBe(60);
    });
  });
});
