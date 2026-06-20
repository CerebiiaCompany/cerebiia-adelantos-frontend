// Utilidad de exportación Excel (requiere DOM del navegador)

import * as XLSX from "xlsx";

export function downloadExcelFile(
  filename: string,
  rows: (string | number)[][],
  sheetName = "Hoja1",
  workbook?: XLSX.WorkBook,
): void {
  if (typeof document === "undefined") return;

  const sheetWorkbook = workbook ?? (() => {
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const nextWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(nextWorkbook, worksheet, sheetName);
    return nextWorkbook;
  })();

  const buffer = XLSX.write(sheetWorkbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}
