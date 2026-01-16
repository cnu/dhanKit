import {
  calculateSIP,
  calculateSIPYearlyBreakdown,
  calculateStepUpSIP,
  calculateStepUpSIPYearlyBreakdown,
  SIPResult,
  SIPYearlyBreakdown,
  StepUpSIPResult,
} from './sip';

describe('SIP Calculator', () => {
  describe('calculateSIP', () => {
    it('should calculate basic SIP returns correctly', () => {
      // ₹10,000/month at 12% for 10 years
      // Using effective monthly rate formula: r_eff = (1 + 0.12)^(1/12) - 1
      // This gives slightly different results than simple r/12 formula
      const result = calculateSIP(10000, 12, 10);

      expect(result.totalInvested).toBe(1200000); // 10,000 × 120 months
      expect(result.maturityAmount).toBeGreaterThan(2200000);
      expect(result.maturityAmount).toBeLessThan(2300000);
      expect(result.totalReturns).toBe(result.maturityAmount - result.totalInvested);
    });

    it('should calculate SIP for 1 year correctly', () => {
      const result = calculateSIP(5000, 12, 1);

      expect(result.totalInvested).toBe(60000);
      expect(result.maturityAmount).toBeGreaterThan(63000);
      expect(result.maturityAmount).toBeLessThan(64000);
    });

    it('should handle high returns correctly', () => {
      const result = calculateSIP(10000, 24, 15);

      expect(result.totalInvested).toBe(1800000);
      expect(result.maturityAmount).toBeGreaterThan(10000000); // Should be significantly higher
    });

    it('should handle low returns correctly', () => {
      const result = calculateSIP(10000, 6, 10);

      expect(result.totalInvested).toBe(1200000);
      expect(result.maturityAmount).toBeGreaterThan(1600000);
      expect(result.maturityAmount).toBeLessThan(1700000);
    });

    it('should handle 0% return (edge case)', () => {
      // With 0% return, maturity should equal invested amount
      // Note: This tests the formula's behavior at boundary
      const result = calculateSIP(10000, 0.0001, 10);

      // With near-zero return, maturity should be close to invested
      expect(result.maturityAmount).toBeCloseTo(result.totalInvested, -4);
    });

    it('should return rounded values', () => {
      const result = calculateSIP(10000, 12, 10);

      expect(Number.isInteger(result.maturityAmount)).toBe(true);
      expect(Number.isInteger(result.totalReturns)).toBe(true);
    });

    it('should match known benchmark values', () => {
      // ₹5,000/month at 12% for 15 years
      // Using effective monthly rate formula (slightly lower than simple division)
      const result = calculateSIP(5000, 12, 15);

      expect(result.totalInvested).toBe(900000);
      // Effective rate formula yields ~₹23.8L vs ~₹25.2L with simple r/12
      expect(result.maturityAmount).toBeGreaterThan(2350000);
      expect(result.maturityAmount).toBeLessThan(2400000);
    });
  });

  describe('calculateSIPYearlyBreakdown', () => {
    it('should return correct number of entries', () => {
      const breakdown = calculateSIPYearlyBreakdown(10000, 12, 5);

      expect(breakdown.length).toBe(5);
      expect(breakdown[0].year).toBe(1);
      expect(breakdown[4].year).toBe(5);
    });

    it('should have increasing values each year', () => {
      const breakdown = calculateSIPYearlyBreakdown(10000, 12, 10);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].invested).toBeGreaterThan(breakdown[i - 1].invested);
        expect(breakdown[i].totalValue).toBeGreaterThan(breakdown[i - 1].totalValue);
      }
    });

    it('should match final year to calculateSIP result', () => {
      const breakdown = calculateSIPYearlyBreakdown(10000, 12, 10);
      const sipResult = calculateSIP(10000, 12, 10);

      const lastYear = breakdown[breakdown.length - 1];
      expect(lastYear.totalValue).toBe(sipResult.maturityAmount);
      expect(lastYear.invested).toBe(sipResult.totalInvested);
    });

    it('should correctly calculate yearly invested amounts', () => {
      const breakdown = calculateSIPYearlyBreakdown(10000, 12, 3);

      expect(breakdown[0].invested).toBe(120000); // Year 1: 12 months
      expect(breakdown[1].invested).toBe(240000); // Year 2: 24 months
      expect(breakdown[2].invested).toBe(360000); // Year 3: 36 months
    });

    it('should have interest equal to totalValue minus invested', () => {
      const breakdown = calculateSIPYearlyBreakdown(10000, 12, 5);

      breakdown.forEach((entry) => {
        // Allow for rounding differences of ±1
        expect(Math.abs(entry.interest - (entry.totalValue - entry.invested))).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('calculateStepUpSIP', () => {
    it('should be higher than regular SIP with positive step-up', () => {
      const stepUpResult = calculateStepUpSIP(10000, 12, 10, 10);

      expect(stepUpResult.maturityAmount).toBeGreaterThan(stepUpResult.withoutStepUp.maturityAmount);
      expect(stepUpResult.totalInvested).toBeGreaterThan(stepUpResult.withoutStepUp.totalInvested);
    });

    it('should equal regular SIP with 0% step-up', () => {
      const stepUpResult = calculateStepUpSIP(10000, 12, 10, 0);
      const regularResult = calculateSIP(10000, 12, 10);

      expect(stepUpResult.maturityAmount).toBe(regularResult.maturityAmount);
      expect(stepUpResult.totalInvested).toBe(regularResult.totalInvested);
    });

    it('should correctly increase investment each year', () => {
      // With 10% step-up: ₹10,000 → ₹11,000 → ₹12,100 etc.
      const result = calculateStepUpSIP(10000, 12, 3, 10);

      // Year 1: 10,000 × 12 = 120,000
      // Year 2: 11,000 × 12 = 132,000
      // Year 3: 12,100 × 12 = 145,200
      // Total: 397,200
      expect(result.totalInvested).toBe(397200);
    });

    it('should include withoutStepUp result for comparison', () => {
      const result = calculateStepUpSIP(10000, 12, 10, 10);

      expect(result.withoutStepUp).toBeDefined();
      expect(result.withoutStepUp.maturityAmount).toBeDefined();
      expect(result.withoutStepUp.totalInvested).toBe(1200000);
    });

    it('should handle high step-up percentages', () => {
      const result = calculateStepUpSIP(5000, 12, 10, 25);

      expect(result.maturityAmount).toBeGreaterThan(result.withoutStepUp.maturityAmount * 2);
    });

    it('should return rounded values', () => {
      const result = calculateStepUpSIP(10000, 12, 10, 10);

      expect(Number.isInteger(result.maturityAmount)).toBe(true);
      expect(Number.isInteger(result.totalInvested)).toBe(true);
      expect(Number.isInteger(result.totalReturns)).toBe(true);
    });
  });

  describe('calculateStepUpSIPYearlyBreakdown', () => {
    it('should return correct number of entries', () => {
      const breakdown = calculateStepUpSIPYearlyBreakdown(10000, 12, 5, 10);

      expect(breakdown.length).toBe(5);
    });

    it('should include monthlySIP for each year', () => {
      const breakdown = calculateStepUpSIPYearlyBreakdown(10000, 12, 3, 10);

      expect(breakdown[0].monthlySIP).toBe(10000);
      expect(breakdown[1].monthlySIP).toBe(11000); // 10% increase
      expect(breakdown[2].monthlySIP).toBe(12100); // Another 10% increase
    });

    it('should have increasing invested amounts', () => {
      const breakdown = calculateStepUpSIPYearlyBreakdown(10000, 12, 5, 10);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].invested).toBeGreaterThan(breakdown[i - 1].invested);
      }
    });

    it('should match final year to calculateStepUpSIP result', () => {
      const breakdown = calculateStepUpSIPYearlyBreakdown(10000, 12, 10, 10);
      const sipResult = calculateStepUpSIP(10000, 12, 10, 10);

      const lastYear = breakdown[breakdown.length - 1];
      expect(lastYear.totalValue).toBe(sipResult.maturityAmount);
      expect(lastYear.invested).toBe(sipResult.totalInvested);
    });

    it('should have interest increasing over time', () => {
      const breakdown = calculateStepUpSIPYearlyBreakdown(10000, 12, 10, 10);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].interest).toBeGreaterThan(breakdown[i - 1].interest);
      }
    });
  });
});
