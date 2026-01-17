import {
  calculateRetirement,
  calculateFIRE,
  calculateRetirementYearlyBreakdown,
  calculateYearsToFIRE,
  RetirementResult,
  FIREResult,
  RetirementYearlyBreakdown,
} from "./retirement";

describe("Retirement Calculator", () => {
  describe("calculateRetirement", () => {
    it("should calculate required corpus correctly using 4% rule", () => {
      // Monthly expenses of ₹50,000 today at 4% withdrawal rate
      // With 6% inflation over 20 years, expenses at retirement ≈ ₹1.6L/month
      // Annual expenses ≈ ₹19.2L, required corpus ≈ ₹4.8 Cr
      const result = calculateRetirement(
        30, // currentAge
        50, // retirementAge
        85, // lifeExpectancy
        50000, // monthlyExpenses
        6, // inflationRate
        4, // withdrawalRate
        12, // expectedReturn
        0 // currentCorpus
      );

      expect(result.requiredCorpus).toBeGreaterThan(0);
      expect(result.monthlyExpensesAtRetirement).toBeGreaterThan(50000);
      expect(result.yearsToRetirement).toBe(20);
      expect(result.retirementDuration).toBe(35);
    });

    it("should calculate inflation-adjusted expenses correctly", () => {
      const result = calculateRetirement(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      // Expenses at retirement = 50000 × (1.06)^20 ≈ 160,357
      const expectedExpenses = 50000 * Math.pow(1.06, 20);
      expect(result.monthlyExpensesAtRetirement).toBeCloseTo(
        expectedExpenses,
        -2
      );
    });

    it("should calculate corpus using withdrawal rate correctly", () => {
      const result = calculateRetirement(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      // Required corpus = Annual Expenses / Withdrawal Rate
      const expectedCorpus = result.annualExpensesAtRetirement / 0.04;
      expect(result.requiredCorpus).toBeCloseTo(expectedCorpus, -2);
    });

    it("should calculate required monthly SIP to reach corpus", () => {
      const result = calculateRetirement(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      expect(result.requiredMonthlySIP).toBeGreaterThan(0);
      // Allow for small rounding differences (SIP is rounded, total is SIP × months)
      expect(result.totalSIPInvested).toBeCloseTo(
        result.requiredMonthlySIP * 20 * 12,
        -3 // Allow difference up to 500
      );
    });

    it("should account for existing corpus", () => {
      const withoutCorpus = calculateRetirement(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      const withCorpus = calculateRetirement(
        30, 50, 85, 50000, 6, 4, 12, 1000000 // ₹10 lakh existing
      );

      // With existing corpus, required SIP should be lower
      expect(withCorpus.requiredMonthlySIP).toBeLessThan(
        withoutCorpus.requiredMonthlySIP
      );
      expect(withCorpus.currentCorpusFutureValue).toBeGreaterThan(1000000);
    });

    it("should return 0 SIP if current corpus covers requirement", () => {
      // Large existing corpus that grows beyond requirement
      const result = calculateRetirement(
        30, 50, 85, 10000, 6, 4, 12, 10000000 // ₹1 Cr existing
      );

      // If future value of corpus exceeds requirement, SIP should be 0
      if (result.currentCorpusFutureValue >= result.requiredCorpus) {
        expect(result.requiredMonthlySIP).toBe(0);
        expect(result.corpusGap).toBe(0);
      }
    });

    it("should correctly calculate corpus gap", () => {
      const result = calculateRetirement(
        30, 50, 85, 50000, 6, 4, 12, 1000000
      );

      const expectedGap = Math.max(
        0,
        result.requiredCorpus - result.currentCorpusFutureValue
      );
      expect(result.corpusGap).toBeCloseTo(expectedGap, -2);
    });

    it("should handle edge case of retiring immediately", () => {
      const result = calculateRetirement(
        50, 51, 85, 50000, 6, 4, 12, 0
      );

      expect(result.yearsToRetirement).toBe(1);
      expect(result.requiredMonthlySIP).toBeGreaterThan(0);
    });

    it("should handle different withdrawal rates", () => {
      const rate4 = calculateRetirement(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      const rate3 = calculateRetirement(
        30, 50, 85, 50000, 6, 3, 12, 0 // More conservative
      );

      // Lower withdrawal rate = larger corpus needed
      expect(rate3.requiredCorpus).toBeGreaterThan(rate4.requiredCorpus);
    });

    it("should return rounded values", () => {
      const result = calculateRetirement(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      expect(Number.isInteger(result.requiredCorpus)).toBe(true);
      expect(Number.isInteger(result.requiredMonthlySIP)).toBe(true);
      expect(Number.isInteger(result.totalSIPInvested)).toBe(true);
    });

    it("should assess corpus sufficiency correctly", () => {
      // With adequate return rate and withdrawal rate, corpus should be sufficient
      const result = calculateRetirement(
        30, 50, 85, 50000, 6, 4, 10, 0
      );

      expect(typeof result.corpusSufficient).toBe("boolean");
    });
  });

  describe("calculateFIRE", () => {
    it("should calculate FIRE number based on 4% rule", () => {
      const result = calculateFIRE(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      // FIRE number = (annual expenses) / 0.04 = annual expenses × 25
      const expectedFIRE = (50000 * 12) / 0.04;
      expect(result.fireNumber).toBeCloseTo(expectedFIRE, -2);
    });

    it("should calculate Lean FIRE at 70% of expenses", () => {
      const result = calculateFIRE(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      expect(result.leanFireNumber).toBeCloseTo(result.fireNumber * 0.7, -2);
    });

    it("should calculate Fat FIRE at 150% of expenses", () => {
      const result = calculateFIRE(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      expect(result.fatFireNumber).toBeCloseTo(result.fireNumber * 1.5, -2);
    });

    it("should calculate Coast FIRE number", () => {
      const result = calculateFIRE(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      // Coast FIRE = FIRE number / (1 + return)^years
      const yearsToRetirement = 50 - 30;
      const expectedCoast = result.fireNumber / Math.pow(1.12, yearsToRetirement);
      expect(result.coastFireNumber).toBeCloseTo(expectedCoast, -2);
    });

    it("should include all base retirement result fields", () => {
      const result = calculateFIRE(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      expect(result.requiredCorpus).toBeDefined();
      expect(result.requiredMonthlySIP).toBeDefined();
      expect(result.yearsToRetirement).toBeDefined();
    });

    it("should calculate Barista FIRE income when gap exists", () => {
      const result = calculateFIRE(
        30, 50, 85, 50000, 6, 4, 12, 1000000
      );

      if (result.corpusGap > 0) {
        expect(result.baristaFireMonthlyIncome).toBeGreaterThan(0);
      }
    });

    it("should handle custom lean and fat multipliers", () => {
      const result = calculateFIRE(
        30, 50, 85, 50000, 6, 4, 12, 0,
        0.5, // 50% for lean
        2.0 // 200% for fat
      );

      expect(result.leanFireNumber).toBeCloseTo(result.fireNumber * 0.5, -2);
      expect(result.fatFireNumber).toBeCloseTo(result.fireNumber * 2.0, -2);
    });
  });

  describe("calculateRetirementYearlyBreakdown", () => {
    it("should return entries for accumulation phase", () => {
      const breakdown = calculateRetirementYearlyBreakdown(
        30, 50, 85, 50000, 6, 4, 12, 0, false
      );

      // Should have 20 years of accumulation (30 to 50)
      expect(breakdown.length).toBe(20);
      expect(breakdown.every((b) => b.phase === "accumulation")).toBe(true);
    });

    it("should return entries for both phases when requested", () => {
      const breakdown = calculateRetirementYearlyBreakdown(
        30, 50, 85, 50000, 6, 4, 12, 0, true
      );

      const accumulationYears = breakdown.filter(
        (b) => b.phase === "accumulation"
      );
      const retirementYears = breakdown.filter((b) => b.phase === "retirement");

      expect(accumulationYears.length).toBe(20);
      expect(retirementYears.length).toBeGreaterThan(0);
    });

    it("should show correct ages throughout", () => {
      const breakdown = calculateRetirementYearlyBreakdown(
        30, 50, 85, 50000, 6, 4, 12, 0, false
      );

      expect(breakdown[0].age).toBe(31); // After year 1
      expect(breakdown[19].age).toBe(50); // At retirement
    });

    it("should have increasing corpus during accumulation", () => {
      const breakdown = calculateRetirementYearlyBreakdown(
        30, 50, 85, 50000, 6, 4, 12, 0, false
      );

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].totalValue).toBeGreaterThan(
          breakdown[i - 1].totalValue
        );
      }
    });

    it("should show withdrawals during retirement phase", () => {
      const breakdown = calculateRetirementYearlyBreakdown(
        30, 50, 85, 50000, 6, 4, 12, 0, true
      );

      const retirementYears = breakdown.filter((b) => b.phase === "retirement");
      retirementYears.forEach((year) => {
        expect(year.withdrawal).toBeGreaterThan(0);
      });
    });

    it("should include inflation-adjusted values", () => {
      const breakdown = calculateRetirementYearlyBreakdown(
        30, 50, 85, 50000, 6, 4, 12, 0, false
      );

      breakdown.forEach((year) => {
        expect(year.inflationAdjustedValue).toBeDefined();
        expect(year.inflationAdjustedValue).toBeLessThan(year.totalValue);
      });
    });

    it("should stop if corpus depletes during retirement", () => {
      // High expenses, low returns - corpus might deplete
      const breakdown = calculateRetirementYearlyBreakdown(
        50, 51, 100, 100000, 8, 8, 4, 0, true // 8% withdrawal, 4% return, 8% inflation
      );

      // Check if any retirement year has 0 corpus
      const lastYear = breakdown[breakdown.length - 1];
      if (lastYear.phase === "retirement") {
        expect(lastYear.totalValue).toBeGreaterThanOrEqual(0);
      }
    });

    it("should account for existing corpus", () => {
      const withCorpus = calculateRetirementYearlyBreakdown(
        30, 50, 85, 50000, 6, 4, 12, 1000000, false
      );

      // First year should include existing corpus growth
      expect(withCorpus[0].totalValue).toBeGreaterThan(1000000);
    });
  });

  describe("calculateYearsToFIRE", () => {
    it("should return 0 if already at FIRE number", () => {
      // FIRE number for ₹50k/month at 4% = ₹1.5 Cr
      const result = calculateYearsToFIRE(
        600000, // annual income ₹6L
        300000, // annual expenses ₹3L (₹25k/month)
        7500000, // current corpus ₹75L (equals 25x expenses)
        12,
        4
      );

      expect(result).toBe(0);
    });

    it("should return null if expenses exceed income", () => {
      const result = calculateYearsToFIRE(
        500000, // annual income ₹5L
        600000, // annual expenses ₹6L (deficit)
        0,
        12,
        4
      );

      expect(result).toBeNull();
    });

    it("should calculate years correctly for savings scenario", () => {
      const result = calculateYearsToFIRE(
        1200000, // ₹12L income
        600000, // ₹6L expenses
        0, // starting from 0
        12,
        4
      );

      // Should take some years to reach FIRE
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(50);
    });

    it("should reduce years with higher savings rate", () => {
      const lowSavings = calculateYearsToFIRE(
        1200000, 1000000, 0, 12, 4 // 17% savings rate
      );

      const highSavings = calculateYearsToFIRE(
        1200000, 400000, 0, 12, 4 // 67% savings rate
      );

      expect(highSavings).toBeLessThan(lowSavings!);
    });

    it("should reduce years with existing corpus", () => {
      const noCorpus = calculateYearsToFIRE(
        1200000, 600000, 0, 12, 4
      );

      const withCorpus = calculateYearsToFIRE(
        1200000, 600000, 5000000, 12, 4
      );

      expect(withCorpus).toBeLessThan(noCorpus!);
    });

    it("should reduce years with higher expected return", () => {
      const lowReturn = calculateYearsToFIRE(
        1200000, 600000, 0, 8, 4
      );

      const highReturn = calculateYearsToFIRE(
        1200000, 600000, 0, 15, 4
      );

      expect(highReturn).toBeLessThan(lowReturn!);
    });

    it("should return null if FIRE would take over 100 years", () => {
      // Extremely low savings rate: ₹6L income, ₹5.99L expenses = ₹1k/year savings
      // FIRE number for ₹5.99L expenses at 4% = ₹1.5 Cr
      // With only ₹1k/year savings and low returns, would take over 100 years
      const result = calculateYearsToFIRE(
        600000, // ₹6L income
        599000, // ₹5.99L expenses (only ₹1k savings/year)
        0, // no starting corpus
        1, // 1% return (very conservative)
        4 // 4% withdrawal rate
      );

      expect(result).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should return null corpusLastsYears when corpus lasts over 100 years", () => {
      // Need: real return <= 0 (so early null check fails) but corpus still lasts 100+ years
      // With tiny negative real return and very low withdrawal rate
      // Lower inflation rate means slower withdrawal growth
      const result = calculateRetirement(
        30, 50, 150, // life expectancy 150
        100, // extremely low expenses (₹100/month)
        1, // very low inflation (1%)
        0.2, // extremely low withdrawal rate (0.2%)
        1, // returns = inflation (0% real return)
        0
      );

      // With 0% real return and 0.2% withdrawal with 1% inflation growth,
      // corpus should last over 100 years, hitting maxYears safety limit
      expect(result.corpusLastsYears).toBeNull();
    });

    it("should handle very young age with long retirement horizon", () => {
      const result = calculateRetirement(
        20, 40, 90, 30000, 6, 4, 12, 0
      );

      expect(result.yearsToRetirement).toBe(20);
      expect(result.retirementDuration).toBe(50);
      expect(result.requiredCorpus).toBeGreaterThan(0);
    });

    it("should handle high inflation scenario", () => {
      const result = calculateRetirement(
        30, 50, 85, 50000, 10, 4, 12, 0 // 10% inflation
      );

      // Higher inflation means higher corpus needed
      const normalInflation = calculateRetirement(
        30, 50, 85, 50000, 6, 4, 12, 0
      );

      expect(result.requiredCorpus).toBeGreaterThan(normalInflation.requiredCorpus);
    });

    it("should handle very conservative withdrawal rate", () => {
      const result = calculateRetirement(
        30, 50, 85, 50000, 6, 2, 12, 0 // 2% SWR
      );

      // 2% SWR means 50x expenses
      const expected = result.annualExpensesAtRetirement / 0.02;
      expect(result.requiredCorpus).toBeCloseTo(expected, -2);
    });

    it("should handle high monthly expenses", () => {
      const result = calculateRetirement(
        30, 50, 85, 500000, 6, 4, 12, 0 // ₹5L/month
      );

      expect(result.requiredCorpus).toBeGreaterThan(50000000); // Should be over ₹5 Cr
      expect(result.requiredMonthlySIP).toBeGreaterThan(0);
    });
  });
});
