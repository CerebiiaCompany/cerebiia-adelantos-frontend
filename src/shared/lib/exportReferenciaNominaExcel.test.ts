import { describe, expect, it } from "vitest";
import type { ReferenciaNominaDTO } from "@/shared/api/types";
import { buildReferenciaNominaExcelSheets } from "./exportReferenciaNominaExcel";

describe("buildReferenciaNominaExcelSheets", () => {
  it("genera las dos hojas con resumen, detalle y total consolidado", () => {
    const dto: ReferenciaNominaDTO = {
      empresa_id: "emp-1",
      empresa_nombre: "Yilyan Guate SAS",
      empresa_nit: "900123456-7",
      periodo: "2026-09",
      inicio_periodo: "01/09/2026",
      fin_periodo: "30/09/2026",
      total_a_descontar: "394000.00",
      resumen: [
        {
          inicio_periodo: "01/09/2026",
          fin_periodo: "30/09/2026",
          numero_documento: "1091352289",
          nombre: "JUAN",
          apellido: "MASITA",
          cantidad_adelantos: 2,
          total_cuotas: 2,
          detalle_cuotas: "1/1, 1/1",
          total_costo_servicio: "8000.00",
          total_neto_transferido: "250000.00",
          total_solicitado: "250000.00",
          total_a_descontar_mes: "258000.00",
          total_a_pagar_proveedor: "258000.00",
        },
      ],
      detalle: [
        {
          inicio_periodo: "01/09/2026",
          fin_periodo: "30/09/2026",
          numero_documento: "1091352289",
          nombre: "JUAN",
          apellido: "MASITA",
          solicitud_id: "sol-1",
          cuota_numero: 1,
          total_cuotas: 1,
          fecha_corte: "2026-09-30",
          monto_a_descontar: "158000.00",
          monto_solicitud: "150000.00",
          tarifa_cuota: "8000.00",
          tarifa_total_solicitud: "8000.00",
          estado_cuota: "pendiente",
        },
      ],
      totales: {
        cantidad_adelantos: 3,
        total_cuotas: 3,
        total_costo_servicio: "8000.00",
        total_neto_transferido: "386000.00",
        total_solicitado: "386000.00",
        total_a_descontar_mes: "394000.00",
        total_a_pagar_proveedor: "394000.00",
      },
    };

    const sheets = buildReferenciaNominaExcelSheets(dto);

    expect(sheets).toHaveLength(2);
    expect(sheets[0].sheetName).toBe("Resumen por empleado");
    expect(sheets[1].sheetName).toBe("Detalle cuotas");
    expect(sheets[0].headers).toEqual([
      "Inicio Periodo",
      "Fin Periodo",
      "Número Documento",
      "Nombre",
      "Apellido",
      "# Adelantos",
      "Total Cuotas",
      "Total Costo de Servicio",
      "Total Transferido al Empleado",
      "Total Solicitado",
      "Total a Descontar Este Mes",
      "Total a Pagar al Proveedor",
    ]);
    expect(sheets[0].rows[0]).toEqual([
      "01/09/2026",
      "30/09/2026",
      "1091352289",
      "JUAN",
      "MASITA",
      2,
      "1 de 1 + 1 de 1",
      8000,
      250000,
      250000,
      258000,
      258000,
    ]);
    expect(sheets[0].footerRows).toEqual([
      ["TOTAL", "", "", "", "", 3, 3, 8000, 386000, 386000, 394000, 394000],
    ]);
    expect(sheets[1].rows[0]).toEqual([
      "01/09/2026",
      "30/09/2026",
      "1091352289",
      "JUAN",
      "MASITA",
      "1 de 1",
      1,
      "2026-09-30",
      158000,
      150000,
      8000,
      "pendiente",
    ]);
  });
});
