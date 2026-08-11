import { describe, expect, it } from "vitest";
import { buildBrandedExcelWorkbook, EXCEL_BRAND } from "./excelReport";

describe("excelReport", () => {
  it("genera banner moderno + encabezado con estilo corporativo", async () => {
    const workbook = await buildBrandedExcelWorkbook({
      filename: "reporte-test",
      sheetName: "Movimientos",
      headers: ["Empleado", "Monto"],
      rows: [
        ["Ana Pérez", 100_000],
        ["Luis Gómez", 250_000],
      ],
      currencyColumnIndexes: [1],
      footerRows: [["Total", 350_000]],
    });

    const sheet = workbook.getWorksheet("Movimientos");
    expect(sheet).toBeTruthy();

    const bannerTitle =
      sheet!.getCell(1, 1).value ?? sheet!.getCell(1, 2).value;
    expect(String(bannerTitle)).toMatch(/Historial de Movimientos/i);

    const headerCell = sheet!.getCell(2, 1);
    expect(headerCell.value).toBe("Empleado");
    expect(headerCell.font?.name).toBe(EXCEL_BRAND.fontName);
    expect(headerCell.font?.bold).toBe(true);
    expect(headerCell.font?.color?.argb).toBe(EXCEL_BRAND.headerFg);
    expect(
      headerCell.fill && "fgColor" in headerCell.fill
        ? headerCell.fill.fgColor?.argb
        : null,
    ).toBe(EXCEL_BRAND.headerBg);

    const amountCell = sheet!.getCell(3, 2);
    expect(amountCell.value).toBe(100_000);
    expect(amountCell.numFmt).toBe(EXCEL_BRAND.currencyFmt);

    // banner + header + 2 data + blank + 1 footer
    expect(sheet!.rowCount).toBe(6);
    const footerLabel = sheet!.getCell(6, 1);
    expect(footerLabel.value).toBe("Total");
    expect(footerLabel.font?.bold).toBe(true);
  });
});
