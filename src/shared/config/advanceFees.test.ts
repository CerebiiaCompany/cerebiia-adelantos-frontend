import { describe, expect, it } from "vitest";
import {
  buildAdvanceFeeSchedule,
  calculateAdvanceNetAmount,
  calculateAdvanceTotalFee,
  calculateAdvanceTransactionFee,
  calculateFeeForInstallmentIndex,
  DEFAULT_TARIFA_FIJA_POR_CUOTA,
  formatAdvanceTransactionFeeLabel,
} from "./advanceFees";

describe("advanceFees", () => {
  it("calcula comisión total como tarifa por cuota × número de cuotas", () => {
    expect(calculateAdvanceTotalFee(10_000, 1, 500_000)).toBe(10_000);
    expect(calculateAdvanceTotalFee(10_000, 3, 500_000)).toBe(30_000);
    expect(calculateAdvanceTotalFee(10_000, 2, 0)).toBe(0);
  });

  it("aplica primera cuota gratis para empleados nuevos", () => {
    expect(
      calculateAdvanceTotalFee(8_000, 1, 100_000, {
        primeraCuotaGratis: true,
      }),
    ).toBe(0);
    expect(
      calculateAdvanceTotalFee(8_000, 2, 100_000, {
        primeraCuotaGratis: true,
      }),
    ).toBe(8_000);
    expect(
      calculateAdvanceTotalFee(8_000, 3, 250_000, {
        primeraCuotaGratis: true,
      }),
    ).toBe(16_000);
    expect(
      calculateAdvanceNetAmount(250_000, 8_000, 3, {
        primeraCuotaGratis: true,
      }),
    ).toBe(234_000);
  });

  it("arma el plan de tarifas con promo en todas menos la 1ª", () => {
    expect(buildAdvanceFeeSchedule(8_000, 1, { primeraCuotaGratis: true })).toEqual([
      0,
    ]);
    expect(buildAdvanceFeeSchedule(8_000, 2, { primeraCuotaGratis: true })).toEqual([
      0, 8_000,
    ]);
    expect(buildAdvanceFeeSchedule(8_000, 3, { primeraCuotaGratis: true })).toEqual([
      0, 8_000, 8_000,
    ]);
    expect(buildAdvanceFeeSchedule(8_000, 2)).toEqual([8_000, 8_000]);
  });

  it("atribuye comisión del mes en retenciones según promo o plan estándar", () => {
    // Promo 250k × 3: 1ª gratis, 2ª y 3ª cobran
    expect(calculateFeeForInstallmentIndex(16_000, 3, 0, 8_000)).toBe(0);
    expect(calculateFeeForInstallmentIndex(16_000, 3, 1, 8_000)).toBe(8_000);
    expect(calculateFeeForInstallmentIndex(16_000, 3, 2, 8_000)).toBe(8_000);
    // Promo 100k × 2
    expect(calculateFeeForInstallmentIndex(8_000, 2, 0, 8_000)).toBe(0);
    expect(calculateFeeForInstallmentIndex(8_000, 2, 1, 8_000)).toBe(8_000);
    // 1 cuota gratis
    expect(calculateFeeForInstallmentIndex(0, 1, 0, 8_000)).toBe(0);
    // Plan estándar 2 cuotas
    expect(calculateFeeForInstallmentIndex(16_000, 2, 0, 8_000)).toBe(8_000);
    expect(calculateFeeForInstallmentIndex(16_000, 2, 1, 8_000)).toBe(8_000);
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
    expect(
      formatAdvanceTransactionFeeLabel(8_000, {
        primeraCuotaGratis: true,
        numeroCuotas: 1,
      }),
    ).toContain("gratis");
  });
});
