import { describe, expect, it } from "vitest";
import { resolveAdvanceLimitsFromNomina } from "./advanceLimits";

describe("resolveAdvanceLimitsFromNomina", () => {
  const baseNomina = {
    empleado_id: "emp-1",
    nombre: "Melanny",
    salario: "1500000.00",
    empresa_id: "empresa-1",
    porcentaje_maximo_adelanto: "50.00",
    monto_maximo_adelanto: "750000.00",
    saldo_disponible: "450000.00",
    documento: "123",
    banco_nombre: "Bancolombia",
    numero_cuenta: "123",
    tipo_cuenta: "ahorros",
    fecha_ingreso: "2024-01-01",
  };

  it("usa monto_maximo y respeta el cupo total del 50% cuando no hay adelantos", () => {
    const limits = resolveAdvanceLimitsFromNomina(
      {
        ...baseNomina,
        saldo_disponible: "750000.00",
      },
      0,
    );

    expect(limits.maxAdvanceLimit).toBe(750_000);
    expect(limits.availableAdvance).toBe(750_000);
    expect(limits.advancePercentage).toBe(50);
  });

  it("descuenta adelantos del mes sobre el tope del 50%", () => {
    const limits = resolveAdvanceLimitsFromNomina(
      {
        ...baseNomina,
        saldo_disponible: "450000.00",
      },
      200_000,
    );

    expect(limits.maxAdvanceLimit).toBe(750_000);
    expect(limits.availableAdvance).toBe(450_000);
  });

  it("permite saldo liberado mayor si el backend lo retorna explícitamente", () => {
    const limits = resolveAdvanceLimitsFromNomina({
      ...baseNomina,
      monto_maximo_adelanto: "750000.00",
      saldo_disponible: "1090000.00",
    });

    expect(limits.availableAdvance).toBe(1_090_000);
    expect(limits.maxAdvanceLimit).toBe(1_090_000);
  });

  it("calcula saldo restante si el backend no envía saldo_disponible", () => {
    const limits = resolveAdvanceLimitsFromNomina(
      {
        ...baseNomina,
        saldo_disponible: undefined,
      },
      250_000,
    );

    expect(limits.availableAdvance).toBe(500_000);
  });
});

