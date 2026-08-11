import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import {
  EXCEL_LOGO_COLUMN_WIDTH,
  applyModernExcelBrandBanner,
  getExcelLogoCellSizePx,
  stretchExcelImagesToAnchor,
} from "./excelBrandBanner";
import { DEFAULT_EXCEL_COLOR_PALETTE } from "./excelBranding";

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6aAAAAAElFTkSuQmCC";

describe("excelBrandBanner", () => {
  it("ubica logo en A1 con tamaño de celda y título centrado en B…última", async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Nomina");
    worksheet.addRow(["a", "b", "c", "d"]);
    for (let i = 1; i <= 4; i += 1) worksheet.getColumn(i).width = 14;

    await applyModernExcelBrandBanner({
      workbook,
      worksheet,
      columnCount: 4,
      palette: DEFAULT_EXCEL_COLOR_PALETTE,
      logoDataUrl: TINY_PNG,
      title: "Plantilla de Importación de Nómina",
    });

    expect(worksheet.getColumn(1).width).toBe(EXCEL_LOGO_COLUMN_WIDTH);
    expect(worksheet.getCell(1, 1).value).toBeNull();
    expect(worksheet.getCell(1, 2).value).toBe(
      "Plantilla de Importación de Nómina",
    );
    expect(worksheet.getCell(1, 2).alignment?.horizontal).toBe("center");

    const images = worksheet.getImages();
    expect(images).toHaveLength(1);
    const cellPx = getExcelLogoCellSizePx();
    expect(images[0].range.ext).toEqual({
      width: cellPx.width,
      height: cellPx.height,
    });
    expect(images[0].range.tl.nativeCol).toBe(0);
    expect(images[0].range.tl.nativeRow).toBe(0);
  });

  it("centra el título a todo el ancho si no hay logo", async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Nomina");
    worksheet.addRow(["a", "b", "c"]);

    await applyModernExcelBrandBanner({
      workbook,
      worksheet,
      columnCount: 3,
      palette: DEFAULT_EXCEL_COLOR_PALETTE,
      logoDataUrl: null,
      title: "Plantilla Deudas Pendientes",
    });

    expect(worksheet.getCell(1, 1).value).toBe("Plantilla Deudas Pendientes");
    expect(worksheet.getCell(1, 1).alignment?.horizontal).toBe("center");
  });

  it("desbloquea aspect ratio para que el logo llene la celda", async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Nomina");
    worksheet.addRow(["a", "b", "c"]);
    await applyModernExcelBrandBanner({
      workbook,
      worksheet,
      columnCount: 3,
      palette: DEFAULT_EXCEL_COLOR_PALETTE,
      logoDataUrl: TINY_PNG,
      title: "Título",
    });

    const raw = (await workbook.xlsx.writeBuffer()) as ArrayBuffer;
    const fixed = await stretchExcelImagesToAnchor(raw);
    const zip = await (await import("jszip")).default.loadAsync(fixed);
    const drawing = await zip.file("xl/drawings/drawing1.xml")!.async("string");
    expect(drawing).toContain('noChangeAspect="0"');
    expect(drawing).toContain("xdr:ext");
  });
});
