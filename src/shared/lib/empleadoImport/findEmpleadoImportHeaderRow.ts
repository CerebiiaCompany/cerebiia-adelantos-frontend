// ⚠️ AGNOSTIC — localiza la fila de encabezados aunque exista banner de marca arriba

import {
  EMPLEADO_IMPORT_COLUMN_DEFS,
  resolveEmpleadoImportField,
  type EmpleadoImportField,
} from "./empleadoImportHeaders";

const REQUIRED_IMPORT_FIELDS: EmpleadoImportField[] =
  EMPLEADO_IMPORT_COLUMN_DEFS.map((column) => column.field);

/** Máximo de filas a inspeccionar buscando encabezados (banner + cabecera). */
const HEADER_SCAN_LIMIT = 20;

export function buildEmpleadoImportFieldIndexMap(
  headerRow: string[],
): Map<EmpleadoImportField, number> {
  const fieldIndexes = new Map<EmpleadoImportField, number>();

  headerRow.forEach((header, index) => {
    const field = resolveEmpleadoImportField(header);
    if (field && !fieldIndexes.has(field)) {
      fieldIndexes.set(field, index);
    }
  });

  return fieldIndexes;
}

export function hasAllRequiredImportFields(
  fieldIndexes: Map<EmpleadoImportField, number>,
): boolean {
  return REQUIRED_IMPORT_FIELDS.every((field) => fieldIndexes.has(field));
}

/**
 * Busca la fila de encabezados reales (soporta plantilla con banner de marca en fila 1).
 * Devuelve -1 si no encuentra todas las columnas requeridas.
 */
export function findEmpleadoImportHeaderRowIndex(matrix: string[][]): number {
  const limit = Math.min(matrix.length, HEADER_SCAN_LIMIT);

  for (let rowIndex = 0; rowIndex < limit; rowIndex += 1) {
    const fieldIndexes = buildEmpleadoImportFieldIndexMap(matrix[rowIndex] ?? []);
    if (hasAllRequiredImportFields(fieldIndexes)) {
      return rowIndex;
    }
  }

  return -1;
}

export function splitEmpleadoImportHeaderAndData(matrix: string[][]): {
  headerRow: string[];
  dataRows: string[][];
  headerRowIndex: number;
} {
  const headerRowIndex = findEmpleadoImportHeaderRowIndex(matrix);

  if (headerRowIndex < 0) {
    return {
      headerRow: matrix[0] ?? [],
      dataRows: matrix.slice(1),
      headerRowIndex: 0,
    };
  }

  return {
    headerRow: matrix[headerRowIndex] ?? [],
    dataRows: matrix.slice(headerRowIndex + 1),
    headerRowIndex,
  };
}
