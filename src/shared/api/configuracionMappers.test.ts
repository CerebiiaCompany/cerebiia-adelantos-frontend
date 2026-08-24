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
    expect(parsed.montoMinimoAdelanto).toBeNull();
    expect(parsed.updatedAt).toContain("2026-06-26");
  });

  it("parsea respuestas con monto_minimo y porcentaje con signo % o números puros", () => {
    const parsed = mapAdelantoConfiguracion({
      porcentaje_maximo_adelanto: "20.00%",
      numero_maximo_cuotas: "4",
      plazo_maximo_dias: "60",
      tarifa_fija_por_cuota: 8500,
      monto_minimo: "50000.00",
    });

    expect(parsed.porcentajeMaximoAdelanto).toBe(20);
    expect(parsed.numeroMaximoCuotas).toBe(4);
    expect(parsed.plazoMaximoDias).toBe(60);
    expect(parsed.tarifaFijaPorCuota).toBe(8500);
    expect(parsed.montoMinimoAdelanto).toBe(50_000);
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
