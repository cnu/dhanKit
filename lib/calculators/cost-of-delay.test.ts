import {
  calculateCostOfDelay,
  calculateCostOfDelayBreakdown,
  getInflationAdjustedCost,
  getRealReturnRate,
  CostOfDelayResult,
  CostOfDelayBreakdown,
} from "./cost-of-delay";

describe("Cost of Delay Calculator", () => {
  describe("calculateCostOfDelay", () => {
    it("should calculate basic cost of delay correctly", () => {
      // ₹10,000/month at 12% return, age 25 to 60, 5 year delay
      const result = calculateCostOfDelay(10000, 12, 25, 60, 5);

      // Start now: 35 years of investing
      expect(result.startNowYears).toBe(35);
      // Start later: 30 years of investing
      expect(result.startLaterYears).toBe(30);

      // Cost should be positive and substantial
      expect(result.costOfDelay).toBeGreaterThan(0);
      expect(result.costOfDelay).toBe(
        result.startNowCorpus - result.startLaterCorpus
      );
    });

    it("should calculate correct invested amounts", () => {
      const result = calculateCostOfDelay(10000, 12, 25, 60, 5);

      // Start now: 35 years × 12 months × ₹10,000
      expect(result.startNowInvested).toBe(10000 * 12 * 35);
      // Start later: 30 years × 12 months × ₹10,000
      expect(result.startLaterInvested).toBe(10000 * 12 * 30);
    });

    it("should calculate missed investment correctly", () => {
      const result = calculateCostOfDelay(10000, 12, 25, 60, 5);

      // Missed: 5 years × 12 months × ₹10,000
      expect(result.missedInvestment).toBe(10000 * 12 * 5);
    });

    it("should calculate cost per day and month", () => {
      const result = calculateCostOfDelay(10000, 12, 25, 60, 5);

      const expectedCostPerDay = Math.round(result.costOfDelay / (5 * 365));
      const expectedCostPerMonth = Math.round(result.costOfDelay / (5 * 12));

      expect(result.costPerDay).toBe(expectedCostPerDay);
      expect(result.costPerMonth).toBe(expectedCostPerMonth);
    });

    it("should calculate percentage loss correctly", () => {
      const result = calculateCostOfDelay(10000, 12, 25, 60, 5);

      const expectedPercentage =
        (result.costOfDelay / result.startNowCorpus) * 100;
      expect(result.percentageLoss).toBeCloseTo(expectedPercentage, 5);
    });

    it("should calculate required SIP to match start now corpus", () => {
      const result = calculateCostOfDelay(10000, 12, 25, 60, 5);

      // Required SIP should be higher than original to catch up
      expect(result.requiredSIPToMatch).toBeGreaterThan(10000);

      // Additional SIP should be positive
      expect(result.additionalSIPNeeded).toBeGreaterThan(0);
      expect(result.additionalSIPPercent).toBeGreaterThan(0);
    });

    it("should handle step-up SIP option", () => {
      const withoutStepUp = calculateCostOfDelay(10000, 12, 25, 60, 5);
      const withStepUp = calculateCostOfDelay(10000, 12, 25, 60, 5, {
        stepUpEnabled: true,
        stepUpPercent: 10,
      });

      // Step-up should result in higher corpus for both scenarios
      expect(withStepUp.startNowCorpus).toBeGreaterThan(
        withoutStepUp.startNowCorpus
      );
      expect(withStepUp.startLaterCorpus).toBeGreaterThan(
        withoutStepUp.startLaterCorpus
      );
    });

    it("should handle different delay periods", () => {
      const delay3 = calculateCostOfDelay(10000, 12, 25, 60, 3);
      const delay5 = calculateCostOfDelay(10000, 12, 25, 60, 5);
      const delay10 = calculateCostOfDelay(10000, 12, 25, 60, 10);

      // Longer delay = higher cost
      expect(delay5.costOfDelay).toBeGreaterThan(delay3.costOfDelay);
      expect(delay10.costOfDelay).toBeGreaterThan(delay5.costOfDelay);
    });

    it("should handle minimum 1 year for delayed scenario", () => {
      // Very long delay that would result in 0 or negative years
      const result = calculateCostOfDelay(10000, 12, 55, 60, 10);

      // Should enforce minimum 1 year
      expect(result.startLaterYears).toBeGreaterThanOrEqual(1);
    });

    it("should handle high return rates", () => {
      const result = calculateCostOfDelay(10000, 20, 25, 60, 5);

      expect(result.costOfDelay).toBeGreaterThan(0);
      expect(result.startNowCorpus).toBeGreaterThan(result.startLaterCorpus);
    });

    it("should handle low return rates", () => {
      const result = calculateCostOfDelay(10000, 6, 25, 60, 5);

      expect(result.costOfDelay).toBeGreaterThan(0);
      expect(result.startNowCorpus).toBeGreaterThan(result.startLaterCorpus);
    });

    it("should return returns that match corpus minus invested", () => {
      const result = calculateCostOfDelay(10000, 12, 25, 60, 5);

      expect(result.startNowReturns).toBe(
        result.startNowCorpus - result.startNowInvested
      );
      expect(result.startLaterReturns).toBe(
        result.startLaterCorpus - result.startLaterInvested
      );
    });
  });

  describe("calculateCostOfDelayBreakdown", () => {
    it("should return correct number of entries", () => {
      const breakdown = calculateCostOfDelayBreakdown(10000, 12, 25, 60, 5);

      // Should have one entry per year from age 25 to 60 (35 years)
      expect(breakdown.length).toBe(35);
    });

    it("should track correct ages", () => {
      const breakdown = calculateCostOfDelayBreakdown(10000, 12, 25, 60, 5);

      expect(breakdown[0].year).toBe(1);
      expect(breakdown[0].age).toBe(26); // After year 1
      expect(breakdown[34].age).toBe(60);
    });

    it("should show zero value for delayed investor during delay period", () => {
      const breakdown = calculateCostOfDelayBreakdown(10000, 12, 25, 60, 5);

      // First 5 years, delayed investor has ₹0 invested
      for (let i = 0; i < 5; i++) {
        expect(breakdown[i].startLaterInvested).toBe(0);
      }
    });

    it("should show growing gap over time", () => {
      const breakdown = calculateCostOfDelayBreakdown(10000, 12, 25, 60, 5);

      // Gap should generally increase over time (after delay period)
      for (let i = 6; i < breakdown.length; i++) {
        expect(breakdown[i].cumulativeGap).toBeGreaterThan(0);
      }

      // Final gap should match cost of delay
      const lastEntry = breakdown[breakdown.length - 1];
      expect(lastEntry.cumulativeGap).toBeGreaterThan(0);
    });

    it("should match final values to calculateCostOfDelay result", () => {
      const breakdown = calculateCostOfDelayBreakdown(10000, 12, 25, 60, 5);
      const result = calculateCostOfDelay(10000, 12, 25, 60, 5);

      const lastEntry = breakdown[breakdown.length - 1];

      // Allow small rounding differences
      expect(lastEntry.startNowValue).toBeCloseTo(result.startNowCorpus, -2);
      expect(lastEntry.startLaterValue).toBeCloseTo(result.startLaterCorpus, -2);
    });

    it("should handle step-up SIP in breakdown", () => {
      const breakdown = calculateCostOfDelayBreakdown(10000, 12, 25, 60, 5, {
        stepUpEnabled: true,
        stepUpPercent: 10,
      });

      // Values should increase faster with step-up
      expect(breakdown.length).toBe(35);
      expect(breakdown[breakdown.length - 1].startNowValue).toBeGreaterThan(0);
    });

    it("should have increasing invested amounts for start now scenario", () => {
      const breakdown = calculateCostOfDelayBreakdown(10000, 12, 25, 60, 5);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].startNowInvested).toBeGreaterThan(
          breakdown[i - 1].startNowInvested
        );
      }
    });

    it("should have increasing values for both scenarios after delay", () => {
      const breakdown = calculateCostOfDelayBreakdown(10000, 12, 25, 60, 5);

      // After delay period (year 5), both should grow
      for (let i = 6; i < breakdown.length; i++) {
        expect(breakdown[i].startNowValue).toBeGreaterThan(
          breakdown[i - 1].startNowValue
        );
        expect(breakdown[i].startLaterValue).toBeGreaterThan(
          breakdown[i - 1].startLaterValue
        );
      }
    });
  });

  describe("getInflationAdjustedCost", () => {
    it("should reduce cost for future value to present value", () => {
      const nominalCost = 1000000;
      const years = 10;
      const inflationRate = 6;

      const adjustedCost = getInflationAdjustedCost(
        nominalCost,
        years,
        inflationRate
      );

      // Present value should be less than nominal
      expect(adjustedCost).toBeLessThan(nominalCost);
    });

    it("should calculate correct inflation adjustment", () => {
      const nominalCost = 1000000;
      const years = 10;
      const inflationRate = 6;

      const adjustedCost = getInflationAdjustedCost(
        nominalCost,
        years,
        inflationRate
      );
      const expected = nominalCost / Math.pow(1 + 0.06, 10);

      expect(adjustedCost).toBeCloseTo(expected, 2);
    });

    it("should return same value for 0% inflation", () => {
      const nominalCost = 1000000;
      const adjustedCost = getInflationAdjustedCost(nominalCost, 10, 0);

      expect(adjustedCost).toBe(nominalCost);
    });

    it("should handle high inflation rates", () => {
      const nominalCost = 1000000;
      const adjustedCost = getInflationAdjustedCost(nominalCost, 20, 10);

      // With 10% inflation over 20 years, value should be significantly reduced
      expect(adjustedCost).toBeLessThan(nominalCost / 5);
    });
  });

  describe("getRealReturnRate", () => {
    it("should calculate positive real return when nominal > inflation", () => {
      const realRate = getRealReturnRate(12, 6);

      expect(realRate).toBeGreaterThan(0);
      // Real rate ≈ (1.12/1.06 - 1) × 100 ≈ 5.66%
      expect(realRate).toBeCloseTo(5.66, 1);
    });

    it("should calculate negative real return when nominal < inflation", () => {
      const realRate = getRealReturnRate(4, 6);

      expect(realRate).toBeLessThan(0);
    });

    it("should return approximately zero when nominal equals inflation", () => {
      const realRate = getRealReturnRate(6, 6);

      expect(realRate).toBeCloseTo(0, 5);
    });

    it("should handle high nominal rates", () => {
      const realRate = getRealReturnRate(20, 6);

      // (1.20/1.06 - 1) × 100 ≈ 13.21%
      expect(realRate).toBeCloseTo(13.21, 1);
    });

    it("should handle Fisher equation correctly", () => {
      // Fisher equation: (1 + r_real) = (1 + r_nominal) / (1 + r_inflation)
      const nominalRate = 10;
      const inflationRate = 5;
      const realRate = getRealReturnRate(nominalRate, inflationRate);

      const expected =
        ((1 + nominalRate / 100) / (1 + inflationRate / 100) - 1) * 100;
      expect(realRate).toBeCloseTo(expected, 5);
    });
  });
});
