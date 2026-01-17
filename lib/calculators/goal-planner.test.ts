import {
  calculateGoalPlanner,
  calculateGoalPlannerYearlyBreakdown,
  calculateStepUpGoalPlanner,
  calculateStepUpGoalPlannerYearlyBreakdown,
  GoalPlannerResult,
  StepUpGoalPlannerResult,
  GoalPlannerYearlyBreakdown,
} from "./goal-planner";
import { calculateSIP, calculateStepUpSIP } from "./sip";

describe("Goal Planner Calculator", () => {
  describe("calculateGoalPlanner", () => {
    it("should calculate required SIP to reach target correctly", () => {
      // Target ₹50,00,000 in 10 years at 12% return
      const result = calculateGoalPlanner(5000000, 12, 10);

      expect(result.targetAmount).toBe(5000000);
      expect(result.requiredMonthlySIP).toBeGreaterThan(0);
      expect(result.totalInvested).toBeGreaterThan(0);
      expect(result.totalReturns).toBeGreaterThan(0);
    });

    it("should have totalInvested + totalReturns equal targetAmount", () => {
      const result = calculateGoalPlanner(5000000, 12, 10);

      // Allow for small rounding differences
      expect(result.totalInvested + result.totalReturns).toBeCloseTo(
        result.targetAmount,
        -2
      );
    });

    it("should be inverse of SIP calculation", () => {
      // If we invest the calculated SIP, we should get back the target amount
      const target = 5000000;
      const rate = 12;
      const years = 10;

      const goalResult = calculateGoalPlanner(target, rate, years);
      const sipResult = calculateSIP(goalResult.requiredMonthlySIP, rate, years);

      // SIP maturity should be close to the target (within rounding)
      expect(sipResult.maturityAmount).toBeCloseTo(target, -2);
    });

    it("should calculate higher SIP for larger targets", () => {
      const result1 = calculateGoalPlanner(1000000, 12, 10);
      const result2 = calculateGoalPlanner(5000000, 12, 10);

      expect(result2.requiredMonthlySIP).toBeGreaterThan(
        result1.requiredMonthlySIP
      );
    });

    it("should calculate lower SIP for longer duration", () => {
      const result10years = calculateGoalPlanner(5000000, 12, 10);
      const result20years = calculateGoalPlanner(5000000, 12, 20);

      expect(result20years.requiredMonthlySIP).toBeLessThan(
        result10years.requiredMonthlySIP
      );
    });

    it("should calculate lower SIP for higher returns", () => {
      const resultLowReturn = calculateGoalPlanner(5000000, 8, 10);
      const resultHighReturn = calculateGoalPlanner(5000000, 15, 10);

      expect(resultHighReturn.requiredMonthlySIP).toBeLessThan(
        resultLowReturn.requiredMonthlySIP
      );
    });

    it("should return rounded values", () => {
      const result = calculateGoalPlanner(5000000, 12, 10);

      expect(Number.isInteger(result.requiredMonthlySIP)).toBe(true);
      expect(Number.isInteger(result.totalInvested)).toBe(true);
      expect(Number.isInteger(result.totalReturns)).toBe(true);
    });

    it("should handle ₹1 crore target", () => {
      const result = calculateGoalPlanner(10000000, 12, 15);

      expect(result.requiredMonthlySIP).toBeGreaterThan(0);
      expect(result.requiredMonthlySIP).toBeLessThan(10000000); // Should be reasonable
    });

    it("should handle short duration", () => {
      const result = calculateGoalPlanner(100000, 12, 1);

      // For 1 year, monthly SIP should be close to target/12 (slightly less due to returns)
      expect(result.requiredMonthlySIP).toBeLessThan(100000 / 12);
      expect(result.requiredMonthlySIP).toBeGreaterThan(7000);
    });

    it("should handle very low returns", () => {
      const result = calculateGoalPlanner(1200000, 1, 10);

      // At 1% return, SIP should be somewhat less than target / (years × 12) due to returns
      expect(result.requiredMonthlySIP).toBeLessThan(10000);
      expect(result.requiredMonthlySIP).toBeGreaterThan(9000);
    });
  });

  describe("calculateGoalPlannerYearlyBreakdown", () => {
    it("should return correct number of entries", () => {
      const breakdown = calculateGoalPlannerYearlyBreakdown(5000000, 12, 10);

      expect(breakdown.length).toBe(10);
      expect(breakdown[0].year).toBe(1);
      expect(breakdown[9].year).toBe(10);
    });

    it("should have increasing values each year", () => {
      const breakdown = calculateGoalPlannerYearlyBreakdown(5000000, 12, 10);

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].invested).toBeGreaterThan(breakdown[i - 1].invested);
        expect(breakdown[i].totalValue).toBeGreaterThan(
          breakdown[i - 1].totalValue
        );
      }
    });

    it("should match final year to target amount", () => {
      const target = 5000000;
      const breakdown = calculateGoalPlannerYearlyBreakdown(target, 12, 10);

      const lastYear = breakdown[breakdown.length - 1];
      expect(lastYear.totalValue).toBeCloseTo(target, -2);
    });

    it("should match calculateGoalPlanner result", () => {
      const target = 5000000;
      const result = calculateGoalPlanner(target, 12, 10);
      const breakdown = calculateGoalPlannerYearlyBreakdown(target, 12, 10);

      const lastYear = breakdown[breakdown.length - 1];
      // Allow small rounding differences due to rounding requiredMonthlySIP
      expect(lastYear.invested).toBeCloseTo(result.totalInvested, -2);
    });

    it("should correctly calculate yearly invested amounts", () => {
      const result = calculateGoalPlanner(5000000, 12, 10);
      const breakdown = calculateGoalPlannerYearlyBreakdown(5000000, 12, 10);

      // Year 1 invested should be requiredSIP × 12
      expect(breakdown[0].invested).toBe(result.requiredMonthlySIP * 12);
      // Year 2 invested should be requiredSIP × 24
      expect(breakdown[1].invested).toBe(result.requiredMonthlySIP * 24);
    });

    it("should have interest equal to totalValue minus invested", () => {
      const breakdown = calculateGoalPlannerYearlyBreakdown(5000000, 12, 10);

      breakdown.forEach((entry) => {
        // Allow for rounding differences
        expect(
          Math.abs(entry.interest - (entry.totalValue - entry.invested))
        ).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("calculateStepUpGoalPlanner", () => {
    it("should calculate lower starting SIP than regular goal planner", () => {
      const regular = calculateGoalPlanner(5000000, 12, 10);
      const stepUp = calculateStepUpGoalPlanner(5000000, 12, 10, 10);

      // With step-up, starting SIP should be lower
      expect(stepUp.requiredMonthlySIP).toBeLessThan(regular.requiredMonthlySIP);
    });

    it("should include withoutStepUp for comparison", () => {
      const result = calculateStepUpGoalPlanner(5000000, 12, 10, 10);

      expect(result.withoutStepUp).toBeDefined();
      expect(result.withoutStepUp.requiredMonthlySIP).toBeGreaterThan(
        result.requiredMonthlySIP
      );
    });

    it("should reach target amount with step-up SIP", () => {
      const target = 5000000;
      const rate = 12;
      const years = 10;
      const stepUp = 10;

      const result = calculateStepUpGoalPlanner(target, rate, years, stepUp);

      // Verify by running step-up SIP forward
      const sipResult = calculateStepUpSIP(
        result.requiredMonthlySIP,
        rate,
        years,
        stepUp
      );

      // Allow for small rounding differences (within 0.1% of target)
      expect(sipResult.maturityAmount).toBeGreaterThan(target * 0.999);
      expect(sipResult.maturityAmount).toBeLessThan(target * 1.001);
    });

    it("should handle higher step-up percentages", () => {
      const stepUp10 = calculateStepUpGoalPlanner(5000000, 12, 10, 10);
      const stepUp20 = calculateStepUpGoalPlanner(5000000, 12, 10, 20);

      // Higher step-up = even lower starting SIP
      expect(stepUp20.requiredMonthlySIP).toBeLessThan(
        stepUp10.requiredMonthlySIP
      );
    });

    it("should calculate correct total invested with step-up", () => {
      const result = calculateStepUpGoalPlanner(5000000, 12, 3, 10);

      // Year 1: SIP × 12
      // Year 2: SIP × 1.1 × 12
      // Year 3: SIP × 1.1^2 × 12
      const sip = result.requiredMonthlySIP;
      const expectedInvested = Math.round(
        sip * 12 + sip * 1.1 * 12 + sip * 1.21 * 12
      );

      expect(result.totalInvested).toBeCloseTo(expectedInvested, -2);
    });

    it("should return rounded values", () => {
      const result = calculateStepUpGoalPlanner(5000000, 12, 10, 10);

      expect(Number.isInteger(result.requiredMonthlySIP)).toBe(true);
      expect(Number.isInteger(result.totalInvested)).toBe(true);
      expect(Number.isInteger(result.totalReturns)).toBe(true);
    });

    it("should have positive returns", () => {
      const result = calculateStepUpGoalPlanner(5000000, 12, 10, 10);

      expect(result.totalReturns).toBeGreaterThan(0);
      expect(result.totalReturns).toBe(result.targetAmount - result.totalInvested);
    });
  });

  describe("calculateStepUpGoalPlannerYearlyBreakdown", () => {
    it("should return correct number of entries", () => {
      const breakdown = calculateStepUpGoalPlannerYearlyBreakdown(
        5000000,
        12,
        10,
        10
      );

      expect(breakdown.length).toBe(10);
    });

    it("should include monthlySIP for each year showing step-up", () => {
      const breakdown = calculateStepUpGoalPlannerYearlyBreakdown(
        5000000,
        12,
        3,
        10
      );

      expect(breakdown[0].monthlySIP).toBeDefined();
      expect(breakdown[1].monthlySIP).toBeCloseTo(
        breakdown[0].monthlySIP! * 1.1,
        -1
      );
      expect(breakdown[2].monthlySIP).toBeCloseTo(
        breakdown[0].monthlySIP! * 1.21,
        -1
      );
    });

    it("should match final year to target amount", () => {
      const target = 5000000;
      const breakdown = calculateStepUpGoalPlannerYearlyBreakdown(
        target,
        12,
        10,
        10
      );

      const lastYear = breakdown[breakdown.length - 1];
      // Allow for small rounding differences (within 0.1% of target)
      expect(lastYear.totalValue).toBeGreaterThan(target * 0.999);
      expect(lastYear.totalValue).toBeLessThan(target * 1.001);
    });

    it("should have increasing invested amounts", () => {
      const breakdown = calculateStepUpGoalPlannerYearlyBreakdown(
        5000000,
        12,
        5,
        10
      );

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].invested).toBeGreaterThan(breakdown[i - 1].invested);
      }
    });

    it("should match calculateStepUpGoalPlanner result", () => {
      const target = 5000000;
      const result = calculateStepUpGoalPlanner(target, 12, 10, 10);
      const breakdown = calculateStepUpGoalPlannerYearlyBreakdown(
        target,
        12,
        10,
        10
      );

      const lastYear = breakdown[breakdown.length - 1];
      // Allow small rounding differences due to rounding in step-up calculations
      // Difference of ~100 on 2.9M is less than 0.01%
      expect(lastYear.invested).toBeCloseTo(result.totalInvested, -3);
    });

    it("should have interest increasing over time", () => {
      const breakdown = calculateStepUpGoalPlannerYearlyBreakdown(
        5000000,
        12,
        10,
        10
      );

      for (let i = 1; i < breakdown.length; i++) {
        expect(breakdown[i].interest).toBeGreaterThan(breakdown[i - 1].interest);
      }
    });
  });

  describe("Integration with SIP Calculator", () => {
    it("should be mathematically inverse of SIP calculation", () => {
      // Forward: SIP → Corpus
      const sipAmount = 10000;
      const rate = 12;
      const years = 10;

      const sipResult = calculateSIP(sipAmount, rate, years);

      // Reverse: Corpus → SIP
      const goalResult = calculateGoalPlanner(
        sipResult.maturityAmount,
        rate,
        years
      );

      // Should recover original SIP amount
      expect(goalResult.requiredMonthlySIP).toBeCloseTo(sipAmount, -2);
    });

    it("should be consistent with step-up SIP calculation", () => {
      const sipAmount = 10000;
      const rate = 12;
      const years = 10;
      const stepUp = 10;

      const sipResult = calculateStepUpSIP(sipAmount, rate, years, stepUp);
      const goalResult = calculateStepUpGoalPlanner(
        sipResult.maturityAmount,
        rate,
        years,
        stepUp
      );

      // Should recover original starting SIP amount
      expect(goalResult.requiredMonthlySIP).toBeCloseTo(sipAmount, -2);
    });
  });
});
