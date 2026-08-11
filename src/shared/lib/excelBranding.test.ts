import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_EXCEL_BRANDING,
  DEFAULT_EXCEL_COLOR_PALETTE,
  EXCEL_BRANDING_STORAGE_KEY,
  argbToCssHex,
  buildPaletteFromHeaderColor,
  clearExcelBrandingPreferences,
  cssHexToArgb,
  loadExcelBrandingPreferences,
  resolveExcelBrandForDocument,
  saveExcelBrandingPreferences,
} from "./excelBranding";

describe("excelBranding", () => {
  beforeEach(() => {
    clearExcelBrandingPreferences();
  });

  afterEach(() => {
    clearExcelBrandingPreferences();
  });

  it("carga defaults si no hay preferencias", () => {
    expect(loadExcelBrandingPreferences()).toEqual(DEFAULT_EXCEL_BRANDING);
  });

  it("persiste y aplica solo al documento elegido", () => {
    saveExcelBrandingPreferences({
      presetId: "forest",
      colors: {
        primaryDark: "FF166534",
        accent: "FF22C55E",
        headerBg: "FF15803D",
        headerFg: "FFFFFFFF",
        altRowBg: "FFF0FDF4",
        border: "FFBBF7D0",
        footerBg: "FFDCFCE7",
        text: "FF14532D",
      },
      logoDataUrl: "data:image/png;base64,abc",
      logoFileName: "logo.png",
      applyTo: "nomina",
    });

    const nomina = resolveExcelBrandForDocument("nomina");
    expect(nomina.palette.headerBg).toBe("FF15803D");
    expect(nomina.logoDataUrl).toBe("data:image/png;base64,abc");
    expect(nomina.customized).toBe(true);

    const liquidacion = resolveExcelBrandForDocument("liquidacion");
    expect(liquidacion.palette.id).toBe(DEFAULT_EXCEL_COLOR_PALETTE.id);
    expect(liquidacion.logoDataUrl).toBeNull();
    expect(liquidacion.customized).toBe(false);

    const reporte = resolveExcelBrandForDocument("reporte");
    expect(reporte.customized).toBe(false);
  });

  it("con applyTo todos aplica a todos los Excels exportables", () => {
    saveExcelBrandingPreferences({
      ...DEFAULT_EXCEL_BRANDING,
      applyTo: "todos",
      logoDataUrl: "data:image/png;base64,xyz",
    });

    expect(resolveExcelBrandForDocument("nomina").customized).toBe(true);
    expect(resolveExcelBrandForDocument("liquidacion").customized).toBe(true);
    expect(resolveExcelBrandForDocument("reporte").customized).toBe(true);
    expect(resolveExcelBrandForDocument("reporte").logoDataUrl).toBe(
      "data:image/png;base64,xyz",
    );
  });

  it("migra applyTo ambos legacy a todos", () => {
    localStorage.setItem(
      EXCEL_BRANDING_STORAGE_KEY,
      JSON.stringify({
        ...DEFAULT_EXCEL_BRANDING,
        applyTo: "ambos",
      }),
    );
    expect(loadExcelBrandingPreferences().applyTo).toBe("todos");
  });

  it("convierte ARGB a CSS hex y viceversa", () => {
    expect(argbToCssHex("FF1E3A8A")).toBe("#1E3A8A");
    expect(cssHexToArgb("#1E3A8A")).toBe("FF1E3A8A");
  });

  it("genera paleta completa desde un color libre", () => {
    const palette = buildPaletteFromHeaderColor("#BE123C", "#E11D48");
    expect(palette.id).toBe("custom");
    expect(palette.headerBg).toBe("FFBE123C");
    expect(palette.accent).toBe("FFE11D48");
    expect(palette.headerFg).toBe("FFFFFFFF");
  });

  it("ignora JSON inválido en storage", () => {
    localStorage.setItem(EXCEL_BRANDING_STORAGE_KEY, "{not-json");
    expect(loadExcelBrandingPreferences().presetId).toBe(
      DEFAULT_EXCEL_BRANDING.presetId,
    );
  });
});
