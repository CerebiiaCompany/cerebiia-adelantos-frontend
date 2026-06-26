import { describe, expect, it } from "vitest";
import {
  mapAdelantoConfiguracion,
  resolveAdelantoConfigFromEmpleadoMe,
} from "./configuracionMappers";

describe("mapAdelantoConfiguracion", () => {
  it("parsea tarifa y límites desde el DTO del backend", () => {
    const parsed = mapAdelantoConfiguracion({
      porcentaje_maximo_adelanto: "30.00",
      numero_maximo_cuotas: 3,
      plazo_maximo_dias: 90,
      tarifa_fija_por_cuota: "10000.00",
      updated_at: "2026-06-26T15:44:14.176358-05:00",
    });

    expect(parsed.porcentajeMaximoAdelanto).toBe(30);
    expect(parsed.numeroMaximoCuotas).toBe(3);
    expect(parsed.plazoMaximoDias).toBe(90);
    expect(parsed.tarifaFijaPorCuota).toBe(10_000);
    expect(parsed.updatedAt).toContain("2026-06-26");
  });
});

describe("resolveAdelantoConfigFromEmpleadoMe", () => {
  const baseNomina = {
    empleado_id: "emp-1",
    nombre: "Melanny",
    salario: "1700000.00",
    empresa_id: "empresa-1",
    porcentaje_maximo_adelanto: "30.00",
    monto_maximo_adelanto: "510000.00",
    saldo_disponible: "260000.00",
    documento: "123",
    banco_nombre: "Bancolombia",
    numero_cuenta: "123",
    tipo_cuenta: "ahorros",
    fecha_ingreso: "2024-01-01",
  };

  it("lee tarifa y cuotas desde GET /empleados/me/", () => {
    const parsed = resolveAdelantoConfigFromEmpleadoMe({
      ...baseNomina,
      tarifa_fija_por_cuota: "10000.00",
      numero_maximo_cuotas: 3,
      plazo_maximo_dias: 90,
    });

    expect(parsed?.tarifaFijaPorCuota).toBe(10_000);
    expect(parsed?.numeroMaximoCuotas).toBe(3);
    expect(parsed?.porcentajeMaximoAdelanto).toBe(30);
  });

  it("devuelve null si el backend no envía tarifa_fija_por_cuota", () => {
    expect(resolveAdelantoConfigFromEmpleadoMe(baseNomina)).toBeNull();
  });
});
