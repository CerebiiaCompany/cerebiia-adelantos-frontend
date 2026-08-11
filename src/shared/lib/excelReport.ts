// ⚠️ AGNOSTIC — reportes Excel con estilo corporativo (misma línea visual que plantilla de nómina)

import ExcelJS from "exceljs";
import { downloadExcelBuffer } from "./excel";
import {
  DEFAULT_EXCEL_COLOR_PALETTE,
  resolveExcelBrandForDocument,
  type ExcelBrandDocument,
  type ExcelColorPalette,
} from "./excelBranding";
import {
  EXCEL_LOGO_COLUMN_WIDTH,
  applyModernExcelBrandBanner,
  getExcelDocumentTitle,
  stretchExcelImagesToAnchor,
  type ExcelBannerDocument,
} from "./excelBrandBanner";

/** Paleta por defecto (compatibilidad). Preferir resolveExcelBrandForDocument. */
export const EXCEL_BRAND = {
  ...DEFAULT_EXCEL_COLOR_PALETTE,
  currencyFmt: "#,##0",
  fontName: "Calibri",
  fontSize: 11,
  headerHeight: 28,
  rowHeight: 22,
} as const;

export type BrandedExcelCellValue = string | number | null | undefined;

export type BrandedExcelSheetOptions = {
  sheetName: string;
  headers: string[];
  rows: BrandedExcelCellValue[][];
  /** Índices 0-based de columnas con formato moneda (#,##0). */
  currencyColumnIndexes?: number[];
  /** Anchos opcionales por columna (caracteres). */
  columnWidths?: number[];
  /**
   * Filas de totales al final (fondo suave + negrita).
   * Inserta una fila vacía separadora antes de los totales.
   */
  footerRows?: BrandedExcelCellValue[][];
  /** Título del banner (solo diseño). */
  bannerTitle?: string;
};

export type BrandedExcelReportOptions = Omit<
  BrandedExcelSheetOptions,
  "sheetName"
> & {
  filename: string;
  sheetName?: string;
  /**
   * Qué personalización de marca aplica (solo colores/logo).
   * No altera filas ni lógica del reporte.
   */
  brandDocument?: ExcelBrandDocument;
  /** Clave de título predefinido del banner, si no se pasa bannerTitle. */
  bannerDocument?: ExcelBannerDocument;
};

function estimateColumnWidth(
  header: string,
  rows: BrandedExcelCellValue[][],
  columnIndex: number,
): number {
  let maxLen = header.length;
  rows.forEach((row) => {
    const value = row[columnIndex];
    if (value == null || value === "") return;
    maxLen = Math.max(maxLen, String(value).length);
  });
  return Math.min(Math.max(maxLen + 2, 12), 42);
}

function styleHeaderCell(cell: ExcelJS.Cell, palette: ExcelColorPalette): void {
  cell.font = {
    name: EXCEL_BRAND.fontName,
    size: EXCEL_BRAND.fontSize,
    bold: true,
    color: { argb: palette.headerFg },
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: palette.headerBg },
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  cell.border = {
    top: { style: "thin", color: { argb: palette.primaryDark } },
    bottom: { style: "medium", color: { argb: palette.accent } },
    left: { style: "thin", color: { argb: palette.primaryDark } },
    right: { style: "thin", color: { argb: palette.primaryDark } },
  };
}

function styleBodyCell(
  cell: ExcelJS.Cell,
  palette: ExcelColorPalette,
  options: {
    isAlternate: boolean;
    isCurrency: boolean;
    isFooter: boolean;
  },
): void {
  cell.font = {
    name: EXCEL_BRAND.fontName,
    size: EXCEL_BRAND.fontSize,
    bold: options.isFooter,
    color: { argb: palette.text },
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: options.isCurrency ? "right" : "left",
  };
  cell.border = {
    top: { style: "thin", color: { argb: palette.border } },
    bottom: { style: "thin", color: { argb: palette.border } },
    left: { style: "thin", color: { argb: palette.border } },
    right: { style: "thin", color: { argb: palette.border } },
  };

  if (options.isFooter) {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: palette.footerBg },
    };
  } else if (options.isAlternate) {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: palette.altRowBg },
    };
  }

  if (options.isCurrency && typeof cell.value === "number") {
    cell.numFmt = EXCEL_BRAND.currencyFmt;
  }
}

function normalizeCellValue(
  value: BrandedExcelCellValue,
): string | number | null {
  if (value == null || value === "") return null;
  return value;
}

function writeStyledRow(
  worksheet: ExcelJS.Worksheet,
  values: BrandedExcelCellValue[],
  columnCount: number,
  currencySet: Set<number>,
  palette: ExcelColorPalette,
  options: { isAlternate: boolean; isFooter: boolean },
): void {
  const excelRow = worksheet.addRow(
    Array.from({ length: columnCount }, (_, index) =>
      normalizeCellValue(values[index]),
    ),
  );
  excelRow.height = EXCEL_BRAND.rowHeight;

  for (let column = 1; column <= columnCount; column += 1) {
    styleBodyCell(excelRow.getCell(column), palette, {
      isAlternate: options.isAlternate,
      isCurrency: currencySet.has(column - 1),
      isFooter: options.isFooter,
    });
  }
}

async function tryAddLogoBanner(
  workbook: ExcelJS.Workbook,
  worksheet: ExcelJS.Worksheet,
  logoDataUrl: string | null,
  columnCount: number,
  palette: ExcelColorPalette,
  title: string,
): Promise<number> {
  return applyModernExcelBrandBanner({
    workbook,
    worksheet,
    columnCount,
    palette,
    logoDataUrl,
    title,
  });
}

/** Agrega una hoja con el estilo corporativo a un workbook existente. */
export async function appendBrandedSheet(
  workbook: ExcelJS.Workbook,
  options: BrandedExcelSheetOptions,
  brandDocument: ExcelBrandDocument = "reporte",
  bannerDocument: ExcelBannerDocument = "movimientos",
): Promise<ExcelJS.Worksheet> {
  const {
    sheetName,
    headers,
    rows,
    currencyColumnIndexes = [],
    columnWidths,
    footerRows = [],
    bannerTitle,
  } = options;

  const { palette, logoDataUrl } = resolveExcelBrandForDocument(brandDocument);

  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const columnCount = headers.length;
  const currencySet = new Set(currencyColumnIndexes);
  const widthSourceRows = [...rows, ...footerRows];

  worksheet.columns = headers.map((header, index) => ({
    header,
    width:
      columnWidths?.[index] ??
      estimateColumnWidth(header, widthSourceRows, index),
  }));

  const bannerOffset = await tryAddLogoBanner(
    workbook,
    worksheet,
    logoDataUrl,
    columnCount,
    palette,
    bannerTitle ?? getExcelDocumentTitle(bannerDocument),
  );

  // Restaurar ancho de A1 (worksheet.columns puede haberlo sobrescrito).
  worksheet.getColumn(1).width = EXCEL_LOGO_COLUMN_WIDTH;

  const headerRowIndex = 1 + bannerOffset;
  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.height = EXCEL_BRAND.headerHeight;
  for (let column = 1; column <= columnCount; column += 1) {
    styleHeaderCell(headerRow.getCell(column), palette);
  }

  worksheet.views = [{ state: "frozen", ySplit: headerRowIndex }];

  rows.forEach((rowValues, index) => {
    writeStyledRow(worksheet, rowValues, columnCount, currencySet, palette, {
      isAlternate: (index + 1) % 2 === 0,
      isFooter: false,
    });
  });

  if (footerRows.length > 0) {
    worksheet.addRow(Array.from({ length: columnCount }, () => null));
    footerRows.forEach((rowValues) => {
      writeStyledRow(worksheet, rowValues, columnCount, currencySet, palette, {
        isAlternate: false,
        isFooter: true,
      });
    });
  }

  return worksheet;
}

/** Construye un workbook ExcelJS con el look & feel de la plantilla de nómina. */
export async function buildBrandedExcelWorkbook(
  options: BrandedExcelReportOptions,
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AdeCerebiia";
  workbook.created = new Date();
  await appendBrandedSheet(
    workbook,
    {
      sheetName: options.sheetName ?? "Reporte",
      headers: options.headers,
      rows: options.rows,
      currencyColumnIndexes: options.currencyColumnIndexes,
      columnWidths: options.columnWidths,
      footerRows: options.footerRows,
      bannerTitle: options.bannerTitle,
    },
    options.brandDocument ?? "reporte",
    options.bannerDocument ?? "movimientos",
  );
  return workbook;
}

/** Workbook con varias hojas (mismo estilo corporativo). */
export async function buildBrandedExcelMultiSheetWorkbook(
  sheets: BrandedExcelSheetOptions[],
  brandDocument: ExcelBrandDocument = "liquidacion",
  bannerDocument: ExcelBannerDocument = "liquidacion",
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AdeCerebiia";
  workbook.created = new Date();
  for (const sheet of sheets) {
    await appendBrandedSheet(workbook, sheet, brandDocument, bannerDocument);
  }
  return workbook;
}

/**
 * Genera y descarga un .xlsx con el look corporativo (solo diseño).
 * No altera los datos del reporte.
 */
export async function downloadBrandedExcelReport(
  options: BrandedExcelReportOptions,
): Promise<void> {
  const workbook = await buildBrandedExcelWorkbook(options);
  const raw = await workbook.xlsx.writeBuffer();
  const buffer = await stretchExcelImagesToAnchor(raw as ArrayBuffer);
  downloadExcelBuffer(options.filename, buffer);
}

/** Descarga un .xlsx con varias hojas corporativas. */
export async function downloadBrandedExcelMultiSheetReport(options: {
  filename: string;
  sheets: BrandedExcelSheetOptions[];
  brandDocument?: ExcelBrandDocument;
  bannerDocument?: ExcelBannerDocument;
}): Promise<void> {
  const workbook = await buildBrandedExcelMultiSheetWorkbook(
    options.sheets,
    options.brandDocument ?? "liquidacion",
    options.bannerDocument ?? "liquidacion",
  );
  const raw = await workbook.xlsx.writeBuffer();
  const buffer = await stretchExcelImagesToAnchor(raw as ArrayBuffer);
  downloadExcelBuffer(options.filename, buffer);
}
