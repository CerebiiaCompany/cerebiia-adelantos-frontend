import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_EXCEL_BRANDING,
  DEFAULT_EXCEL_COLOR_PALETTE,
  clearExcelBrandingPreferences,
  loadExcelBrandingPreferences,
  resolveExcelBrandForDocument,
  saveExcelBrandingPreferences,
} from "./excelBranding";

const OWNER_A = "empresa-user-a";
const OWNER_B = "empresa-user-b";

describe("excelBranding", () => {
  beforeEach(() => {
    clearExcelBrandingPreferences(OWNER_A);
    clearExcelBrandingPreferences(OWNER_B);
    localStorage.clear();
  });

  afterEach(() => {
    clearExcelBrandingPreferences(OWNER_A);
    clearExcelBrandingPreferences(OWNER_B);
    localStorage.clear();
  });

  it("carga defaults si no hay preferencias de la empresa", () => {
    expect(loadExcelBrandingPreferences(OWNER_A)).toEqual(DEFAULT_EXCEL_BRANDING);
  });

  it("no usa localStorage como fuente de verdad", () => {
    localStorage.setItem(
      "adecerebiia.excelBranding.v2",
      JSON.stringify({
        ...DEFAULT_EXCEL_BRANDING,
        logoDataUrl: "data:image/jpeg;base64,happy",
        logoFileName: "happy.jpg",
        applyTo: "todos",
      }),
    );

    const prefs = loadExcelBrandingPreferences(OWNER_B);
    expect(prefs.logoDataUrl).toBeNull();
    expect(prefs.logoFileName).toBeNull();
  });

  it("aisla preferencias entre empresas distintas en caché de sesión", () => {
    saveExcelBrandingPreferences(
      {
        ...DEFAULT_EXCEL_BRANDING,
        logoDataUrl: "data:image/png;base64,abc",
        logoFileName: "logo-a.png",
        applyTo: "todos",
      },
      OWNER_A,
    );

    expect(loadExcelBrandingPreferences(OWNER_A).logoFileName).toBe("logo-a.png");
    expect(loadExcelBrandingPreferences(OWNER_B)).toEqual(DEFAULT_EXCEL_BRANDING);
  });

  it("aplica solo al documento elegido", () => {
    saveExcelBrandingPreferences(
      {
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
      },
      OWNER_A,
    );

    const prefs = loadExcelBrandingPreferences(OWNER_A);
    const nomina = resolveExcelBrandForDocument("nomina", prefs);
    const liquidacion = resolveExcelBrandForDocument("liquidacion", prefs);

    expect(nomina.customized).toBe(true);
    expect(nomina.palette.headerBg).toBe("FF15803D");
    expect(nomina.logoDataUrl).toBe("data:image/png;base64,abc");
    expect(liquidacion.customized).toBe(false);
    expect(liquidacion.palette).toEqual(DEFAULT_EXCEL_COLOR_PALETTE);
    expect(liquidacion.logoDataUrl).toBeNull();
  });

  it("con applyTo=todos aplica a reportes", () => {
    const prefs = {
      ...DEFAULT_EXCEL_BRANDING,
      logoDataUrl: "data:image/png;base64,xyz",
      logoFileName: "logo.png",
      applyTo: "todos" as const,
    };
    saveExcelBrandingPreferences(prefs, OWNER_A);
    const loaded = loadExcelBrandingPreferences(OWNER_A);
    expect(resolveExcelBrandForDocument("reporte", loaded).logoDataUrl).toBe(
      "data:image/png;base64,xyz",
    );
  });
});
