// ⚠️ AGNOSTIC — helpers Excel para plantilla de importación

import type ExcelJS from "exceljs";

export function toExcelColumnLetter(columnIndex: number): string {
  let column = columnIndex;
  let letter = "";

  while (column > 0) {
    const remainder = (column - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    column = Math.floor((column - 1) / 26);
  }

  return letter;
}

export function buildExcelListRange(
  sheetName: string | null | undefined,
  columnIndex: number,
  itemCount: number,
): string {
  if (itemCount <= 0) return `""`;

  const column = toExcelColumnLetter(columnIndex);
  const absoluteRange = `$${column}$1:$${column}$${itemCount}`;

  // Misma hoja: Excel Online no soporta listas que apunten a otra hoja.
  if (!sheetName) return absoluteRange;

  const escapedSheet = sheetName.replace(/'/g, "''");
  return `'${escapedSheet}'!${absoluteRange}`;
}

export function applyExcelColumnInputHint(
  worksheet: ExcelJS.Worksheet,
  columnIndex: number,
  prompt: string,
  firstRow: number,
  lastRow: number,
): void {
  const column = toExcelColumnLetter(columnIndex);
  const range = `${column}${firstRow}:${column}${lastRow}`;

  worksheet.dataValidations.add(range, {
    type: "custom",
    allowBlank: true,
    formulae: ["TRUE"],
    showInputMessage: true,
    promptTitle: "Formato requerido",
    prompt,
  });
}

export function applyExcelListValidation(
  worksheet: ExcelJS.Worksheet,
  columnIndex: number,
  listRange: string,
  prompt: string,
  firstRow: number,
  lastRow: number,
): void {
  if (listRange === '""') return;

  const column = toExcelColumnLetter(columnIndex);
  const range = `${column}${firstRow}:${column}${lastRow}`;

  worksheet.dataValidations.add(range, {
    type: "list",
    allowBlank: true,
    formulae: [listRange],
    // OOXML: showDropDown=true OCULTA la flecha; false la muestra.
    showDropDown: false,
    showErrorMessage: true,
    errorStyle: "stop",
    errorTitle: "Valor no permitido",
    error: prompt,
    showInputMessage: true,
    promptTitle: "Seleccione de la lista",
    prompt,
  });
}
