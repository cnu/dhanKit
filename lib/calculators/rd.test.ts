import {
  calculateRD,
  calculateRDMonthlyBreakdown,
  calculateRequiredDeposit,
  getCompoundingLabel,
  RDResult,
  RDMonthlyBreakdown,
} from "./rd";

describe("RD Calculator", () => {
  describe("calculateRD", () => {
    it("should calculate basic RD returns correctly with quarterly compounding", () => {
      // ₹5,000/month at 7% for 12 months (1 year)
      const result = calculateRD(5000, 7, 12, "quarterly");

      expect(result.totalDeposited).toBe(60000); // 5000 × 12
      expect(result.maturityAmount).toBeGreaterThan(60000);
      expect(result.maturityAmount).toBeLessThan(65000);
      expect(result.totalInterest).toBe(
        result.maturityAmount - result.totalDeposited
      );
    });

    it("should calculate RD for 5 years (60 months) correctly", () => {
      // ₹10,000/month at 7.5% for 60 months
      const result = calculateRD(10000, 7.5, 60, "quarterly");

      expect(result.totalDeposited).toBe(600000);
      expect(result.maturityAmount).toBeGreaterThan(700000);
      expect(result.maturityAmount).toBeLessThan(750000);
    });

    it("should handle monthly compounding", () => {
      const result = calculateRD(5000, 7, 12, "monthly");

      expect(result.totalDeposited).toBe(60000);
      expect(result.maturityAmount).toBeGreaterThan(60000);
      // Monthly compounding has different timing than quarterly
      // Both should produce reasonable results
      expect(result.totalInterest).toBeGreaterThan(0);
    });

    it("should default to quarterly compounding", () => {
      const explicitQuarterly = calculateRD(5000, 7, 12, "quarterly");
      const defaultCompounding = calculateRD(5000, 7, 12);

      expect(defaultCompounding.maturityAmount).toBe(
        explicitQuarterly.maturityAmount
      );
    });

    it("should handle high interest rates correctly", () => {
      const result = calculateRD(5000, 9, 36, "quarterly");

      expect(result.totalDeposited).toBe(180000);
      expect(result.maturityAmount).toBeGreaterThan(200000);
    });

    it("should handle low interest rates correctly", () => {
      const result = calculateRD(5000, 4, 24, "quarterly");

      expect(result.totalDeposited).toBe(120000);
      expect(result.maturityAmount).toBeGreaterThan(120000);
      expect(result.maturityAmount).toBeLessThan(130000);
    });

    it("should return rounded values", () => {
      const result = calculateRD(5000, 7.25, 18, "quarterly");

      expect(Number.isInteger(result.maturityAmount)).toBe(true);
      expect(Number.isInteger(result.totalDeposited)).toBe(true);
      expect(Number.isInteger(result.totalInterest)).toBe(true);
    });

    it("should calculate effective rate correctly for quarterly compounding", () => {
      // For 7% nominal with quarterly compounding: (1 + 0.07/4)^4 - 1 ≈ 7.19%
      const result = calculateRD(5000, 7, 12, "quarterly");

      expect(result.effectiveRate).toBeGreaterThan(7);
      expect(result.effectiveRate).toBeLessThan(7.5);
    });

    it("should calculate effective rate correctly for monthly compounding", () => {
      // For 7% nominal with monthly compounding: (1 + 0.07/12)^12 - 1 ≈ 7.23%
      const result = calculateRD(5000, 7, 12, "monthly");

      expect(result.effectiveRate).toBeGreaterThan(7);
      expect(result.effectiveRate).toBeLessThan(7.5);
      // Monthly effective rate should be slightly higher than quarterly
      const quarterlyResult = calculateRD(5000, 7, 12, "quarterly");
      expect(result.effectiveRate).toBeGreaterThan(quarterlyResult.effectiveRate);
    });

    it("should handle partial periods correctly", () => {
      // 7 months - partial quarter at the end
      const result = calculateRD(5000, 7, 7, "quarterly");

      expect(result.totalDeposited).toBe(35000);
      expect(result.maturityAmount).toBeGreaterThan(35000);
    });

    it("should handle very short tenures", () => {
      // 3 months (one quarter)
      const result = calculateRD(5000, 7, 3, "quarterly");

      expect(result.totalDeposited).toBe(15000);
      expect(result.maturityAmount).toBeGreaterThan(15000);
    });

    it("should ensure interest increases with tenure", () => {
      const result12 = calculateRD(5000, 7, 12, "quarterly");
      const result24 = calculateRD(5000, 7, 24, "quarterly");
      const result36 = calculateRD(5000, 7, 36, "quarterly");

      // Total interest should increase with tenure
      expect(result24.totalInterest).toBeGreaterThan(result12.totalInterest);
      expect(result36.totalInterest).toBeGreaterThan(result24.totalInterest);
    });
  });

  describe("calculateRDMonthlyBreakdown", () => {
    it("should return breakdown at 3-month intervals", () => {
      const breakdown = calculateRDMonthlyBreakdown(5000, 7, 12, "quarterly");

      // Should show months 3, 6, 9, 12
      expect(breakdown.length).toBe(4);
      expect(breakdown[0].month).toBe(3);
      expect(breakdown[1].month).toBe(6);
      expect(breakdown[2].month).toBe(9);
      expect(breakdown[3].month).toBe(12);
    });

    it("should always include final month even if not on interval", () => {
      // 10 months - should show 3, 6, 9, 10
      const breakdown = calculateRDMonthlyBreakdown(5000, 7, 10, "quarterly");

      const lastEntry = breakdown[breakdown.length - 1];
      expect(lastEntry.month).toBe(10);
    });

    it("should have increasing total values over time", () => {
      const breakdown = calculateRDMonthlyBreakdown(5000, 7, 24, "quarterly");

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].totalValue).toBeGreaterThan(
          breakdown[i - 1].totalValue
        );
        expect(breakdown[i].totalDeposited).toBeGreaterThan(
          breakdown[i - 1].totalDeposited
        );
      }
    });

    it("should match final breakdown to calculateRD result", () => {
      const breakdown = calculateRDMonthlyBreakdown(5000, 7, 12, "quarterly");
      const rdResult = calculateRD(5000, 7, 12, "quarterly");

      const lastEntry = breakdown[breakdown.length - 1];
      expect(lastEntry.totalValue).toBe(rdResult.maturityAmount);
      expect(lastEntry.totalDeposited).toBe(rdResult.totalDeposited);
    });

    it("should show correct deposit amount each period", () => {
      const breakdown = calculateRDMonthlyBreakdown(5000, 7, 12, "quarterly");

      breakdown.forEach((entry) => {
        expect(entry.deposit).toBe(5000);
      });
    });

    it("should calculate cumulative deposits correctly", () => {
      const breakdown = calculateRDMonthlyBreakdown(5000, 7, 12, "quarterly");

      expect(breakdown[0].totalDeposited).toBe(15000); // 3 months
      expect(breakdown[1].totalDeposited).toBe(30000); // 6 months
      expect(breakdown[2].totalDeposited).toBe(45000); // 9 months
      expect(breakdown[3].totalDeposited).toBe(60000); // 12 months
    });
  });

  describe("calculateRequiredDeposit", () => {
    it("should find correct deposit for target amount", () => {
      // Find deposit needed for ₹1,00,000 in 12 months at 7%
      const deposit = calculateRequiredDeposit(100000, 7, 12, "quarterly");

      // Verify the deposit reaches the target
      const result = calculateRD(deposit, 7, 12, "quarterly");
      expect(result.maturityAmount).toBeGreaterThanOrEqual(100000);
      expect(result.maturityAmount).toBeLessThan(101000); // Should be close
    });

    it("should find deposit for larger targets", () => {
      // Target ₹5,00,000 in 24 months at 7.5%
      const deposit = calculateRequiredDeposit(500000, 7.5, 24, "quarterly");

      const result = calculateRD(deposit, 7.5, 24, "quarterly");
      expect(result.maturityAmount).toBeGreaterThanOrEqual(500000);
    });

    it("should handle different compounding frequencies", () => {
      const quarterlyDeposit = calculateRequiredDeposit(
        100000,
        7,
        12,
        "quarterly"
      );
      const monthlyDeposit = calculateRequiredDeposit(
        100000,
        7,
        12,
        "monthly"
      );

      // Both should find a valid deposit that reaches the target
      const quarterlyResult = calculateRD(quarterlyDeposit, 7, 12, "quarterly");
      const monthlyResult = calculateRD(monthlyDeposit, 7, 12, "monthly");

      expect(quarterlyResult.maturityAmount).toBeGreaterThanOrEqual(100000);
      expect(monthlyResult.maturityAmount).toBeGreaterThanOrEqual(100000);
    });

    it("should find deposit for long tenures", () => {
      // Target ₹10,00,000 in 60 months at 8%
      const deposit = calculateRequiredDeposit(1000000, 8, 60, "quarterly");

      const result = calculateRD(deposit, 8, 60, "quarterly");
      expect(result.maturityAmount).toBeGreaterThanOrEqual(1000000);
    });

    it("should return low when it already meets the target", () => {
      // Target a small amount that the minimum deposit (₹100) with high rate
      // over long tenure can exceed, triggering the `return low` branch
      // ₹100/month at 10% for 60 months gives ~₹7,744 maturity
      // So target ₹7,000 should be met by the low bound
      const deposit = calculateRequiredDeposit(7000, 10, 60, "quarterly");

      // The function should return a deposit that meets the target
      const result = calculateRD(deposit, 10, 60, "quarterly");
      expect(result.maturityAmount).toBeGreaterThanOrEqual(7000);
      // The deposit should be at or near the minimum (100)
      expect(deposit).toBeLessThanOrEqual(200);
    });
  });

  describe("getCompoundingLabel", () => {
    it('should return "Monthly" for monthly compounding', () => {
      expect(getCompoundingLabel("monthly")).toBe("Monthly");
    });

    it('should return "Quarterly" for quarterly compounding', () => {
      expect(getCompoundingLabel("quarterly")).toBe("Quarterly");
    });
  });
});
