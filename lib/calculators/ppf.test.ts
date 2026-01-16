import {
  calculatePPF,
  calculatePPFYearlyBreakdown,
  PPFResult,
  PPFYearlyBreakdown,
} from './ppf';

describe('PPF Calculator', () => {
  describe('calculatePPF', () => {
    it('should calculate PPF maturity correctly for 15 years', () => {
      // ₹1,50,000/year at 7.1% for 15 years (standard PPF tenure)
      // This is a well-known benchmark calculation
      const result = calculatePPF(150000, 15, 7.1);

      expect(result.totalInvested).toBe(2250000); // 150000 × 15
      expect(result.maturityAmount).toBeGreaterThan(4000000);
      expect(result.maturityAmount).toBeLessThan(4100000);
    });

    it('should calculate total interest correctly', () => {
      const result = calculatePPF(150000, 15, 7.1);

      expect(result.totalInterest).toBe(result.maturityAmount - result.totalInvested);
    });

    it('should handle minimum investment (₹500/year)', () => {
      const result = calculatePPF(500, 15, 7.1);

      expect(result.totalInvested).toBe(7500);
      expect(result.maturityAmount).toBeGreaterThan(result.totalInvested);
    });

    it('should handle maximum investment (₹1.5L/year)', () => {
      const result = calculatePPF(150000, 15, 7.1);

      expect(result.totalInvested).toBe(2250000);
    });

    it('should handle different interest rates', () => {
      const rate7 = calculatePPF(100000, 15, 7);
      const rate8 = calculatePPF(100000, 15, 8);

      expect(rate8.maturityAmount).toBeGreaterThan(rate7.maturityAmount);
    });

    it('should handle extended tenure (20 years)', () => {
      // PPF can be extended in 5-year blocks
      const result = calculatePPF(100000, 20, 7.1);

      expect(result.totalInvested).toBe(2000000);
      expect(result.maturityAmount).toBeGreaterThan(result.totalInvested);
    });

    it('should return rounded values', () => {
      const result = calculatePPF(125000, 15, 7.1);

      expect(Number.isInteger(result.maturityAmount)).toBe(true);
      expect(Number.isInteger(result.totalInvested)).toBe(true);
      expect(Number.isInteger(result.totalInterest)).toBe(true);
    });

    it('should show compound growth over time', () => {
      const result10 = calculatePPF(100000, 10, 7);
      const result15 = calculatePPF(100000, 15, 7);

      // Returns ratio should be higher for longer tenure due to compounding
      const returnsRatio10 = result10.totalInterest / result10.totalInvested;
      const returnsRatio15 = result15.totalInterest / result15.totalInvested;

      expect(returnsRatio15).toBeGreaterThan(returnsRatio10);
    });

    it('should handle 1 year correctly', () => {
      // Balance = (0 + 100000) × 1.071 = 107,100
      const result = calculatePPF(100000, 1, 7.1);

      expect(result.maturityAmount).toBe(107100);
      expect(result.totalInvested).toBe(100000);
      expect(result.totalInterest).toBe(7100);
    });

    it('should handle 0% interest rate', () => {
      const result = calculatePPF(100000, 15, 0);

      expect(result.maturityAmount).toBe(1500000);
      expect(result.totalInterest).toBe(0);
    });

    it('should calculate correctly for 5-year blocks', () => {
      // PPF is in 5-year blocks: 15, 20, 25 years etc.
      const year15 = calculatePPF(100000, 15, 7.1);
      const year20 = calculatePPF(100000, 20, 7.1);
      const year25 = calculatePPF(100000, 25, 7.1);

      expect(year20.maturityAmount).toBeGreaterThan(year15.maturityAmount);
      expect(year25.maturityAmount).toBeGreaterThan(year20.maturityAmount);
    });
  });

  describe('calculatePPFYearlyBreakdown', () => {
    it('should return correct number of entries', () => {
      const breakdown = calculatePPFYearlyBreakdown(100000, 15, 7.1);

      expect(breakdown.length).toBe(15);
      expect(breakdown[0].year).toBe(1);
      expect(breakdown[14].year).toBe(15);
    });

    it('should have increasing invested amounts', () => {
      const breakdown = calculatePPFYearlyBreakdown(100000, 15, 7.1);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].invested).toBeGreaterThan(breakdown[i - 1].invested);
      }
    });

    it('should have yearly invested increments equal to yearly investment', () => {
      const yearlyInvestment = 100000;
      const breakdown = calculatePPFYearlyBreakdown(yearlyInvestment, 15, 7.1);

      for (let i = 0; i < breakdown.length; i++) {
        expect(breakdown[i].invested).toBe(yearlyInvestment * (i + 1));
      }
    });

    it('should have increasing balance each year', () => {
      const breakdown = calculatePPFYearlyBreakdown(100000, 15, 7.1);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].balance).toBeGreaterThan(breakdown[i - 1].balance);
      }
    });

    it('should have increasing interest each year', () => {
      const breakdown = calculatePPFYearlyBreakdown(100000, 15, 7.1);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].interest).toBeGreaterThan(breakdown[i - 1].interest);
      }
    });

    it('should match final year to calculatePPF result', () => {
      const breakdown = calculatePPFYearlyBreakdown(100000, 15, 7.1);
      const ppfResult = calculatePPF(100000, 15, 7.1);

      const lastYear = breakdown[breakdown.length - 1];
      expect(lastYear.balance).toBe(ppfResult.maturityAmount);
      expect(lastYear.invested).toBe(ppfResult.totalInvested);
      expect(lastYear.interest).toBe(ppfResult.totalInterest);
    });

    it('should have balance = invested + interest', () => {
      const breakdown = calculatePPFYearlyBreakdown(100000, 15, 7.1);

      breakdown.forEach((entry) => {
        // Allow for rounding differences of ±1
        expect(Math.abs(entry.balance - (entry.invested + entry.interest))).toBeLessThanOrEqual(1);
      });
    });

    it('should return rounded values', () => {
      const breakdown = calculatePPFYearlyBreakdown(123456, 15, 7.1);

      breakdown.forEach((entry) => {
        expect(Number.isInteger(entry.invested)).toBe(true);
        expect(Number.isInteger(entry.interest)).toBe(true);
        expect(Number.isInteger(entry.balance)).toBe(true);
      });
    });

    it('should show first year correctly', () => {
      const breakdown = calculatePPFYearlyBreakdown(100000, 15, 7.1);

      // Year 1: (0 + 100000) × 1.071 = 107100
      expect(breakdown[0].year).toBe(1);
      expect(breakdown[0].invested).toBe(100000);
      expect(breakdown[0].balance).toBe(107100);
      expect(breakdown[0].interest).toBe(7100);
    });

    it('should show second year correctly', () => {
      const breakdown = calculatePPFYearlyBreakdown(100000, 15, 7.1);

      // Year 2: (107100 + 100000) × 1.071 = 221,804.10
      // Note: Uses full precision from year 1, not rounded 107100
      expect(breakdown[1].year).toBe(2);
      expect(breakdown[1].invested).toBe(200000);
      expect(breakdown[1].balance).toBe(221804);
      expect(breakdown[1].interest).toBe(21804);
    });

    it('should handle short tenure', () => {
      const breakdown = calculatePPFYearlyBreakdown(100000, 3, 7.1);

      expect(breakdown.length).toBe(3);
      expect(breakdown[2].year).toBe(3);
    });
  });

  describe('PPF-specific scenarios', () => {
    it('should handle standard 15-year lock-in scenario', () => {
      // Standard PPF: ₹1.5L/year at current rate (7.1%) for 15 years
      const result = calculatePPF(150000, 15, 7.1);
      const breakdown = calculatePPFYearlyBreakdown(150000, 15, 7.1);

      // Total invested should be ₹22.5L
      expect(result.totalInvested).toBe(2250000);

      // Maturity should be around ₹40.68L (known benchmark)
      expect(result.maturityAmount).toBeGreaterThan(4050000);
      expect(result.maturityAmount).toBeLessThan(4100000);

      // Breakdown should match
      expect(breakdown[14].balance).toBe(result.maturityAmount);
    });

    it('should handle historical interest rates', () => {
      // PPF rate was 8% few years ago
      const rate8 = calculatePPF(150000, 15, 8);
      // Current rate is 7.1%
      const rate71 = calculatePPF(150000, 15, 7.1);

      expect(rate8.maturityAmount).toBeGreaterThan(rate71.maturityAmount);
    });

    it('should handle minimum contribution scenario', () => {
      // Minimum ₹500/year for 15 years
      const result = calculatePPF(500, 15, 7.1);

      expect(result.totalInvested).toBe(7500);
      expect(result.maturityAmount).toBeGreaterThan(13000);
    });
  });
});
