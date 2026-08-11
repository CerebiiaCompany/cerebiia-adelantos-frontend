// ⚠️ AGNOSTIC — Excel tipo cuenta de cobro al suspender (cartera pendiente)

import type {
  CarteraCuotaPendienteDTO,
  CarteraPendienteEmpleadoDTO,
} from "@/shared/api/types";
import {
  downloadBrandedExcelMultiSheetReport,
  type BrandedExcelCellValue,
  type BrandedExcelSheetOptions,
} from "./excelReport";

const DETALLE_HEADERS = [
  "Documento",
  "Empleado",
  "ID solicitud",
  "Cuota #",
  "Monto cuota",
  "Tarifa",
  "Monto recibido por cuota",
  "Fecha corte",
  "Monto adelantado",
  "Neto adelanto",
  "Fecha desembolso",
  "Total a descontar fila",
] as const;

/** Moneda: monto cuota, tarifa (info), recibido/cuota, adelanto, neto, total fila. */
const DETALLE_CURRENCY_COLUMNS = [4, 5, 6, 8, 9, 11];

const RESUMEN_HEADERS = [
  "Documento",
  "Empleado",
  "ID solicitud",
  "Cantidad de cuotas",
  "Cuotas pendientes",
  "Monto adelantado",
  "Comisión del adelanto",
  "Monto recibido empleado",
  "Fecha desembolso",
  "Capital pendiente",
  "Total a descontar",
] as const;

/** Comisión es informativa (ya descontada al envío); no entra al total a descontar. */
const RESUMEN_CURRENCY_COLUMNS = [5, 6, 7, 9, 10];

function parseAmount(value: string | number | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Total a descontar en nómina = solo capital de cuotas (nunca comisión). */
export function resolveTotalADescontar(
  totales: CarteraPendienteEmpleadoDTO["totales"],
): number {
  return parseAmount(totales.total_capital);
}

function formatDateYmd(iso: string | null | undefined): string {
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildFilename(documento: string, generatedAt: Date): string {
  const y = generatedAt.getFullYear();
  const m = String(generatedAt.getMonth() + 1).padStart(2, "0");
  const day = String(generatedAt.getDate()).padStart(2, "0");
  const safeDoc = (documento || "empleado").replace(/[^\w.-]+/g, "_");
  return `cuenta-cobro-cartera-${safeDoc}-${y}${m}${day}.xlsx`;
}

/**
 * Parte el neto del adelanto entre cuotas (la última absorbe el residuo).
 * Así se entiende cuánto “recibió” el empleado por cada cuota.
 */
export function montoRecibidoPorCuota(
  netoAdelanto: number,
  numeroCuotas: number,
  numeroCuota: number,
): number {
  if (numeroCuotas <= 0) return 0;
  const base = Math.floor(netoAdelanto / numeroCuotas);
  const residuo = netoAdelanto - base * numeroCuotas;
  return numeroCuota === numeroCuotas ? base + residuo : base;
}

type AdelantoResumen = {
  solicitudId: string;
  numeroCuotasTotal: number;
  cuotasPendientes: number;
  montoAdelantado: number;
  comision: number;
  neto: number;
  pagadoEn: string | null;
  capitalPendiente: number;
};

/** Orden de aparición de adelantos + notación tipo cuenta de cobro `1+2+1`. */
export function buildComposicionAdelantos(
  cuotas: CarteraCuotaPendienteDTO[],
): {
  composicion: string;
  cantidadAdelantos: number;
  porAdelanto: AdelantoResumen[];
} {
  const orden: string[] = [];
  const map = new Map<string, AdelantoResumen>();

  for (const c of cuotas) {
    const sid = c.solicitud_id;
    let entry = map.get(sid);
    if (!entry) {
      orden.push(sid);
      entry = {
        solicitudId: sid,
        numeroCuotasTotal: c.numero_cuotas_total,
        cuotasPendientes: 0,
        montoAdelantado: parseAmount(c.monto_solicitud),
        comision: parseAmount(c.tarifa_total),
        neto: parseAmount(c.monto_neto),
        pagadoEn: c.pagado_en,
        capitalPendiente: 0,
      };
      map.set(sid, entry);
    }
    entry.cuotasPendientes += 1;
    entry.capitalPendiente += parseAmount(c.cuota_monto);
  }

  const porAdelanto = orden.map((id) => map.get(id)!);
  const composicion = porAdelanto.length
    ? porAdelanto.map((a) => String(a.numeroCuotasTotal)).join("+")
    : "0";

  return {
    composicion,
    cantidadAdelantos: porAdelanto.length,
    porAdelanto,
  };
}

function emptyDetalleRow(
  documento: string,
  nombre: string,
  nota: string,
): BrandedExcelCellValue[] {
  return [documento, nombre, nota, "", 0, 0, 0, "", 0, 0, "", 0];
}

function buildDetalleFooter(
  totales: CarteraPendienteEmpleadoDTO["totales"],
  composicion: string,
  cantidadAdelantos: number,
): BrandedExcelCellValue[][] {
  const totalDescontar = resolveTotalADescontar(totales);
  return [
    [
      "Composición adelantos (cuotas)",
      composicion,
      `${cantidadAdelantos} adelanto(s)`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "Total capital",
      "",
      "",
      totales.cantidad_cuotas,
      parseAmount(totales.total_capital),
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "Tarifas (ya descontadas al envío)",
      "",
      "",
      "",
      "",
      parseAmount(totales.total_tarifas),
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "TOTAL A DESCONTAR",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      totalDescontar,
    ],
  ];
}

/**
 * Hoja 1: detalle por cuota (estructura cuenta de cobro + monto recibido por cuota).
 * Total a descontar = solo monto cuota (la tarifa ya salió del neto al desembolsar).
 */
export function buildCarteraDetalleSheet(
  cartera: CarteraPendienteEmpleadoDTO,
): BrandedExcelSheetOptions {
  const { empleado, cuotas_pendientes, totales } = cartera;
  const { composicion, cantidadAdelantos } =
    buildComposicionAdelantos(cuotas_pendientes);
  const footerRows = buildDetalleFooter(
    totales,
    composicion,
    cantidadAdelantos,
  );

  if (!cuotas_pendientes.length) {
    return {
      sheetName: "Cuenta de cobro",
      headers: [...DETALLE_HEADERS],
      rows: [
        emptyDetalleRow(
          empleado.documento,
          empleado.nombre,
          "Sin deuda pendiente / cartera saneada",
        ),
      ],
      footerRows,
      currencyColumnIndexes: DETALLE_CURRENCY_COLUMNS,
      columnWidths: [14, 26, 36, 10, 14, 12, 18, 12, 16, 14, 16, 16],
    };
  }

  const rows: BrandedExcelCellValue[][] = cuotas_pendientes.map((c) => {
    const monto = parseAmount(c.cuota_monto);
    const tarifa = parseAmount(c.tarifa_cuota);
    const neto = parseAmount(c.monto_neto);
    const nCuotas = Math.max(1, c.numero_cuotas_total);
    return [
      empleado.documento,
      empleado.nombre,
      c.solicitud_id,
      c.cuota_numero,
      monto,
      tarifa,
      montoRecibidoPorCuota(neto, nCuotas, c.cuota_numero),
      formatDateYmd(c.fecha_corte),
      parseAmount(c.monto_solicitud),
      neto,
      formatDateYmd(c.pagado_en),
      monto,
    ];
  });

  return {
    sheetName: "Cuenta de cobro",
    headers: [...DETALLE_HEADERS],
    rows,
    footerRows,
    currencyColumnIndexes: DETALLE_CURRENCY_COLUMNS,
    columnWidths: [14, 26, 36, 10, 14, 12, 18, 12, 16, 14, 16, 16],
  };
}

/**
 * Hoja 2: un renglón por adelanto.
 * Comisión solo informativa; total a descontar = capital pendiente de cuotas.
 */
export function buildCarteraResumenAdelantosSheet(
  cartera: CarteraPendienteEmpleadoDTO,
): BrandedExcelSheetOptions {
  const { empleado, cuotas_pendientes, totales } = cartera;
  const { composicion, cantidadAdelantos, porAdelanto } =
    buildComposicionAdelantos(cuotas_pendientes);
  const totalDescontar = resolveTotalADescontar(totales);

  if (!porAdelanto.length) {
    return {
      sheetName: "Resumen adelantos",
      headers: [...RESUMEN_HEADERS],
      rows: [
        [
          empleado.documento,
          empleado.nombre,
          "Sin adelantos con deuda pendiente",
          0,
          0,
          0,
          0,
          0,
          "",
          0,
          0,
        ],
      ],
      footerRows: [
        [
          "Composición",
          "0",
          "0 adelanto(s)",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          totalDescontar,
        ],
      ],
      currencyColumnIndexes: RESUMEN_CURRENCY_COLUMNS,
      columnWidths: [14, 26, 36, 16, 16, 16, 18, 18, 16, 16, 16],
    };
  }

  const rows: BrandedExcelCellValue[][] = porAdelanto.map((a) => [
    empleado.documento,
    empleado.nombre,
    a.solicitudId,
    a.numeroCuotasTotal,
    a.cuotasPendientes,
    a.montoAdelantado,
    a.comision,
    a.neto,
    formatDateYmd(a.pagadoEn),
    a.capitalPendiente,
    a.capitalPendiente,
  ]);

  return {
    sheetName: "Resumen adelantos",
    headers: [...RESUMEN_HEADERS],
    rows,
    footerRows: [
      [
        "Composición adelantos (cuotas)",
        composicion,
        `${cantidadAdelantos} adelanto(s)`,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        "TOTAL A DESCONTAR",
        "",
        "",
        "",
        totales.cantidad_cuotas,
        parseAmount(totales.total_capital),
        parseAmount(totales.total_tarifas),
        "",
        "",
        parseAmount(totales.total_capital),
        totalDescontar,
      ],
    ],
    currencyColumnIndexes: RESUMEN_CURRENCY_COLUMNS,
    columnWidths: [14, 26, 36, 16, 16, 16, 18, 18, 16, 16, 16],
  };
}

/** @deprecated Preferir buildCarteraDetalleSheet; se mantiene para tests legacy. */
export function buildCarteraReportRows(cartera: CarteraPendienteEmpleadoDTO): {
  headers: string[];
  rows: BrandedExcelCellValue[][];
  footerRows: BrandedExcelCellValue[][];
  currencyColumnIndexes: number[];
} {
  const sheet = buildCarteraDetalleSheet(cartera);
  return {
    headers: sheet.headers,
    rows: sheet.rows,
    footerRows: sheet.footerRows ?? [],
    currencyColumnIndexes: sheet.currencyColumnIndexes ?? [],
  };
}

/**
 * Genera y descarga el Excel de cuenta de cobro (detalle + resumen por adelanto).
 */
export async function downloadEmpleadoCarteraReport(
  cartera: CarteraPendienteEmpleadoDTO,
): Promise<void> {
  const generatedAt = cartera.generado_en
    ? new Date(cartera.generado_en)
    : new Date();

  await downloadBrandedExcelMultiSheetReport({
    filename: buildFilename(cartera.empleado.documento, generatedAt),
    sheets: [
      buildCarteraDetalleSheet(cartera),
      buildCarteraResumenAdelantosSheet(cartera),
    ],
  });
}
