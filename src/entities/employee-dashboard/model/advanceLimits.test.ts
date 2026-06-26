import { describe, expect, it } from "vitest";
import { resolveAdvanceLimitsFromNomina } from "./advanceLimits";

describe("resolveAdvanceLimitsFromNomina", () => {
  const baseNomina = {
    empleado_id: "emp-1",
    nombre: "Melanny",
    salario: "1700000.00",
    empresa_id: "empresa-1",
    porcentaje_maximo_adelanto: "40.00",
    monto_maximo_adelanto: "680000.00",
    saldo_disponible: "680000.00",
    documento: "123",
    banco_nombre: "Bancolombia",
    numero_cuenta: "123",
    tipo_cuenta: "ahorros",
    fecha_ingreso: "2024-01-01",
  };

  it("usa monto_maximo y saldo_disponible del backend", () => {
    const limits = resolveAdvanceLimitsFromNomina(baseNomina);

    expect(limits.maxAdvanceLimit).toBe(680_000);
    expect(limits.availableAdvance).toBe(680_000);
    expect(limits.advancePercentage).toBe(40);
  });

  it("prioriza saldo_disponible sobre cálculo local", () => {
    const limits = resolveAdvanceLimitsFromNomina(
      {
        ...baseNomina,
        saldo_disponible: "450000.00",
      },
      0,
    );

    expect(limits.availableAdvance).toBe(450_000);
  });

  it("no muestra saldo por encima del tope vigente", () => {
    const limits = resolveAdvanceLimitsFromNomina({
      ...baseNomina,
      monto_maximo_adelanto: "680000.00",
      saldo_disponible: "700000.00",
    });

    expect(limits.availableAdvance).toBe(680_000);
  });

  it("calcula saldo restante si el backend no envía saldo_disponible", () => {
    const limits = resolveAdvanceLimitsFromNomina(
      {
        ...baseNomina,
        saldo_disponible: undefined,
      },
      200_000,
    );

    expect(limits.availableAdvance).toBe(480_000);
  });
});
