// ⚠️ AGNOSTIC — filas de ejemplo para plantilla de importación de nómina

import * as XLSX from "xlsx";
import { EMPLEADO_IMPORT_TEMPLATE_HEADERS } from "./empleadoImportHeaders";

/**
 * Cuatro empleados de ejemplo (CC, PASSPORT, CE, PPT) con formatos reales
 * aceptados por nómina y backend (PILA / Migración Colombia).
 */
export const EMPLEADO_IMPORT_TEMPLATE_ROWS: string[][] = [
  [
    "CC",
    "1014234567",
    "Juan Carlos Pérez",
    "juan.perez@empresa.com",
    "3101234567",
    "2500000",
    "indefinido",
    "2025-03-01",
    "Bancolombia",
    "ahorros",
    "12345678901",
  ],
  [
    "PASSPORT",
    "98765432",
    "María Alejandra Silva",
    "maria.silva@empresa.com",
    "3209876543",
    "3800000",
    "fijo",
    "2024-08-15",
    "Davivienda",
    "corriente",
    "9876543210",
  ],
  [
    "CE",
    "205412789",
    "Carlos Eduardo Mendoza",
    "carlos.mendoza@empresa.com",
    "3154561230",
    "2800000",
    "obra_labor",
    "2023-11-01",
    "Nequi",
    "ahorros",
    "3154561230",
  ],
  [
    "PPT",
    "4561230",
    "Ana María Gómez",
    "ana.gomez@empresa.com",
    "3005554433",
    "4200000",
    "indefinido",
    "2024-06-30",
    "Banco de Bogotá",
    "ahorros",
    "456789123456",
  ],
];

/** Índice de la columna documento (0-based) para forzar formato texto en Excel. */
export const EMPLEADO_IMPORT_TEXT_COLUMNS = [1, 10] as const;

export function buildEmpleadoImportTemplateMatrix(): string[][] {
  return [[...EMPLEADO_IMPORT_TEMPLATE_HEADERS], ...EMPLEADO_IMPORT_TEMPLATE_ROWS];
}

export function buildEmpleadoImportTemplateWorkbook(): XLSX.WorkBook {
  const matrix = buildEmpleadoImportTemplateMatrix();
  const worksheet = XLSX.utils.aoa_to_sheet(matrix);

  for (let rowIndex = 1; rowIndex < matrix.length; rowIndex += 1) {
    EMPLEADO_IMPORT_TEXT_COLUMNS.forEach((columnIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
      const value = matrix[rowIndex][columnIndex] ?? "";
      worksheet[cellAddress] = { t: "s", v: String(value) };
    });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Empleados");
  return workbook;
}
