import {
  calculateGratuity,
  calculateGratuityWithCap,
  GRATUITY_CAP,
  GratuityResult,
} from "./gratuity";

describe("Gratuity Calculator", () => {
  describe("calculateGratuity", () => {
    it("should calculate gratuity correctly for a basic case", () => {
      // ₹50,000 salary, 10 years of service
      // Gratuity = (15 × 50,000 × 10) / 26 = 288,462 (rounded)
      const result = calculateGratuity(50000, 10);

      expect(result.gratuityAmount).toBe(288462);
      expect(result.lastDrawnSalary).toBe(50000);
      expect(result.yearsOfService).toBe(10);
      expect(result.isEligible).toBe(true);
    });

    it("should mark as eligible for 5+ years of service", () => {
      const result5 = calculateGratuity(50000, 5);
      const result6 = calculateGratuity(50000, 6);
      const result10 = calculateGratuity(50000, 10);

      expect(result5.isEligible).toBe(true);
      expect(result6.isEligible).toBe(true);
      expect(result10.isEligible).toBe(true);
    });

    it("should mark as ineligible for less than 5 years of service", () => {
      const result1 = calculateGratuity(50000, 1);
      const result4 = calculateGratuity(50000, 4);

      expect(result1.isEligible).toBe(false);
      expect(result4.isEligible).toBe(false);
    });

    it("should still calculate gratuity for ineligible employees", () => {
      // Even if not eligible, we calculate what they would get
      const result = calculateGratuity(50000, 3);

      expect(result.gratuityAmount).toBe(86538); // (15 × 50,000 × 3) / 26
      expect(result.isEligible).toBe(false);
    });

    it("should calculate gratuity for high salary correctly", () => {
      // ₹2,00,000 salary, 20 years of service
      // Gratuity = (15 × 2,00,000 × 20) / 26 = 23,07,692 (rounded)
      const result = calculateGratuity(200000, 20);

      expect(result.gratuityAmount).toBe(2307692);
    });

    it("should calculate gratuity for exactly 5 years", () => {
      // ₹40,000 salary, exactly 5 years
      // Gratuity = (15 × 40,000 × 5) / 26 = 1,15,385 (rounded)
      const result = calculateGratuity(40000, 5);

      expect(result.gratuityAmount).toBe(115385);
      expect(result.isEligible).toBe(true);
    });

    it("should return rounded integer values", () => {
      // Using values that would result in decimals
      const result = calculateGratuity(33333, 7);

      expect(Number.isInteger(result.gratuityAmount)).toBe(true);
    });

    it("should scale linearly with salary", () => {
      const result1 = calculateGratuity(50000, 10);
      const result2 = calculateGratuity(100000, 10);

      // Due to rounding, we check that doubling salary approximately doubles gratuity
      // (15 × 50000 × 10) / 26 = 288,461.54 → 288,462
      // (15 × 100000 × 10) / 26 = 576,923.08 → 576,923
      expect(result2.gratuityAmount).toBeCloseTo(result1.gratuityAmount * 2, -1);
    });

    it("should scale linearly with years of service", () => {
      const result1 = calculateGratuity(50000, 10);
      const result2 = calculateGratuity(50000, 20);

      // Due to rounding, we check approximate linear scaling
      expect(result2.gratuityAmount).toBeCloseTo(result1.gratuityAmount * 2, -1);
    });
  });

  describe("calculateGratuityWithCap", () => {
    it("should apply the statutory cap of ₹20 lakh", () => {
      // Very high salary that would exceed cap
      // ₹5,00,000 salary, 25 years
      // Uncapped = (15 × 5,00,000 × 25) / 26 = 72,11,538
      const result = calculateGratuityWithCap(500000, 25);

      expect(result.gratuityAmount).toBe(GRATUITY_CAP);
      expect(result.isCapped).toBe(true);
      expect(result.uncappedAmount).toBe(7211538);
    });

    it("should not cap gratuity below ₹20 lakh", () => {
      // ₹50,000 salary, 10 years
      // Gratuity = 2,88,462 (well under cap)
      const result = calculateGratuityWithCap(50000, 10);

      expect(result.gratuityAmount).toBe(288462);
      expect(result.isCapped).toBe(false);
      expect(result.uncappedAmount).toBe(288462);
    });

    it("should return capped amount exactly at the boundary", () => {
      // Find values that give exactly ₹20 lakh
      // (15 × S × Y) / 26 = 20,00,000
      // S × Y = 34,66,667
      // At 100000 salary, 34.67 years → but let's test values just over
      const result = calculateGratuityWithCap(100000, 35);
      // (15 × 100000 × 35) / 26 = 20,19,231 > 20 lakh

      expect(result.gratuityAmount).toBe(GRATUITY_CAP);
      expect(result.isCapped).toBe(true);
    });

    it("should maintain eligibility status with cap", () => {
      const eligible = calculateGratuityWithCap(500000, 25);
      const ineligible = calculateGratuityWithCap(500000, 4);

      expect(eligible.isEligible).toBe(true);
      expect(ineligible.isEligible).toBe(false);
    });
  });

  describe("GRATUITY_CAP constant", () => {
    it("should be ₹20 lakh (2019 amendment)", () => {
      expect(GRATUITY_CAP).toBe(2000000);
    });
  });

  describe("formula verification", () => {
    it("should use the formula: (15 × salary × years) / 26", () => {
      // Verify formula explicitly
      const salary = 60000;
      const years = 12;
      const expected = Math.round((15 * salary * years) / 26);

      const result = calculateGratuity(salary, years);

      expect(result.gratuityAmount).toBe(expected);
    });

    it("should match manually calculated values", () => {
      // Manual calculation: (15 × 75000 × 15) / 26 = 649,038 (rounded)
      const result = calculateGratuity(75000, 15);

      expect(result.gratuityAmount).toBe(649038);
    });
  });
});
