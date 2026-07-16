// ⚠️ AGNOSTIC — plantilla corporativa de importación de nómina (AdeCerebiia)

import ExcelJS from "exceljs";
import {
  EMPLEADO_IMPORT_ACCOUNT_TYPES,
  EMPLEADO_IMPORT_CONTRACT_TYPES,
  EMPLEADO_IMPORT_DOCUMENT_TYPES,
  EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER,
  getEmpleadoImportListSheetName,
  resolveEmpleadoImportBancoNames,
  type EmpleadoImportListRanges,
  type EmpleadoImportTemplateOptions,
} from "./empleadoImportCatalogs";
import {
  applyExcelColumnInputHint,
  applyExcelListValidation,
  buildExcelListRange,
} from "./empleadoImportExcelValidation";
import {
  EMPLEADO_IMPORT_TEMPLATE_HEADERS,
  getEmpleadoImportColumnIndexByField,
  type EmpleadoImportField,
} from "./empleadoImportHeaders";

export { getEmpleadoImportListSheetName, EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER } from "./empleadoImportCatalogs";
export type { EmpleadoImportTemplateOptions } from "./empleadoImportCatalogs";

/** Columnas en formato texto: documento, celular, numero_cuenta (índice 0-based). */
export const EMPLEADO_IMPORT_TEXT_COLUMN_INDEXES = [1, 4, 10] as const;

/**
 * Encabezados humanizados de la plantilla Excel.
 * Al subir, se normalizan a snake_case del backend (ver prepareEmpleadoImportFileForUpload).
 */
export { EMPLEADO_IMPORT_TEMPLATE_HEADERS };

/** Filas vacías preformateadas para que el usuario diligencie empleados uno a uno. */
export const EMPLEADO_IMPORT_BLANK_ROW_COUNT = 50;

function buildBlankImportRow(): string[] {
  const fechaIngresoIndex = getEmpleadoImportColumnIndexByField("fecha_ingreso");

  return EMPLEADO_IMPORT_TEMPLATE_HEADERS.map((_, index) =>
    index === fechaIngresoIndex ? EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER : "",
  );
}

const BRAND_PRIMARY = "FF3B5BDB";
const BRAND_PRIMARY_DARK = "FF2E4A9E";
const BRAND_ACCENT = "FF7C3AED";
const HEADER_BG = "FF1E3A8A";
const HEADER_FG = "FFFFFFFF";
const ALT_ROW_BG = "FFF8FAFC";
const BORDER_COLOR = "FFE2E8F0";

const COLUMN_GUIDE: Array<{
  field: EmpleadoImportField;
  label: string;
  required: string;
  example: string;
  notes: string;
}> = [
  {
    field: "tipo_documento",
    label: "Tipo de documento",
    required: "Sí",
    example: "cc",
    notes: "Use el desplegable: cc, ce, ti o pas.",
  },
  {
    field: "documento",
    label: "Número de documento",
    required: "Sí",
    example: "1014234567",
    notes: "Sin puntos ni espacios. Celda en formato texto.",
  },
  {
    field: "nombre",
    label: "Nombre completo",
    required: "Sí",
    example: "Juan Carlos Pérez",
    notes: "Nombre y apellidos del empleado.",
  },
  {
    field: "correo",
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
    field: "salario",
    label: "Salario mensual",
    required: "Sí",
    example: "2.500.000",
    notes:
      "Pesos colombianos. La columna formatea miles/millones al digitar (ej. 2500000 → 2.500.000).",
  },
  {
    field: "tipo_contrato",
    label: "Tipo de contrato",
    required: "Sí",
    example: "indefinido",
    notes: "Use el desplegable de tipos de contrato.",
  },
  {
    field: "fecha_ingreso",
    label: "Fecha de ingreso",
    required: "Sí",
    example: "2025-03-01",
    notes: "Reemplace AAAA-MM-DD por la fecha real (ej. 2025-03-01).",
  },
  {
    field: "banco_id",
    label: "Entidad financiera",
    required: "Sí",
    example: "BBVA Colombia",
    notes:
      "Use el desplegable. Nombre exacto del catálogo (ej. «BBVA Colombia», no «BBVA»).",
  },
  {
    field: "tipo_cuenta",
    label: "Tipo de cuenta",
    required: "Sí",
    example: "ahorros",
    notes: "Use el desplegable: ahorros o corriente.",
  },
  {
    field: "numero_cuenta",
    label: "Número de cuenta",
    required: "Sí",
    example: "12345678901",
    notes: "Formato texto. Sin espacios ni decimales (.0).",
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

/** Miles/millones (Excel usa #,##0; en es-CO se ve como 2.000.000). */
const SALARIO_COLUMN_NUM_FMT = "#,##0";

function applySalarioNumberFormat(
  worksheet: ExcelJS.Worksheet,
  rowCount: number,
) {
  const columnIndex = columnIndexForField("salario");
  const column = worksheet.getColumn(columnIndex);
  column.numFmt = SALARIO_COLUMN_NUM_FMT;
  column.alignment = { horizontal: "right", vertical: "middle" };

  for (let rowIndex = 2; rowIndex <= rowCount; rowIndex += 1) {
    const cell = worksheet.getCell(rowIndex, columnIndex);
    cell.numFmt = SALARIO_COLUMN_NUM_FMT;
    cell.alignment = { horizontal: "right", vertical: "middle" };
  }
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

function columnIndexForField(field: EmpleadoImportField): number {
  return getEmpleadoImportColumnIndexByField(field) + 1;
}

/**
 * Columnas ocultas en «Nomina» con las fuentes de los desplegables.
 * Excel Online no resuelve validaciones que apuntan a otra hoja (p.ej. Listas).
 */
const NOMINA_LIST_SOURCE_START_COLUMN = 40;

function writeNominaCatalogListSources(
  worksheet: ExcelJS.Worksheet,
  options?: EmpleadoImportTemplateOptions,
): EmpleadoImportListRanges {
  const bancos = resolveEmpleadoImportBancoNames(options);
  const bancosCol = NOMINA_LIST_SOURCE_START_COLUMN;
  const tipoDocumentoCol = NOMINA_LIST_SOURCE_START_COLUMN + 1;
  const tipoContratoCol = NOMINA_LIST_SOURCE_START_COLUMN + 2;
  const tipoCuentaCol = NOMINA_LIST_SOURCE_START_COLUMN + 3;

  bancos.forEach((nombre, index) => {
    worksheet.getCell(index + 1, bancosCol).value = nombre;
  });

  EMPLEADO_IMPORT_DOCUMENT_TYPES.forEach((value, index) => {
    worksheet.getCell(index + 1, tipoDocumentoCol).value = value;
  });

  EMPLEADO_IMPORT_CONTRACT_TYPES.forEach((value, index) => {
    worksheet.getCell(index + 1, tipoContratoCol).value = value;
  });

  EMPLEADO_IMPORT_ACCOUNT_TYPES.forEach((value, index) => {
    worksheet.getCell(index + 1, tipoCuentaCol).value = value;
  });

  for (let column = bancosCol; column <= tipoCuentaCol; column += 1) {
    worksheet.getColumn(column).hidden = true;
    worksheet.getColumn(column).width = 18;
  }

  return {
    bancos: buildExcelListRange(null, bancosCol, bancos.length),
    tipoDocumento: buildExcelListRange(
      null,
      tipoDocumentoCol,
      EMPLEADO_IMPORT_DOCUMENT_TYPES.length,
    ),
    tipoContrato: buildExcelListRange(
      null,
      tipoContratoCol,
      EMPLEADO_IMPORT_CONTRACT_TYPES.length,
    ),
    tipoCuenta: buildExcelListRange(
      null,
      tipoCuentaCol,
      EMPLEADO_IMPORT_ACCOUNT_TYPES.length,
    ),
  };
}

function buildListasWorksheet(
  workbook: ExcelJS.Workbook,
  options?: EmpleadoImportTemplateOptions,
): void {
  const sheetName = getEmpleadoImportListSheetName();
  const sheet = workbook.addWorksheet(sheetName, { state: "hidden" });

  const bancos = resolveEmpleadoImportBancoNames(options);
  bancos.forEach((nombre, index) => {
    sheet.getCell(index + 1, 1).value = nombre;
  });

  EMPLEADO_IMPORT_DOCUMENT_TYPES.forEach((value, index) => {
    sheet.getCell(index + 1, 2).value = value;
  });

  EMPLEADO_IMPORT_CONTRACT_TYPES.forEach((value, index) => {
    sheet.getCell(index + 1, 3).value = value;
  });

  EMPLEADO_IMPORT_ACCOUNT_TYPES.forEach((value, index) => {
    sheet.getCell(index + 1, 4).value = value;
  });
}

function applyNominaCatalogValidations(
  worksheet: ExcelJS.Worksheet,
  listRanges: EmpleadoImportListRanges,
  lastDataRow: number,
) {
  const firstDataRow = 2;

  applyExcelListValidation(
    worksheet,
    columnIndexForField("banco_id"),
    listRanges.bancos,
    "Seleccione el banco o plataforma de la lista (nombre exacto).",
    firstDataRow,
    lastDataRow,
  );

  applyExcelListValidation(
    worksheet,
    columnIndexForField("tipo_documento"),
    listRanges.tipoDocumento,
    "Seleccione el tipo de documento: cc, ce, ti o pas.",
    firstDataRow,
    lastDataRow,
  );

  applyExcelListValidation(
    worksheet,
    columnIndexForField("tipo_contrato"),
    listRanges.tipoContrato,
    "Seleccione el tipo de contrato de la lista.",
    firstDataRow,
    lastDataRow,
  );

  applyExcelListValidation(
    worksheet,
    columnIndexForField("tipo_cuenta"),
    listRanges.tipoCuenta,
    "Seleccione ahorros o corriente.",
    firstDataRow,
    lastDataRow,
  );

  applyExcelColumnInputHint(
    worksheet,
    columnIndexForField("fecha_ingreso"),
    `Reemplace ${EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER} por la fecha real (ej. 2025-03-01).`,
    firstDataRow,
    lastDataRow,
  );
}

function applyFechaIngresoPlaceholderStyle(
  worksheet: ExcelJS.Worksheet,
  firstDataRow: number,
  lastDataRow: number,
) {
  const columnIndex = columnIndexForField("fecha_ingreso");

  for (let rowIndex = firstDataRow; rowIndex <= lastDataRow; rowIndex += 1) {
    const cell = worksheet.getCell(rowIndex, columnIndex);
    if (cell.value === EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER) {
      cell.font = {
        name: "Calibri",
        size: 11,
        italic: true,
        color: { argb: "FF94A3B8" },
      };
    }
  }
}

function buildNominaWorksheet(
  workbook: ExcelJS.Workbook,
  options?: EmpleadoImportTemplateOptions,
) {
  const worksheet = workbook.addWorksheet("Nomina", {
    views: [{ state: "frozen", ySplit: 1 }],
    properties: { defaultRowHeight: 22 },
  });

  const matrix = buildEmpleadoImportTemplateMatrix();
  worksheet.addRows(matrix);

  const columnWidths = [18, 18, 32, 28, 14, 18, 18, 16, 22, 14, 18];
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
  applySalarioNumberFormat(worksheet, matrix.length);

  const listRanges = writeNominaCatalogListSources(worksheet, options);

  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: EMPLEADO_IMPORT_TEMPLATE_HEADERS.length },
  };

  applyNominaCatalogValidations(worksheet, listRanges, matrix.length);
  applyFechaIngresoPlaceholderStyle(worksheet, 2, matrix.length);

  return worksheet;
}

function buildInstructionsWorksheet(
  workbook: ExcelJS.Workbook,
  options?: EmpleadoImportTemplateOptions,
) {
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
    "Complete la hoja «Nomina» desde la fila 2, en el mismo orden que «Nuevo empleado». Use los desplegables y reemplace AAAA-MM-DD en fecha de ingreso.";
  sheet.getCell("A2").font = {
    name: "Calibri",
    size: 11,
    italic: true,
    color: { argb: "FF475569" },
  };
  sheet.getRow(2).height = 24;

  const steps = [
    "1. Registre un empleado por fila en la hoja «Nomina» (mismo orden que «Nuevo empleado»).",
    "2. Use los desplegables en tipo de documento, contrato, banco y tipo de cuenta.",
    "3. Reemplace AAAA-MM-DD en fecha de ingreso por la fecha real (ej. 2025-03-01).",
    "4. Guarde el archivo y utilice «Importar nómina» en el panel de empresa.",
    "5. Revise el resumen de importación: las filas válidas se guardan aunque otras fallen.",
  ];

  steps.forEach((step, index) => {
    const row = sheet.getRow(4 + index);
    row.getCell(1).value = step;
    row.getCell(1).font = { name: "Calibri", size: 11, color: { argb: "FF334155" } };
    row.height = 20;
  });

  const guideHeaderRow = sheet.getRow(10);
  ["Columna", "Obligatorio", "Ejemplo", "Notas"].forEach((label, index) => {
    const cell = guideHeaderRow.getCell(index + 1);
    cell.value = label;
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: HEADER_FG } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: BRAND_PRIMARY },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });
  guideHeaderRow.height = 26;

  COLUMN_GUIDE.forEach((column, index) => {
    const row = sheet.getRow(11 + index);
    row.getCell(1).value = column.label;
    row.getCell(2).value = column.required;
    row.getCell(3).value = column.example;
    row.getCell(4).value = column.notes;

    for (let col = 1; col <= 4; col += 1) {
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

  sheet.getColumn(1).width = 24;
  sheet.getColumn(2).width = 12;
  sheet.getColumn(3).width = 22;
  sheet.getColumn(4).width = 48;

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
    "• Número de documento, Número de cuenta y Celular: use formato texto. No pegue números desde calculadora sin formato.",
    "• Si Excel muestra 1014261059.0 o 3112938473.0, el sistema rechazará la fila. Escriba solo dígitos (ej. 1014261059).",
    "• Salario mensual: digite el valor y Excel mostrará miles/millones (ej. 2500000 → 2.500.000).",
    "• Tipo de documento en minúsculas: cc, ce, ti, pas.",
    "• Fecha de ingreso en formato AAAA-MM-DD (ej. 2025-03-01).",
    "• Entidad financiera: copie el nombre exacto de la lista inferior. «BBVA» no es válido; use «BBVA Colombia».",
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
  banksTitle.value =
    "Bancos y plataformas aceptados (nombre exacto en columna Entidad financiera)";
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

  resolveEmpleadoImportBancoNames(options).forEach((bankName, index) => {
    const row = sheet.getRow(banksStartRow + 1 + index);
    row.getCell(1).value = bankName;
    row.getCell(1).font = { name: "Calibri", size: 10, color: { argb: "FF334155" } };
    row.height = 18;
  });
}

export async function buildEmpleadoImportTemplateBuffer(
  options?: EmpleadoImportTemplateOptions,
): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AdeCerebiia";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.company = "Cerebiia";

  buildNominaWorksheet(workbook, options);
  buildListasWorksheet(workbook, options);
  buildInstructionsWorksheet(workbook, options);

  workbook.views = [
    {
      activeTab: 0,
      firstSheet: 0,
      visibility: "visible",
    },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

/** @deprecated Usar buildEmpleadoImportTemplateBuffer para descarga con diseño corporativo. */
export async function buildEmpleadoImportTemplateWorkbook(
  options?: EmpleadoImportTemplateOptions,
): Promise<ArrayBuffer> {
  return buildEmpleadoImportTemplateBuffer(options);
}
