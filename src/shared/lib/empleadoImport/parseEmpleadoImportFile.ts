// ⚠️ AGNOSTIC — parse Excel/CSV payroll files for employee import

import * as XLSX from "xlsx";
import { parseCsvText } from "./parseCsvText";
import { stringifyImportCellValue } from "./normalizeImportCellValue";

function isCsvFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith(".csv") || file.type.includes("csv");
}

function isExcelFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    file.type.includes("spreadsheet") ||
    file.type.includes("excel")
  );
}

function excelRowsToMatrix(rows: unknown[][]): string[][] {
  if (rows.length === 0) return [];

  return rows.map((row) =>
    row.map((cell) => stringifyImportCellValue(cell)),
  );
}

function stringifyCellValue(value: unknown): string {
  return stringifyImportCellValue(value);
}

export async function parseEmpleadoImportFile(file: File): Promise<string[][]> {
  if (isCsvFile(file)) {
    const text = await file.text();
    return parseCsvText(text);
  }

  if (isExcelFile(file)) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName =
      workbook.SheetNames.find((name) =>
        name.trim().toLowerCase().includes("nomina"),
      ) ?? workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error("El archivo Excel no contiene hojas.");
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
      dateNF: "yyyy-mm-dd",
    });

    return excelRowsToMatrix(rows);
  }

  throw new Error("Formato no soportado. Usa archivos .csv, .xlsx o .xls.");
}
