import { describe, expect, it } from "vitest";
import {
  calculateAdvanceNetAmount,
  calculateAdvanceTotalFee,
  calculateAdvanceTransactionFee,
  DEFAULT_TARIFA_FIJA_POR_CUOTA,
  formatAdvanceTransactionFeeLabel,
} from "./advanceFees";

describe("advanceFees", () => {
  it("calcula comisión total como tarifa por cuota × número de cuotas", () => {
    expect(calculateAdvanceTotalFee(10_000, 1, 500_000)).toBe(10_000);
    expect(calculateAdvanceTotalFee(10_000, 3, 500_000)).toBe(30_000);
    expect(calculateAdvanceTotalFee(10_000, 2, 0)).toBe(0);
  });

  it("calcula monto neto restando la comisión total", () => {
    expect(calculateAdvanceNetAmount(500_000, 10_000, 2)).toBe(480_000);
  });

  it("mantiene compatibilidad con calculateAdvanceTransactionFee (1 cuota)", () => {
    expect(DEFAULT_TARIFA_FIJA_POR_CUOTA).toBe(8_000);
    expect(calculateAdvanceTransactionFee(500_000)).toBe(8_000);
    expect(calculateAdvanceTransactionFee(1_000_000, 3, 10_000)).toBe(30_000);
    expect(calculateAdvanceTransactionFee(0)).toBe(0);
  });

  it("formatea la etiqueta de comisión por cuota", () => {
    expect(formatAdvanceTransactionFeeLabel(10_000)).toContain("10.000");
    expect(formatAdvanceTransactionFeeLabel(10_000)).toContain("por cuota");
    expect(formatAdvanceTransactionFeeLabel()).toContain("8.000");
  });
});
