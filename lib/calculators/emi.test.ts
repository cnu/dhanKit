import {
  calculateEMI,
  calculateEMIBreakdown,
  calculateEMIYearlyBreakdown,
  EMIResult,
  EMIMonthlyBreakdown,
  EMIYearlyBreakdown,
} from './emi';

describe('EMI Calculator', () => {
  describe('calculateEMI', () => {
    it('should calculate EMI correctly for typical home loan', () => {
      // ₹50,00,000 at 8.5% for 20 years (240 months)
      // Standard EMI formula result: ~₹43,391
      const result = calculateEMI(5000000, 8.5, 240);

      expect(result.principalAmount).toBe(5000000);
      expect(result.monthlyEMI).toBeGreaterThan(43000);
      expect(result.monthlyEMI).toBeLessThan(44000);
    });

    it('should calculate total amount correctly', () => {
      const result = calculateEMI(1000000, 10, 120);

      // totalAmount is calculated from unrounded EMI, then rounded
      // So it may differ slightly from monthlyEMI * months
      const expectedTotal = result.monthlyEMI * 120;
      expect(Math.abs(result.totalAmount - expectedTotal)).toBeLessThan(20);
    });

    it('should calculate total interest correctly', () => {
      const result = calculateEMI(1000000, 10, 120);

      expect(result.totalInterest).toBe(result.totalAmount - result.principalAmount);
    });

    it('should handle 0% interest rate', () => {
      const result = calculateEMI(1200000, 0, 120);

      expect(result.monthlyEMI).toBe(10000); // 1200000 / 120
      expect(result.totalInterest).toBe(0);
      expect(result.totalAmount).toBe(1200000);
    });

    it('should handle short tenure', () => {
      // 1 year loan
      const result = calculateEMI(100000, 12, 12);

      // EMI should be close to principal/months + some interest
      expect(result.monthlyEMI).toBeGreaterThan(8000);
      expect(result.monthlyEMI).toBeLessThan(9000);
    });

    it('should handle high interest rate', () => {
      const result = calculateEMI(100000, 24, 36);

      expect(result.totalInterest).toBeGreaterThan(40000);
    });

    it('should return rounded values', () => {
      const result = calculateEMI(1234567, 9.25, 180);

      expect(Number.isInteger(result.monthlyEMI)).toBe(true);
      expect(Number.isInteger(result.totalAmount)).toBe(true);
      expect(Number.isInteger(result.totalInterest)).toBe(true);
    });

    it('should preserve principal amount', () => {
      const principal = 2500000;
      const result = calculateEMI(principal, 8.5, 180);

      expect(result.principalAmount).toBe(principal);
    });

    it('should calculate car loan EMI correctly', () => {
      // Typical car loan: ₹8,00,000 at 9% for 5 years
      const result = calculateEMI(800000, 9, 60);

      expect(result.monthlyEMI).toBeGreaterThan(16000);
      expect(result.monthlyEMI).toBeLessThan(17000);
    });

    it('should show higher EMI for shorter tenure', () => {
      const shortTenure = calculateEMI(1000000, 10, 60);
      const longTenure = calculateEMI(1000000, 10, 120);

      expect(shortTenure.monthlyEMI).toBeGreaterThan(longTenure.monthlyEMI);
    });

    it('should show higher total interest for longer tenure', () => {
      const shortTenure = calculateEMI(1000000, 10, 60);
      const longTenure = calculateEMI(1000000, 10, 120);

      expect(longTenure.totalInterest).toBeGreaterThan(shortTenure.totalInterest);
    });
  });

  describe('calculateEMIBreakdown', () => {
    it('should return correct number of entries', () => {
      const breakdown = calculateEMIBreakdown(100000, 10, 24);

      expect(breakdown.length).toBe(24);
      expect(breakdown[0].month).toBe(1);
      expect(breakdown[23].month).toBe(24);
    });

    it('should have EMI constant throughout', () => {
      const result = calculateEMI(100000, 10, 24);
      const breakdown = calculateEMIBreakdown(100000, 10, 24);

      breakdown.forEach((entry) => {
        expect(entry.emi).toBe(result.monthlyEMI);
      });
    });

    it('should have principal increasing each month', () => {
      const breakdown = calculateEMIBreakdown(100000, 10, 24);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].principal).toBeGreaterThanOrEqual(breakdown[i - 1].principal);
      }
    });

    it('should have interest decreasing each month', () => {
      const breakdown = calculateEMIBreakdown(100000, 10, 24);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].interest).toBeLessThanOrEqual(breakdown[i - 1].interest);
      }
    });

    it('should have balance decreasing to zero', () => {
      const breakdown = calculateEMIBreakdown(100000, 10, 24);

      // Balance should decrease
      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].balance).toBeLessThan(breakdown[i - 1].balance);
      }

      // Final balance should be zero
      expect(breakdown[breakdown.length - 1].balance).toBe(0);
    });

    it('should have principal + interest = EMI each month', () => {
      const breakdown = calculateEMIBreakdown(100000, 10, 24);

      breakdown.forEach((entry) => {
        // Allow for rounding differences of ±1
        expect(Math.abs(entry.principal + entry.interest - entry.emi)).toBeLessThanOrEqual(1);
      });
    });

    it('should sum principal payments to original loan amount', () => {
      const breakdown = calculateEMIBreakdown(100000, 10, 24);

      const totalPrincipal = breakdown.reduce((sum, entry) => sum + entry.principal, 0);
      // Allow for rounding differences
      expect(Math.abs(totalPrincipal - 100000)).toBeLessThan(100);
    });

    it('should start with first month balance less than principal', () => {
      const breakdown = calculateEMIBreakdown(100000, 10, 24);

      expect(breakdown[0].balance).toBeLessThan(100000);
    });

    it('should handle edge case of high interest low tenure', () => {
      const breakdown = calculateEMIBreakdown(100000, 20, 12);

      expect(breakdown.length).toBe(12);
      expect(breakdown[11].balance).toBe(0);
    });
  });

  describe('calculateEMIYearlyBreakdown', () => {
    it('should return correct number of years', () => {
      const breakdown = calculateEMIYearlyBreakdown(1000000, 10, 60);

      expect(breakdown.length).toBe(5); // 60 months = 5 years
    });

    it('should handle partial final year', () => {
      const breakdown = calculateEMIYearlyBreakdown(100000, 10, 30);

      expect(breakdown.length).toBe(3); // 30 months = 2.5 years, rounded up
      expect(breakdown[2].year).toBe(3);
    });

    it('should have balance decreasing each year', () => {
      const breakdown = calculateEMIYearlyBreakdown(1000000, 10, 120);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].balance).toBeLessThan(breakdown[i - 1].balance);
      }
    });

    it('should have final balance zero', () => {
      const breakdown = calculateEMIYearlyBreakdown(1000000, 10, 60);

      expect(breakdown[breakdown.length - 1].balance).toBe(0);
    });

    it('should have totalPaid = principalPaid + interestPaid', () => {
      const breakdown = calculateEMIYearlyBreakdown(1000000, 10, 60);

      breakdown.forEach((entry) => {
        expect(entry.totalPaid).toBe(entry.principalPaid + entry.interestPaid);
      });
    });

    it('should sum all yearly principal to original loan', () => {
      const breakdown = calculateEMIYearlyBreakdown(1000000, 10, 60);

      const totalPrincipal = breakdown.reduce((sum, entry) => sum + entry.principalPaid, 0);
      // Allow for rounding
      expect(Math.abs(totalPrincipal - 1000000)).toBeLessThan(100);
    });

    it('should match total interest to calculateEMI result', () => {
      const emiResult = calculateEMI(1000000, 10, 60);
      const breakdown = calculateEMIYearlyBreakdown(1000000, 10, 60);

      const totalInterest = breakdown.reduce((sum, entry) => sum + entry.interestPaid, 0);
      // Allow for rounding differences
      expect(Math.abs(totalInterest - emiResult.totalInterest)).toBeLessThan(100);
    });

    it('should show decreasing interest paid each year', () => {
      const breakdown = calculateEMIYearlyBreakdown(1000000, 10, 120);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].interestPaid).toBeLessThan(breakdown[i - 1].interestPaid);
      }
    });

    it('should show increasing principal paid each year', () => {
      const breakdown = calculateEMIYearlyBreakdown(1000000, 10, 120);

      // Note: For the final partial year, this might not hold
      for (let i = 1; i < breakdown.length - 1; i++) {
        expect(breakdown[i].principalPaid).toBeGreaterThan(breakdown[i - 1].principalPaid);
      }
    });
  });

  describe('EMI calculation consistency', () => {
    it('should have breakdown total match EMI calculation', () => {
      const emiResult = calculateEMI(500000, 9, 60);
      const breakdown = calculateEMIBreakdown(500000, 9, 60);

      const totalFromBreakdown = breakdown.reduce(
        (acc, entry) => ({
          principal: acc.principal + entry.principal,
          interest: acc.interest + entry.interest,
        }),
        { principal: 0, interest: 0 }
      );

      // Allow for cumulative rounding differences
      expect(Math.abs(totalFromBreakdown.principal - emiResult.principalAmount)).toBeLessThan(100);
      expect(Math.abs(totalFromBreakdown.interest - emiResult.totalInterest)).toBeLessThan(100);
    });
  });
});
