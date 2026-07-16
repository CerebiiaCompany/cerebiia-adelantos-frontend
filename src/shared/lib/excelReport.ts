// ⚠️ AGNOSTIC — reportes Excel con estilo corporativo (misma línea visual que plantilla de nómina)

import ExcelJS from "exceljs";
import { downloadExcelBuffer } from "./excel";

/** Misma paleta que `empleadoImportTemplate` (plantilla de nómina). */
export const EXCEL_BRAND = {
  primaryDark: "FF2E4A9E",
  accent: "FF7C3AED",
  headerBg: "FF1E3A8A",
  headerFg: "FFFFFFFF",
  altRowBg: "FFF8FAFC",
  border: "FFE2E8F0",
  text: "FF1E293B",
  footerBg: "FFEFF6FF",
  currencyFmt: "#,##0",
  fontName: "Calibri",
  fontSize: 11,
  headerHeight: 28,
  rowHeight: 22,
} as const;

export type BrandedExcelCellValue = string | number | null | undefined;

export type BrandedExcelReportOptions = {
  filename: string;
  sheetName?: string;
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

function styleHeaderCell(cell: ExcelJS.Cell): void {
  cell.font = {
    name: EXCEL_BRAND.fontName,
    size: EXCEL_BRAND.fontSize,
    bold: true,
    color: { argb: EXCEL_BRAND.headerFg },
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: EXCEL_BRAND.headerBg },
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };
  cell.border = {
    top: { style: "thin", color: { argb: EXCEL_BRAND.primaryDark } },
    bottom: { style: "medium", color: { argb: EXCEL_BRAND.accent } },
    left: { style: "thin", color: { argb: EXCEL_BRAND.primaryDark } },
    right: { style: "thin", color: { argb: EXCEL_BRAND.primaryDark } },
  };
}

function styleBodyCell(
  cell: ExcelJS.Cell,
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
    color: { argb: EXCEL_BRAND.text },
  };
  cell.alignment = {
    vertical: "middle",
    horizontal: options.isCurrency ? "right" : "left",
  };
  cell.border = {
    top: { style: "thin", color: { argb: EXCEL_BRAND.border } },
    bottom: { style: "thin", color: { argb: EXCEL_BRAND.border } },
    left: { style: "thin", color: { argb: EXCEL_BRAND.border } },
    right: { style: "thin", color: { argb: EXCEL_BRAND.border } },
  };

  if (options.isFooter) {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EXCEL_BRAND.footerBg },
    };
  } else if (options.isAlternate) {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EXCEL_BRAND.altRowBg },
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
  options: { isAlternate: boolean; isFooter: boolean },
): void {
  const excelRow = worksheet.addRow(
    Array.from({ length: columnCount }, (_, index) =>
      normalizeCellValue(values[index]),
    ),
  );
  excelRow.height = EXCEL_BRAND.rowHeight;

  for (let column = 1; column <= columnCount; column += 1) {
    styleBodyCell(excelRow.getCell(column), {
      isAlternate: options.isAlternate,
      isCurrency: currencySet.has(column - 1),
      isFooter: options.isFooter,
    });
  }
}

/** Construye un workbook ExcelJS con el look & feel de la plantilla de nómina. */
export async function buildBrandedExcelWorkbook(
  options: BrandedExcelReportOptions,
): Promise<ExcelJS.Workbook> {
  const {
    sheetName = "Reporte",
    headers,
    rows,
    currencyColumnIndexes = [],
    columnWidths,
    footerRows = [],
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AdeCerebiia";
  workbook.created = new Date();

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

  const headerRow = worksheet.getRow(1);
  headerRow.height = EXCEL_BRAND.headerHeight;
  for (let column = 1; column <= columnCount; column += 1) {
    styleHeaderCell(headerRow.getCell(column));
  }

  rows.forEach((rowValues, index) => {
    writeStyledRow(worksheet, rowValues, columnCount, currencySet, {
      isAlternate: (index + 1) % 2 === 0,
      isFooter: false,
    });
  });

  if (footerRows.length > 0) {
    worksheet.addRow(Array.from({ length: columnCount }, () => null));
    footerRows.forEach((rowValues) => {
      writeStyledRow(worksheet, rowValues, columnCount, currencySet, {
        isAlternate: false,
        isFooter: true,
      });
    });
  }

  return workbook;
}

/**
 * Genera y descarga un .xlsx con el estilo corporativo de la plantilla de nómina.
 */
export async function downloadBrandedExcelReport(
  options: BrandedExcelReportOptions,
): Promise<void> {
  const workbook = await buildBrandedExcelWorkbook(options);
  const buffer = await workbook.xlsx.writeBuffer();
  downloadExcelBuffer(options.filename, buffer as ArrayBuffer);
}
