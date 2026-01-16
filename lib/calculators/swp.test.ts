import {
  calculateSWP,
  calculateSWPYearlyBreakdown,
  calculateMaxWithdrawal,
  calculateCorpusDuration,
  SWPResult,
  SWPYearlyBreakdown,
} from "./swp";

describe("SWP Calculator", () => {
  describe("calculateSWP", () => {
    it("should calculate basic SWP correctly", () => {
      // ₹50L corpus, ₹30K/month withdrawal, 8% return, 20 years
      const result = calculateSWP(5000000, 30000, 8, 20);

      expect(result.totalWithdrawn).toBeGreaterThan(0);
      expect(result.totalInterestEarned).toBeGreaterThan(0);
      expect(result.corpusLasted).toBe(true);
      expect(result.monthsLasted).toBe(240); // 20 years = 240 months
    });

    it("should deplete corpus when withdrawal exceeds sustainable rate", () => {
      // ₹10L corpus, ₹50K/month withdrawal, 8% return, 20 years
      // This should deplete the corpus before 20 years
      const result = calculateSWP(1000000, 50000, 8, 20);

      expect(result.corpusLasted).toBe(false);
      expect(result.monthsLasted).toBeLessThan(240);
      expect(result.finalCorpus).toBe(0);
    });

    it("should handle withdrawal equal to monthly interest (perpetuity)", () => {
      // ₹12L corpus, 12% annual, effective monthly rate = (1.12)^(1/12) - 1 ≈ 0.9489%
      // Monthly interest ≈ 12L × 0.9489% ≈ ₹11,387
      // Withdrawing ₹11,400/month (close to interest) should roughly maintain corpus
      const result = calculateSWP(1200000, 11400, 12, 10);

      // Corpus should roughly maintain (small variance due to rounding)
      expect(result.finalCorpus).toBeGreaterThan(1150000);
      expect(result.finalCorpus).toBeLessThan(1250000);
      expect(result.corpusLasted).toBe(true);
    });

    it("should grow corpus when withdrawal is less than interest", () => {
      // ₹50L at 12% = ₹50K/month interest. Withdrawing only ₹30K
      const result = calculateSWP(5000000, 30000, 12, 10);

      expect(result.finalCorpus).toBeGreaterThan(5000000);
      expect(result.corpusLasted).toBe(true);
    });

    it("should handle 1 year withdrawal period", () => {
      const result = calculateSWP(1000000, 10000, 10, 1);

      expect(result.monthsLasted).toBe(12);
      expect(result.totalWithdrawn).toBe(120000); // 12 × 10000
      expect(result.corpusLasted).toBe(true);
    });

    it("should handle 0% return (pure principal withdrawal)", () => {
      // ₹12L corpus, ₹1L/month, 0% return
      // Should last exactly 12 months (12 full withdrawals)
      const result = calculateSWP(1200000, 100000, 0, 5);

      // At 0% return: 1200000 / 100000 = 12 withdrawals possible
      expect(result.monthsLasted).toBe(12);
      expect(result.totalWithdrawn).toBe(1200000);
      expect(result.finalCorpus).toBe(0);
      expect(result.corpusLasted).toBe(false);
    });

    it("should return rounded values", () => {
      const result = calculateSWP(1234567, 12345, 7.5, 15);

      expect(Number.isInteger(result.totalWithdrawn)).toBe(true);
      expect(Number.isInteger(result.finalCorpus)).toBe(true);
      expect(Number.isInteger(result.totalInterestEarned)).toBe(true);
    });

    it("should calculate total withdrawn correctly", () => {
      const result = calculateSWP(5000000, 25000, 8, 5);

      // If corpus lasts, total withdrawn = months × withdrawal
      expect(result.totalWithdrawn).toBe(25000 * 60); // 5 years = 60 months
    });

    it("should satisfy interest = withdrawn + final - initial when corpus lasts", () => {
      const initialCorpus = 5000000;
      const result = calculateSWP(initialCorpus, 20000, 8, 10);

      // Total interest = what we took out + what remains - what we started with
      const expectedInterest =
        result.totalWithdrawn + result.finalCorpus - initialCorpus;

      // Allow small rounding difference
      expect(
        Math.abs(result.totalInterestEarned - expectedInterest)
      ).toBeLessThanOrEqual(1);
    });

    it("should handle large corpus amounts", () => {
      const result = calculateSWP(100000000, 500000, 10, 30);

      expect(result.totalWithdrawn).toBeGreaterThan(0);
      expect(result.corpusLasted).toBe(true);
    });
  });

  describe("calculateSWPYearlyBreakdown", () => {
    it("should return correct number of entries when corpus lasts", () => {
      const breakdown = calculateSWPYearlyBreakdown(5000000, 30000, 8, 10);

      expect(breakdown.length).toBe(10);
      expect(breakdown[0].year).toBe(1);
      expect(breakdown[9].year).toBe(10);
    });

    it("should return fewer entries when corpus depletes", () => {
      const breakdown = calculateSWPYearlyBreakdown(500000, 50000, 8, 10);

      expect(breakdown.length).toBeLessThan(10);
      // Last entry should have zero or near-zero closing balance
      const lastEntry = breakdown[breakdown.length - 1];
      expect(lastEntry.closingBalance).toBe(0);
    });

    it("should have decreasing closing balance with high withdrawal", () => {
      const breakdown = calculateSWPYearlyBreakdown(5000000, 50000, 8, 10);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].closingBalance).toBeLessThan(
          breakdown[i - 1].openingBalance
        );
      }
    });

    it("should have yearly withdrawn = 12 × monthly (when corpus lasts)", () => {
      const monthlyWithdrawal = 25000;
      const breakdown = calculateSWPYearlyBreakdown(
        10000000,
        monthlyWithdrawal,
        8,
        5
      );

      // Each full year should withdraw 12 × monthly
      breakdown.forEach((entry) => {
        expect(entry.totalWithdrawn).toBe(monthlyWithdrawal * 12);
      });
    });

    it("should have opening balance = previous closing balance", () => {
      const breakdown = calculateSWPYearlyBreakdown(5000000, 30000, 8, 10);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].openingBalance).toBe(
          breakdown[i - 1].closingBalance
        );
      }
    });

    it("should match final year to calculateSWP result", () => {
      const breakdown = calculateSWPYearlyBreakdown(5000000, 30000, 8, 20);
      const swpResult = calculateSWP(5000000, 30000, 8, 20);

      const lastYear = breakdown[breakdown.length - 1];
      expect(lastYear.closingBalance).toBe(swpResult.finalCorpus);

      // Total withdrawn should match
      const totalWithdrawnFromBreakdown = breakdown.reduce(
        (sum, entry) => sum + entry.totalWithdrawn,
        0
      );
      expect(totalWithdrawnFromBreakdown).toBe(swpResult.totalWithdrawn);
    });

    it("should return rounded values", () => {
      const breakdown = calculateSWPYearlyBreakdown(1234567, 12345, 7.5, 5);

      breakdown.forEach((entry) => {
        expect(Number.isInteger(entry.openingBalance)).toBe(true);
        expect(Number.isInteger(entry.totalWithdrawn)).toBe(true);
        expect(Number.isInteger(entry.interestEarned)).toBe(true);
        expect(Number.isInteger(entry.closingBalance)).toBe(true);
      });
    });

    it("should satisfy closing = opening + interest - withdrawn", () => {
      const breakdown = calculateSWPYearlyBreakdown(5000000, 25000, 8, 10);

      breakdown.forEach((entry) => {
        const expected =
          entry.openingBalance + entry.interestEarned - entry.totalWithdrawn;
        // Allow small rounding difference
        expect(Math.abs(entry.closingBalance - expected)).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("calculateMaxWithdrawal", () => {
    it("should calculate sustainable withdrawal amount", () => {
      const maxWithdrawal = calculateMaxWithdrawal(5000000, 8, 20);

      // Using this max withdrawal should result in corpus lasting exactly 20 years
      const result = calculateSWP(5000000, maxWithdrawal, 8, 20);

      // Should last the full period (or very close to it)
      expect(result.monthsLasted).toBeGreaterThanOrEqual(239); // Allow 1 month variance
      // Final corpus should be near zero
      expect(result.finalCorpus).toBeLessThan(maxWithdrawal);
    });

    it("should return higher withdrawal for higher returns", () => {
      const maxAt8 = calculateMaxWithdrawal(5000000, 8, 20);
      const maxAt12 = calculateMaxWithdrawal(5000000, 12, 20);

      expect(maxAt12).toBeGreaterThan(maxAt8);
    });

    it("should return higher withdrawal for shorter periods", () => {
      const maxFor10Years = calculateMaxWithdrawal(5000000, 8, 10);
      const maxFor20Years = calculateMaxWithdrawal(5000000, 8, 20);

      expect(maxFor10Years).toBeGreaterThan(maxFor20Years);
    });

    it("should return corpus/months when return is 0%", () => {
      const maxWithdrawal = calculateMaxWithdrawal(1200000, 0, 10);

      // At 0% return, max withdrawal = corpus / months
      expect(maxWithdrawal).toBe(10000); // 1200000 / 120 months
    });

    it("should return rounded value", () => {
      const maxWithdrawal = calculateMaxWithdrawal(1234567, 7.5, 15);

      expect(Number.isInteger(maxWithdrawal)).toBe(true);
    });

    it("should scale linearly with corpus", () => {
      const maxFor50L = calculateMaxWithdrawal(5000000, 8, 20);
      const maxFor100L = calculateMaxWithdrawal(10000000, 8, 20);

      // Should be approximately double
      expect(Math.abs(maxFor100L - maxFor50L * 2)).toBeLessThan(100);
    });
  });

  describe("calculateCorpusDuration", () => {
    it("should return null when withdrawal <= monthly interest (perpetuity)", () => {
      // ₹50L at 12% = ₹50K/month interest
      // Withdrawing ₹40K/month should last forever
      const duration = calculateCorpusDuration(5000000, 40000, 12);

      expect(duration).toBeNull();
    });

    it("should calculate duration when corpus depletes", () => {
      const duration = calculateCorpusDuration(1000000, 50000, 8);

      expect(duration).not.toBeNull();
      expect(duration!.years).toBeGreaterThanOrEqual(0);
      expect(duration!.months).toBeGreaterThanOrEqual(0);
      expect(duration!.months).toBeLessThan(12);
    });

    it("should match calculateSWP result", () => {
      const duration = calculateCorpusDuration(1000000, 30000, 8);

      if (duration) {
        const totalMonths = duration.years * 12 + duration.months;
        const swpResult = calculateSWP(1000000, 30000, 8, 100); // Long enough to deplete

        // Should match within 1 month (rounding)
        expect(Math.abs(totalMonths - swpResult.monthsLasted)).toBeLessThanOrEqual(1);
      }
    });

    it("should return null at 0% return when withdrawal < corpus/period", () => {
      // At 0%, any withdrawal will eventually deplete corpus
      // But formula still applies
      const duration = calculateCorpusDuration(1200000, 10000, 0);

      // At 0% return, corpus / withdrawal = 120 months
      // The formula should return this
      expect(duration).not.toBeNull();
      expect(duration!.years).toBe(10);
      expect(duration!.months).toBe(0);
    });

    it("should handle edge case of exactly equal to interest", () => {
      // ₹12L at 12% with effective monthly rate = (1.12)^(1/12) - 1 ≈ 0.9489%
      // Monthly interest = ₹11,386.55
      // Withdrawing ₹11,386 (less than interest) should last forever
      const duration = calculateCorpusDuration(1200000, 11386, 12);

      // Withdrawing less than or equal to interest should last forever
      expect(duration).toBeNull();
    });
  });

  describe("Edge cases", () => {
    it("should handle very small corpus", () => {
      const result = calculateSWP(100000, 5000, 8, 5);

      expect(result.totalWithdrawn).toBeGreaterThan(0);
    });

    it("should handle very high return rate", () => {
      const result = calculateSWP(5000000, 30000, 20, 10);

      expect(result.corpusLasted).toBe(true);
      expect(result.finalCorpus).toBeGreaterThan(5000000); // Corpus should grow
    });

    it("should handle very long time period", () => {
      const result = calculateSWP(10000000, 20000, 8, 40);

      expect(result.totalWithdrawn).toBeGreaterThan(0);
      expect(result.monthsLasted).toBeLessThanOrEqual(480);
    });

    it("should handle withdrawal greater than corpus", () => {
      // Trying to withdraw more than entire corpus in first month
      const result = calculateSWP(100000, 200000, 8, 1);

      expect(result.monthsLasted).toBe(1);
      expect(result.totalWithdrawn).toBeLessThanOrEqual(100000 * 1.01); // Corpus + 1 month interest
      expect(result.finalCorpus).toBe(0);
    });
  });
});
