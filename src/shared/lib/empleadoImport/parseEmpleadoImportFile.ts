// ⚠️ AGNOSTIC — parse Excel/CSV payroll files for employee import

import * as XLSX from "xlsx";
import { parseCsvText } from "./parseCsvText";

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

function excelRowsToMatrix(rows: Record<string, unknown>[]): string[][] {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const matrix: string[][] = [headers];

  rows.forEach((row) => {
    matrix.push(
      headers.map((header) => stringifyCellValue(row[header])),
    );
  });

  return matrix;
}

function stringifyCellValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).trim();
}

export async function parseEmpleadoImportFile(file: File): Promise<string[][]> {
  if (isCsvFile(file)) {
    const text = await file.text();
    return parseCsvText(text);
  }

  if (isExcelFile(file)) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new Error("El archivo Excel no contiene hojas.");
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });

    return excelRowsToMatrix(rows);
  }

  throw new Error("Formato no soportado. Usa archivos .csv, .xlsx o .xls.");
}
