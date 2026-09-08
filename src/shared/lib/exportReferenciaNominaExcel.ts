import type { ReferenciaNominaDTO } from "@/shared/api/types";
import type { BrandedExcelSheetOptions } from "./excelReport";
import { downloadBrandedExcelMultiSheetReport } from "./excelReport";

function parseMoney(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDetalleCuotas(value: string, fallbackTotal: number): string | number {
  const normalized = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.replace("/", " de "));

  if (normalized.length === 0) {
    return fallbackTotal;
  }

  return normalized.join(" + ");
}

export function buildReferenciaNominaExcelSheets(
  dto: ReferenciaNominaDTO,
): BrandedExcelSheetOptions[] {
  const resumenHeaders = [
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
  ];

  const detalleHeaders = [
    "Inicio Periodo",
    "Fin Periodo",
    "Número Documento",
    "Nombre",
    "Apellido",
    "Cuota #",
    "Total Cuotas",
    "Fecha Corte",
    "Monto a Descontar Nómina",
    "Monto Solicitado",
    "Costo Servicio Cuota",
    "Estado Cuota",
  ];

  return [
    {
      sheetName: "Resumen por empleado",
      headers: resumenHeaders,
      rows: dto.resumen.map((item) => [
        item.inicio_periodo,
        item.fin_periodo,
        item.numero_documento,
        item.nombre,
        item.apellido,
        item.cantidad_adelantos,
        formatDetalleCuotas(item.detalle_cuotas, item.total_cuotas),
        parseMoney(item.total_costo_servicio),
        parseMoney(item.total_neto_transferido),
        parseMoney(item.total_solicitado),
        parseMoney(item.total_a_descontar_mes),
        parseMoney(item.total_a_pagar_proveedor),
      ]),
      currencyColumnIndexes: [7, 8, 9, 10, 11],
      columnWidths: [16, 16, 18, 18, 18, 12, 12, 20, 22, 18, 22, 22],
      footerRows: [
        [
          "TOTAL",
          "",
          "",
          "",
          "",
          dto.totales.cantidad_adelantos,
          dto.totales.total_cuotas,
          parseMoney(dto.totales.total_costo_servicio),
          parseMoney(dto.totales.total_neto_transferido),
          parseMoney(dto.totales.total_solicitado),
          parseMoney(dto.totales.total_a_descontar_mes),
          parseMoney(dto.totales.total_a_pagar_proveedor),
        ],
      ],
    },
    {
      sheetName: "Detalle cuotas",
      headers: detalleHeaders,
      rows: dto.detalle.map((item) => [
        item.inicio_periodo,
        item.fin_periodo,
        item.numero_documento,
        item.nombre,
        item.apellido,
        `${item.cuota_numero} de ${item.total_cuotas}`,
        item.total_cuotas,
        item.fecha_corte,
        parseMoney(item.monto_a_descontar),
        parseMoney(item.monto_solicitud),
        parseMoney(item.tarifa_cuota),
        item.estado_cuota,
      ]),
      currencyColumnIndexes: [8, 9, 10],
      columnWidths: [16, 16, 18, 18, 18, 12, 12, 16, 22, 18, 20, 16],
    },
  ];
}

export async function downloadReferenciaNominaExcel(
  dto: ReferenciaNominaDTO,
): Promise<void> {
  await downloadBrandedExcelMultiSheetReport({
    filename: `descuentos-nomina-${dto.periodo}`,
    sheets: buildReferenciaNominaExcelSheets(dto),
    brandDocument: "liquidacion",
    bannerDocument: "liquidacion",
  });
}
