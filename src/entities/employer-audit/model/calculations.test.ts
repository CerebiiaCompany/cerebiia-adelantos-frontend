import { describe, expect, it } from "vitest";
import {
  ADVANCE_FEE_AMOUNT,
  ADVANCE_SALARY_CAP_RATIO,
  calculateAdvanceFee,
  calcularEstadoSeguimiento,
  calculateSalaryPercentage,
  calculateTotalWithholding,
  exceedsSalaryCap,
  isRecoverableCompanyAdvance,
} from "./calculations";

describe("employer-audit calculations", () => {
  it("aplica comisión según tarifa por cuota configurada", () => {
    expect(ADVANCE_FEE_AMOUNT).toBe(8_000);
    expect(calculateAdvanceFee(400_000)).toBe(8_000);
    expect(calculateAdvanceFee(400_000, 12_000, 1)).toBe(12_000);
    expect(calculateAdvanceFee(400_000, 12_000, 2)).toBe(24_000);
    expect(calculateAdvanceFee(0)).toBe(0);
  });

  it("calcula total a descontar en nómina (solo valor del adelanto)", () => {
    expect(calculateTotalWithholding(400_000)).toBe(400_000);
    // Para periodo mensual con 2 cuotas: $200.000 / 2 = $100.000
    expect(calculateTotalWithholding(200_000, "procesado", 2, true)).toBe(100_000);
    // Para todos los periodos con 2 cuotas: $200.000
    expect(calculateTotalWithholding(200_000, "procesado", 2, false)).toBe(200_000);
  });

  it("rechazado no genera descuento en monitoreo", () => {
    expect(calculateTotalWithholding(500_000, "rechazado")).toBe(0);
    expect(calculateTotalWithholding(500_000, "rechazado", 2, true)).toBe(0);
    expect(calculateTotalWithholding(100_000, "procesado")).toBe(100_000);
  });

  it("solo procesado es recuperable para cuotas/retenciones", () => {
    expect(isRecoverableCompanyAdvance("procesado")).toBe(true);
    expect(isRecoverableCompanyAdvance("rechazado")).toBe(false);
    expect(isRecoverableCompanyAdvance("en_curso")).toBe(false);
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

  describe("calcularEstadoSeguimiento", () => {
    const cuotasSample = [
      {
        id: "c-1",
        numero: 1,
        monto: 100_000,
        fecha_corte: "2026-08-30",
        estado: "pagada",
        fecha_pago: "2026-08-25",
      },
      {
        id: "c-2",
        numero: 2,
        monto: 100_000,
        fecha_corte: "2026-09-30",
        estado: "pendiente",
        fecha_pago: null,
      },
      {
        id: "c-3",
        numero: 3,
        monto: 100_000,
        fecha_corte: "2026-10-30",
        estado: "pendiente",
        fecha_pago: null,
      },
    ];

    it("Mes 1 (Agosto 2026): Cuota 1 pagada -> Al día, 1 de 3 (2 restantes), saldo 200k", () => {
      const result = calcularEstadoSeguimiento(
        cuotasSample,
        300_000,
        3,
        "procesado",
        new Date("2026-08-26T10:00:00-05:00"),
      );

      expect(result.cuotasPagadas).toBe(1);
      expect(result.totalCuotas).toBe(3);
      expect(result.pendingInstallments).toBe(2);
      expect(result.saldoPorDescontar).toBe(200_000);
      expect(result.estadoCuotaMes).toBe("al_dia");
      expect(result.isFullyPaid).toBe(false);
    });

    it("Mes 2 (Septiembre 2026 - Cuota 2 pendiente): Pendiente, saldo 200k", () => {
      const result = calcularEstadoSeguimiento(
        cuotasSample,
        300_000,
        3,
        "procesado",
        new Date("2026-09-10T10:00:00-05:00"),
      );

      expect(result.cuotasPagadas).toBe(1);
      expect(result.pendingInstallments).toBe(2);
      expect(result.saldoPorDescontar).toBe(200_000);
      expect(result.estadoCuotaMes).toBe("pendiente");
      expect(result.isFullyPaid).toBe(false);
    });

    it("Mes 2 (Septiembre 2026 - Cuota 2 pagada): Al día, 2 de 3 (1 restante), saldo 100k", () => {
      const cuotasMes2Pagada = [
        cuotasSample[0],
        { ...cuotasSample[1], estado: "pagada", fecha_pago: "2026-09-25" },
        cuotasSample[2],
      ];

      const result = calcularEstadoSeguimiento(
        cuotasMes2Pagada,
        300_000,
        3,
        "procesado",
        new Date("2026-09-26T10:00:00-05:00"),
      );

      expect(result.cuotasPagadas).toBe(2);
      expect(result.pendingInstallments).toBe(1);
      expect(result.saldoPorDescontar).toBe(100_000);
      expect(result.estadoCuotaMes).toBe("al_dia");
      expect(result.isFullyPaid).toBe(false);
    });

    it("Mes 3 (Octubre 2026 - Todas pagadas): Completado, 3 de 3 (0 restantes), saldo 0", () => {
      const cuotasTodasPagadas = [
        cuotasSample[0],
        { ...cuotasSample[1], estado: "pagada", fecha_pago: "2026-09-25" },
        { ...cuotasSample[2], estado: "pagada", fecha_pago: "2026-10-25" },
      ];

      const result = calcularEstadoSeguimiento(
        cuotasTodasPagadas,
        300_000,
        3,
        "procesado",
        new Date("2026-10-26T10:00:00-05:00"),
      );

      expect(result.cuotasPagadas).toBe(3);
      expect(result.pendingInstallments).toBe(0);
      expect(result.saldoPorDescontar).toBe(0);
      expect(result.estadoCuotaMes).toBe("completado");
      expect(result.isFullyPaid).toBe(true);
    });
  });
});
