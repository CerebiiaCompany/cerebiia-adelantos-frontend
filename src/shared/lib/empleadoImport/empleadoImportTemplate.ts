// ⚠️ AGNOSTIC — plantilla corporativa de importación de nómina (AdeCerebiia)

import ExcelJS from "exceljs";
import {
  EMPLEADO_IMPORT_TEMPLATE_HEADERS,
  type EmpleadoImportTemplateHeader,
} from "./empleadoImportHeaders";
import { EMPLEADO_IMPORT_ACCEPTED_BANKS } from "./empleadoImportBancos";

/** Columnas que deben conservarse como texto en Excel (evita .0 y notación científica). */
export const EMPLEADO_IMPORT_TEXT_COLUMN_INDEXES = [0, 4, 5, 7] as const;

/**
 * Encabezados alineados con POST /empleados/cargar-nomina/ (backend Django).
 * Orden estable para lectura humana; el parser del backend usa nombres, no posición.
 */
export { EMPLEADO_IMPORT_TEMPLATE_HEADERS };

/** Filas vacías preformateadas para que el usuario diligencie empleados uno a uno. */
export const EMPLEADO_IMPORT_BLANK_ROW_COUNT = 50;

function buildBlankImportRow(): string[] {
  return Array.from({ length: EMPLEADO_IMPORT_TEMPLATE_HEADERS.length }, () => "");
}

const BRAND_PRIMARY = "FF3B5BDB";
const BRAND_PRIMARY_DARK = "FF2E4A9E";
const BRAND_ACCENT = "FF7C3AED";
const HEADER_BG = "FF1E3A8A";
const HEADER_FG = "FFFFFFFF";
const ALT_ROW_BG = "FFF8FAFC";
const BORDER_COLOR = "FFE2E8F0";

const COLUMN_GUIDE: Array<{
  field: EmpleadoImportTemplateHeader;
  label: string;
  required: string;
  example: string;
  notes: string;
}> = [
  {
    field: "documento",
    label: "Número de documento",
    required: "Sí",
    example: "1014234567",
    notes: "Sin puntos ni espacios. Celda en formato texto (columna preformateada).",
  },
  {
    field: "nombre",
    label: "Nombre completo",
    required: "Sí",
    example: "Juan Carlos Pérez",
    notes: "Nombre y apellidos del empleado.",
  },
  {
    field: "salario",
    label: "Salario mensual",
    required: "Sí",
    example: "2500000",
    notes: "Valor numérico en pesos colombianos, sin separadores.",
  },
  {
    field: "banco",
    label: "Entidad financiera",
    required: "Sí",
    example: "BBVA Colombia",
    notes:
      "Nombre exacto del catálogo (ver lista inferior). No use abreviaturas: escriba «BBVA Colombia», no «BBVA».",
  },
  {
    field: "numero_cuenta",
    label: "Número de cuenta",
    required: "Sí",
    example: "12345678901",
    notes: "Formato texto. Sin espacios ni decimales (.0).",
  },
  {
    field: "tipo_documento",
    label: "Tipo de documento",
    required: "Sí",
    example: "cc",
    notes: "Valores: cc, ce, ti, pas.",
  },
  {
    field: "email",
    label: "Correo electrónico",
    required: "Sí",
    example: "empleado@empresa.com",
    notes: "Correo personal del empleado.",
  },
  {
    field: "celular",
    label: "Celular",
    required: "Sí",
    example: "3001234567",
    notes: "10 dígitos, inicia en 3. Formato texto (evita 3001234567.0).",
  },
  {
    field: "tipo_contrato",
    label: "Tipo de contrato",
    required: "Sí",
    example: "indefinido",
    notes: "indefinido, fijo, obra_labor, prestacion_servicios, aprendizaje.",
  },
  {
    field: "fecha_ingreso",
    label: "Fecha de ingreso",
    required: "Sí",
    example: "2025-03-01",
    notes: "Formato AAAA-MM-DD.",
  },
  {
    field: "tipo_cuenta",
    label: "Tipo de cuenta",
    required: "Sí",
    example: "ahorros",
    notes: "Valores: ahorros o corriente.",
  },
];

export function buildEmpleadoImportTemplateMatrix(): string[][] {
  const blankRows = Array.from({ length: EMPLEADO_IMPORT_BLANK_ROW_COUNT }, () =>
    buildBlankImportRow(),
  );

  return [[...EMPLEADO_IMPORT_TEMPLATE_HEADERS], ...blankRows];
}

function applyTextFormat(
  worksheet: ExcelJS.Worksheet,
  rowIndex: number,
  columnIndexes: readonly number[],
) {
  columnIndexes.forEach((columnIndex) => {
    const cell = worksheet.getCell(rowIndex, columnIndex + 1);
    cell.numFmt = "@";
  });
}

function applyTextFormatToColumns(
  worksheet: ExcelJS.Worksheet,
  columnIndexes: readonly number[],
  rowCount: number,
) {
  columnIndexes.forEach((columnIndex) => {
    const column = worksheet.getColumn(columnIndex + 1);
    column.numFmt = "@";

    for (let rowIndex = 1; rowIndex <= rowCount; rowIndex += 1) {
      applyTextFormat(worksheet, rowIndex, [columnIndex]);
    }
  });
}

function styleHeaderRow(worksheet: ExcelJS.Worksheet, columnCount: number) {
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;

  for (let column = 1; column <= columnCount; column += 1) {
    const cell = headerRow.getCell(column);
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: HEADER_FG },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_BG },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: BRAND_PRIMARY_DARK } },
      bottom: { style: "medium", color: { argb: BRAND_ACCENT } },
      left: { style: "thin", color: { argb: BRAND_PRIMARY_DARK } },
      right: { style: "thin", color: { argb: BRAND_PRIMARY_DARK } },
    };
  }
}

function styleDataRow(
  worksheet: ExcelJS.Worksheet,
  rowIndex: number,
  columnCount: number,
  isAlternate: boolean,
) {
  const row = worksheet.getRow(rowIndex);
  row.height = 22;

  for (let column = 1; column <= columnCount; column += 1) {
    const cell = row.getCell(column);
    cell.font = { name: "Calibri", size: 11, color: { argb: "FF1E293B" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER_COLOR } },
      bottom: { style: "thin", color: { argb: BORDER_COLOR } },
      left: { style: "thin", color: { argb: BORDER_COLOR } },
      right: { style: "thin", color: { argb: BORDER_COLOR } },
    };

    if (isAlternate) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: ALT_ROW_BG },
      };
    }
  }
}

function buildNominaWorksheet(workbook: ExcelJS.Workbook) {
  const worksheet = workbook.addWorksheet("Nomina", {
    views: [{ state: "frozen", ySplit: 1 }],
    properties: { defaultRowHeight: 22 },
  });

  const matrix = buildEmpleadoImportTemplateMatrix();
  worksheet.addRows(matrix);

  const columnWidths = [16, 32, 14, 18, 18, 16, 28, 14, 18, 14, 14];
  columnWidths.forEach((width, index) => {
    worksheet.getColumn(index + 1).width = width;
  });

  styleHeaderRow(worksheet, EMPLEADO_IMPORT_TEMPLATE_HEADERS.length);

  for (let rowIndex = 2; rowIndex <= matrix.length; rowIndex += 1) {
    styleDataRow(
      worksheet,
      rowIndex,
      EMPLEADO_IMPORT_TEMPLATE_HEADERS.length,
      rowIndex % 2 === 0,
    );
  }

  applyTextFormatToColumns(
    worksheet,
    EMPLEADO_IMPORT_TEXT_COLUMN_INDEXES,
    matrix.length,
  );

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: EMPLEADO_IMPORT_TEMPLATE_HEADERS.length },
  };

  return worksheet;
}

function buildInstructionsWorksheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Instrucciones", {
    properties: { defaultRowHeight: 20 },
  });

  sheet.mergeCells("A1:F1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "AdeCerebiia — Plantilla de importación de nómina";
  titleCell.font = {
    name: "Calibri",
    size: 16,
    bold: true,
    color: { argb: HEADER_FG },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: HEADER_BG },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 36;

  sheet.mergeCells("A2:F2");
  sheet.getCell("A2").value =
    "Complete la hoja «Nomina» desde la fila 2. No modifique los encabezados de la fila 1. Las filas vienen en blanco para que registre cada empleado.";
  sheet.getCell("A2").font = {
    name: "Calibri",
    size: 11,
    italic: true,
    color: { argb: "FF475569" },
  };
  sheet.getRow(2).height = 24;

  const steps = [
    "1. Registre un empleado por fila en la hoja «Nomina».",
    "2. Use los valores permitidos indicados en la tabla inferior.",
    "3. Guarde el archivo y utilice «Importar nómina» en el panel de empresa.",
    "4. Revise el resumen de importación: las filas válidas se guardan aunque otras fallen.",
  ];

  steps.forEach((step, index) => {
    const row = sheet.getRow(4 + index);
    row.getCell(1).value = step;
    row.getCell(1).font = { name: "Calibri", size: 11, color: { argb: "FF334155" } };
    row.height = 20;
  });

  const guideHeaderRow = sheet.getRow(10);
  ["Campo técnico", "Descripción", "Obligatorio", "Ejemplo", "Notas"].forEach(
    (label, index) => {
      const cell = guideHeaderRow.getCell(index + 1);
      cell.value = label;
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: HEADER_FG } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: BRAND_PRIMARY },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    },
  );
  guideHeaderRow.height = 26;

  COLUMN_GUIDE.forEach((column, index) => {
    const row = sheet.getRow(11 + index);
    row.getCell(1).value = column.field;
    row.getCell(2).value = column.label;
    row.getCell(3).value = column.required;
    row.getCell(4).value = column.example;
    row.getCell(5).value = column.notes;

    for (let col = 1; col <= 5; col += 1) {
      const cell = row.getCell(col);
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
      cell.alignment = { vertical: "top", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: BORDER_COLOR } },
        bottom: { style: "thin", color: { argb: BORDER_COLOR } },
        left: { style: "thin", color: { argb: BORDER_COLOR } },
        right: { style: "thin", color: { argb: BORDER_COLOR } },
      };

      if (index % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: ALT_ROW_BG },
        };
      }
    }

    row.height = 28;
  });

  sheet.getColumn(1).width = 18;
  sheet.getColumn(2).width = 24;
  sheet.getColumn(3).width = 12;
  sheet.getColumn(4).width = 22;
  sheet.getColumn(5).width = 48;

  const syntaxStartRow = 11 + COLUMN_GUIDE.length + 2;
  sheet.mergeCells(`A${syntaxStartRow}:F${syntaxStartRow}`);
  const syntaxTitle = sheet.getCell(`A${syntaxStartRow}`);
  syntaxTitle.value = "Sintaxis y formato (evitar errores de importación)";
  syntaxTitle.font = {
    name: "Calibri",
    size: 12,
    bold: true,
    color: { argb: HEADER_FG },
  };
  syntaxTitle.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: BRAND_PRIMARY },
  };
  syntaxTitle.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(syntaxStartRow).height = 26;

  const syntaxTips = [
    "• documento, numero_cuenta y celular: use las columnas en formato texto. No pegue números desde calculadora sin formato.",
    "• Si Excel muestra 1014261059.0 o 3112938473.0, el sistema rechazará la fila. Escriba solo dígitos (ej. 1014261059).",
    "• tipo_documento en minúsculas: cc, ce, ti, pas.",
    "• fecha_ingreso en formato AAAA-MM-DD (ej. 2025-03-01).",
    "• banco: copie el nombre exacto de la lista inferior. «BBVA» no es válido; use «BBVA Colombia».",
  ];

  syntaxTips.forEach((tip, index) => {
    const row = sheet.getRow(syntaxStartRow + 1 + index);
    sheet.mergeCells(`A${syntaxStartRow + 1 + index}:F${syntaxStartRow + 1 + index}`);
    row.getCell(1).value = tip;
    row.getCell(1).font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
    row.getCell(1).alignment = { wrapText: true, vertical: "top" };
    row.height = 22;
  });

  const banksStartRow = syntaxStartRow + syntaxTips.length + 3;
  sheet.mergeCells(`A${banksStartRow}:F${banksStartRow}`);
  const banksTitle = sheet.getCell(`A${banksStartRow}`);
  banksTitle.value = "Bancos y plataformas aceptados (nombre exacto en columna banco)";
  banksTitle.font = {
    name: "Calibri",
    size: 12,
    bold: true,
    color: { argb: HEADER_FG },
  };
  banksTitle.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: BRAND_PRIMARY_DARK },
  };
  banksTitle.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(banksStartRow).height = 26;

  EMPLEADO_IMPORT_ACCEPTED_BANKS.forEach((bankName, index) => {
    const row = sheet.getRow(banksStartRow + 1 + index);
    row.getCell(1).value = bankName;
    row.getCell(1).font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
    row.height = 18;
  });
}

export async function buildEmpleadoImportTemplateBuffer(): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AdeCerebiia";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.company = "Cerebiia";

  buildNominaWorksheet(workbook);
  buildInstructionsWorksheet(workbook);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

/** @deprecated Usar buildEmpleadoImportTemplateBuffer para descarga con diseño corporativo. */
export async function buildEmpleadoImportTemplateWorkbook(): Promise<ArrayBuffer> {
  return buildEmpleadoImportTemplateBuffer();
}
