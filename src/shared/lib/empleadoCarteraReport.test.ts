import { describe, expect, it } from "vitest";
import type { CarteraPendienteEmpleadoDTO } from "@/shared/api/types";
import {
  buildCarteraDetalleSheet,
  buildCarteraReportRows,
  buildCarteraResumenAdelantosSheet,
  buildComposicionAdelantos,
  montoRecibidoPorCuota,
  resolveTotalADescontar,
} from "./empleadoCarteraReport";

const baseCartera = (
  overrides: Partial<CarteraPendienteEmpleadoDTO> = {},
): CarteraPendienteEmpleadoDTO => ({
  empleado: {
    id: "emp-1",
    nombre: "Melanny Yilyan Guate",
    documento: "1005026054",
    salario: "1500000.00",
    estado: "activo",
  },
  generado_en: "2026-08-10T12:00:00Z",
  cuotas_pendientes: [],
  totales: {
    cantidad_cuotas: 0,
    total_capital: "0.00",
    total_tarifas: "0.00",
    total_a_descontar: "0.00",
  },
  ...overrides,
});

describe("montoRecibidoPorCuota", () => {
  it("reparte el neto y la última cuota absorbe el residuo", () => {
    expect(montoRecibidoPorCuota(184000, 2, 1)).toBe(92000);
    expect(montoRecibidoPorCuota(184000, 2, 2)).toBe(92000);
    expect(montoRecibidoPorCuota(100000, 3, 1)).toBe(33333);
    expect(montoRecibidoPorCuota(100000, 3, 2)).toBe(33333);
    expect(montoRecibidoPorCuota(100000, 3, 3)).toBe(33334);
  });
});

describe("resolveTotalADescontar", () => {
  it("usa solo el capital (nunca suma comisiones)", () => {
    expect(
      resolveTotalADescontar({
        cantidad_cuotas: 5,
        total_capital: "600000.00",
        total_tarifas: "40000.00",
        total_a_descontar: "640000.00",
      }),
    ).toBe(600000);
  });
});

describe("buildComposicionAdelantos", () => {
  it("arma notación 1+2 como en cuentas de cobro", () => {
    const { composicion, cantidadAdelantos, porAdelanto } =
      buildComposicionAdelantos([
        {
          cuota_id: "c1",
          solicitud_id: "s-a",
          cuota_numero: 1,
          cuota_monto: "50000.00",
          tarifa_cuota: "8000.00",
          fecha_corte: "2026-07-30",
          monto_solicitud: "50000.00",
          monto_neto: "42000.00",
          tarifa_total: "8000.00",
          numero_cuotas_total: 1,
          pagado_en: "2026-07-01T10:00:00Z",
        },
        {
          cuota_id: "c2",
          solicitud_id: "s-b",
          cuota_numero: 1,
          cuota_monto: "100000.00",
          tarifa_cuota: "8000.00",
          fecha_corte: "2026-07-30",
          monto_solicitud: "200000.00",
          monto_neto: "184000.00",
          tarifa_total: "16000.00",
          numero_cuotas_total: 2,
          pagado_en: "2026-07-17T10:00:00Z",
        },
        {
          cuota_id: "c3",
          solicitud_id: "s-b",
          cuota_numero: 2,
          cuota_monto: "100000.00",
          tarifa_cuota: "8000.00",
          fecha_corte: "2026-08-30",
          monto_solicitud: "200000.00",
          monto_neto: "184000.00",
          tarifa_total: "16000.00",
          numero_cuotas_total: 2,
          pagado_en: "2026-07-17T10:00:00Z",
        },
      ]);

    expect(composicion).toBe("1+2");
    expect(cantidadAdelantos).toBe(2);
    expect(porAdelanto[0].cuotasPendientes).toBe(1);
    expect(porAdelanto[1].cuotasPendientes).toBe(2);
  });
});

describe("buildCarteraDetalleSheet", () => {
  it("descuenta solo el monto de cuota (sin sumar tarifa)", () => {
    const sheet = buildCarteraDetalleSheet(
      baseCartera({
        cuotas_pendientes: [
          {
            cuota_id: "c1",
            solicitud_id: "s1",
            cuota_numero: 1,
            cuota_monto: "100000.00",
            tarifa_cuota: "8000.00",
            fecha_corte: "2026-07-30",
            monto_solicitud: "200000.00",
            monto_neto: "184000.00",
            tarifa_total: "16000.00",
            numero_cuotas_total: 2,
            pagado_en: "2026-07-17T10:00:00Z",
          },
          {
            cuota_id: "c2",
            solicitud_id: "s1",
            cuota_numero: 2,
            cuota_monto: "100000.00",
            tarifa_cuota: "8000.00",
            fecha_corte: "2026-08-30",
            monto_solicitud: "200000.00",
            monto_neto: "184000.00",
            tarifa_total: "16000.00",
            numero_cuotas_total: 2,
            pagado_en: "2026-07-17T10:00:00Z",
          },
        ],
        totales: {
          cantidad_cuotas: 2,
          total_capital: "200000.00",
          total_tarifas: "16000.00",
          total_a_descontar: "200000.00",
        },
      }),
    );

    expect(sheet.headers).toContain("Monto recibido por cuota");
    expect(sheet.rows).toHaveLength(2);
    expect(sheet.rows[0][6]).toBe(92000);
    // Total fila = solo monto cuota
    expect(sheet.rows[0][11]).toBe(100000);
    expect(sheet.footerRows?.[0]?.[1]).toBe("2");
    expect(sheet.footerRows?.at(-1)?.[11]).toBe(200000);
  });
});

describe("buildCarteraResumenAdelantosSheet", () => {
  it("no muestra tarifas pendientes y total = capital", () => {
    const sheet = buildCarteraResumenAdelantosSheet(
      baseCartera({
        cuotas_pendientes: [
          {
            cuota_id: "c1",
            solicitud_id: "s1",
            cuota_numero: 1,
            cuota_monto: "100000.00",
            tarifa_cuota: "8000.00",
            fecha_corte: "2026-07-30",
            monto_solicitud: "200000.00",
            monto_neto: "184000.00",
            tarifa_total: "16000.00",
            numero_cuotas_total: 2,
            pagado_en: "2026-07-17T10:00:00Z",
          },
          {
            cuota_id: "c2",
            solicitud_id: "s1",
            cuota_numero: 2,
            cuota_monto: "100000.00",
            tarifa_cuota: "8000.00",
            fecha_corte: "2026-08-30",
            monto_solicitud: "200000.00",
            monto_neto: "184000.00",
            tarifa_total: "16000.00",
            numero_cuotas_total: 2,
            pagado_en: "2026-07-17T10:00:00Z",
          },
        ],
        totales: {
          cantidad_cuotas: 2,
          total_capital: "200000.00",
          total_tarifas: "16000.00",
          total_a_descontar: "200000.00",
        },
      }),
    );

    expect(sheet.headers).not.toContain("Tarifas pendientes");
    expect(sheet.rows).toHaveLength(1);
    expect(sheet.rows[0][5]).toBe(200000); // monto adelantado
    expect(sheet.rows[0][6]).toBe(16000); // comisión informativa
    expect(sheet.rows[0][7]).toBe(184000); // monto recibido
    expect(sheet.rows[0][9]).toBe(200000); // capital pendiente
    expect(sheet.rows[0][10]).toBe(200000); // total a descontar = capital
    expect(sheet.footerRows?.at(-1)?.[10]).toBe(200000);
  });
});

describe("buildCarteraReportRows", () => {
  it("sigue exponiendo el detalle para compatibilidad", () => {
    const built = buildCarteraReportRows(baseCartera());
    expect(built.rows[0][2]).toMatch(/Sin deuda pendiente/i);
    expect(built.footerRows.some((r) => r[0] === "TOTAL A DESCONTAR")).toBe(
      true,
    );
  });
});
