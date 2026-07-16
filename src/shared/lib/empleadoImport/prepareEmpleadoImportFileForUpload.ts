// ⚠️ AGNOSTIC — normaliza Excel/CSV para POST /empleados/cargar-nomina/

import * as XLSX from "xlsx";
import { normalizeSalaryInput } from "@/shared/lib/currency";
import { EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER } from "./empleadoImportCatalogs";
import {
  EMPLEADO_IMPORT_BACKEND_HEADERS,
  EMPLEADO_IMPORT_TEMPLATE_HEADERS,
  resolveEmpleadoImportField,
  type EmpleadoImportField,
} from "./empleadoImportHeaders";
import { parseEmpleadoImportFile } from "./parseEmpleadoImportFile";

const REQUIRED_IMPORT_FIELDS: EmpleadoImportField[] = [
  "tipo_documento",
  "documento",
  "nombre",
  "correo",
  "celular",
  "salario",
  "tipo_contrato",
  "fecha_ingreso",
  "banco_id",
  "tipo_cuenta",
  "numero_cuenta",
];

function buildFieldIndexMap(headerRow: string[]): Map<EmpleadoImportField, number> {
  const fieldIndexes = new Map<EmpleadoImportField, number>();

  headerRow.forEach((header, index) => {
    const field = resolveEmpleadoImportField(header);
    if (field) {
      fieldIndexes.set(field, index);
    }
  });

  return fieldIndexes;
}

function validateImportFieldHeaders(
  fieldIndexes: Map<EmpleadoImportField, number>,
): void {
  const missing = REQUIRED_IMPORT_FIELDS.filter((field) => !fieldIndexes.has(field));

  if (missing.length === 0) return;

  throw new Error(
    `La plantilla no tiene las columnas requeridas (${EMPLEADO_IMPORT_TEMPLATE_HEADERS.join(", ")}). Descarga la plantilla actualizada y usa la hoja «Nomina» sin modificar los encabezados.`,
  );
}

function isTemplatePlaceholderCell(header: string, value: string): boolean {
  const field = resolveEmpleadoImportField(header);
  if (field !== "fecha_ingreso") return false;

  return value.trim().toUpperCase() === EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER;
}

function rowHasImportableData(headerRow: string[], row: string[]): boolean {
  return row.some((cell, index) => {
    const header = headerRow[index] ?? "";
    // Ignora columnas auxiliares (catálogos ocultos de desplegables, etc.).
    if (!resolveEmpleadoImportField(header)) return false;

    const trimmed = cell.trim();
    if (!trimmed) return false;
    if (isTemplatePlaceholderCell(header, trimmed)) return false;
    return true;
  });
}

export function buildBackendNominaUploadMatrix(matrix: string[][]): string[][] {
  if (matrix.length === 0) {
    throw new Error("El archivo está vacío.");
  }

  const [headerRow, ...dataRows] = matrix;
  const fieldIndexes = buildFieldIndexMap(headerRow);
  validateImportFieldHeaders(fieldIndexes);

  const uploadRows: string[][] = [[...EMPLEADO_IMPORT_BACKEND_HEADERS]];

  dataRows
    .filter((row) => rowHasImportableData(headerRow, row))
    .forEach((row) => {
      uploadRows.push(
        REQUIRED_IMPORT_FIELDS.map((field) => {
          const columnIndex = fieldIndexes.get(field);
          const raw =
            columnIndex === undefined ? "" : (row[columnIndex] ?? "").trim();
          // Backend Decimal() no acepta separadores de miles (2.000.000 / 2,000,000).
          if (field === "salario") return normalizeSalaryInput(raw);
          return raw;
        }),
      );
    });

  if (uploadRows.length === 1) {
    throw new Error(
      "No hay filas con datos para importar. Complete al menos un empleado en la hoja «Nomina».",
    );
  }

  return uploadRows;
}

function buildUploadFileName(originalName: string): string {
  const baseName = originalName.replace(/\.[^.]+$/, "").trim() || "nomina";
  return `${baseName}-upload.xlsx`;
}

/**
 * Genera un .xlsx con una sola hoja «Nomina» y encabezados oficiales del backend.
 * El parser del backend usa la primera hoja activa; las plantillas corporativas incluyen
 * hojas auxiliares (Listas, Instrucciones) que provocan error si se envían tal cual.
 */
export async function prepareEmpleadoImportFileForUpload(file: File): Promise<File> {
  const matrix = await parseEmpleadoImportFile(file);
  const uploadMatrix = buildBackendNominaUploadMatrix(matrix);

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(uploadMatrix);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Nomina");

  const buffer = XLSX.write(workbook, {
    type: "array",
    bookType: "xlsx",
  });

  return new File([buffer], buildUploadFileName(file.name), {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
