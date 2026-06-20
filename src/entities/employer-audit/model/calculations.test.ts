import { describe, expect, it } from "vitest";
import {
  ADVANCE_FEE_RATE,
  ADVANCE_SALARY_CAP_RATIO,
  calculateAdvanceFee,
  calculateSalaryPercentage,
  calculateTotalWithholding,
  exceedsSalaryCap,
} from "./calculations";

describe("employer-audit calculations", () => {
  it("calcula comisión del 2.5%", () => {
    expect(ADVANCE_FEE_RATE).toBe(0.025);
    expect(calculateAdvanceFee(400_000)).toBe(10_000);
  });

  it("calcula total a descontar en nómina (solo valor del adelanto)", () => {
    expect(calculateTotalWithholding(400_000)).toBe(400_000);
  });

  it("calcula porcentaje del salario", () => {
    expect(calculateSalaryPercentage(720_000, 2_400_000)).toBe(30);
    expect(calculateSalaryPercentage(800_000, 2_400_000)).toBeCloseTo(33.33, 1);
  });

  it("detecta violación del tope del 30%", () => {
    expect(ADVANCE_SALARY_CAP_RATIO).toBe(0.3);
    expect(exceedsSalaryCap(720_000, 2_400_000)).toBe(false);
    expect(exceedsSalaryCap(800_000, 2_400_000)).toBe(true);
  });
});
