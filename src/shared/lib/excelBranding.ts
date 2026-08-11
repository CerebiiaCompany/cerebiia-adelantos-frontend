// ⚠️ AGNOSTIC — preferencias de diseño Excel (colores + logo). No altera la lógica de datos.

export type ExcelBrandTarget = "nomina" | "liquidacion" | "todos";

/** Paleta ARGB (ExcelJS), p.ej. "FF1E3A8A". */
export interface ExcelColorPalette {
  id: string;
  label: string;
  description: string;
  primaryDark: string;
  accent: string;
  headerBg: string;
  headerFg: string;
  altRowBg: string;
  border: string;
  footerBg: string;
  text: string;
}

export type ExcelBrandColors = Pick<
  ExcelColorPalette,
  | "primaryDark"
  | "accent"
  | "headerBg"
  | "headerFg"
  | "altRowBg"
  | "border"
  | "footerBg"
  | "text"
>;

export interface ExcelBrandingPreferences {
  /** Id de preset rápido, o "custom" si eligió color libre. */
  presetId: string;
  /** Colores activos (ARGB). Fuente de verdad al generar Excel. */
  colors: ExcelBrandColors;
  /** data URL (image/png|jpeg) o null */
  logoDataUrl: string | null;
  logoFileName: string | null;
  applyTo: ExcelBrandTarget;
}

/** @deprecated Persistencia migrada a BD; se mantiene por compatibilidad de tests/legacy. */
export const EXCEL_BRANDING_STORAGE_KEY = "adecerebiia.excelBranding.v2";
/** @deprecated Persistencia migrada a BD; se mantiene por compatibilidad de tests/legacy. */
export const EXCEL_BRANDING_STORAGE_PREFIX_V3 = "adecerebiia.excelBranding.v3:";

/** Paleta por defecto (AdeCerebiia / plantilla nómina actual). */
export const DEFAULT_EXCEL_COLOR_PALETTE: ExcelColorPalette = {
  id: "cerebiia",
  label: "Cerebiia (azul)",
  description: "Estilo corporativo actual",
  primaryDark: "FF2E4A9E",
  accent: "FF7C3AED",
  headerBg: "FF1E3A8A",
  headerFg: "FFFFFFFF",
  altRowBg: "FFF8FAFC",
  border: "FFE2E8F0",
  footerBg: "FFEFF6FF",
  text: "FF1E293B",
};

export const EXCEL_COLOR_PRESETS: ExcelColorPalette[] = [
  DEFAULT_EXCEL_COLOR_PALETTE,
  {
    id: "ocean",
    label: "Océano",
    description: "Azul verdoso",
    primaryDark: "FF0F766E",
    accent: "FF14B8A6",
    headerBg: "FF0D9488",
    headerFg: "FFFFFFFF",
    altRowBg: "FFF0FDFA",
    border: "FFCCFBF1",
    footerBg: "FFCCFBF1",
    text: "FF134E4A",
  },
  {
    id: "forest",
    label: "Bosque",
    description: "Verde corporativo",
    primaryDark: "FF166534",
    accent: "FF22C55E",
    headerBg: "FF15803D",
    headerFg: "FFFFFFFF",
    altRowBg: "FFF0FDF4",
    border: "FFBBF7D0",
    footerBg: "FFDCFCE7",
    text: "FF14532D",
  },
  {
    id: "slate",
    label: "Pizarra",
    description: "Gris profesional",
    primaryDark: "FF334155",
    accent: "FF64748B",
    headerBg: "FF1E293B",
    headerFg: "FFFFFFFF",
    altRowBg: "FFF8FAFC",
    border: "FFE2E8F0",
    footerBg: "FFF1F5F9",
    text: "FF0F172A",
  },
  {
    id: "wine",
    label: "Vino",
    description: "Rojo profundo",
    primaryDark: "FF9F1239",
    accent: "FFE11D48",
    headerBg: "FFBE123C",
    headerFg: "FFFFFFFF",
    altRowBg: "FFFFF1F2",
    border: "FFFECDD3",
    footerBg: "FFFFE4E6",
    text: "FF881337",
  },
  {
    id: "amber",
    label: "Ámbar",
    description: "Dorado / café",
    primaryDark: "FF92400E",
    accent: "FFF59E0B",
    headerBg: "FFB45309",
    headerFg: "FFFFFFFF",
    altRowBg: "FFFFFBEB",
    border: "FFFDE68A",
    footerBg: "FFFEF3C7",
    text: "FF78350F",
  },
  {
    id: "indigo",
    label: "Índigo",
    description: "Morado suave",
    primaryDark: "FF3730A3",
    accent: "FF818CF8",
    headerBg: "FF4338CA",
    headerFg: "FFFFFFFF",
    altRowBg: "FFEEF2FF",
    border: "FFC7D2FE",
    footerBg: "FFE0E7FF",
    text: "FF312E81",
  },
  {
    id: "graphite",
    label: "Grafito",
    description: "Negro elegante",
    primaryDark: "FF171717",
    accent: "FF737373",
    headerBg: "FF262626",
    headerFg: "FFFFFFFF",
    altRowBg: "FFFAFAFA",
    border: "FFE5E5E5",
    footerBg: "FFF5F5F5",
    text: "FF171717",
  },
];

export function paletteToColors(palette: ExcelColorPalette): ExcelBrandColors {
  return {
    primaryDark: palette.primaryDark,
    accent: palette.accent,
    headerBg: palette.headerBg,
    headerFg: palette.headerFg,
    altRowBg: palette.altRowBg,
    border: palette.border,
    footerBg: palette.footerBg,
    text: palette.text,
  };
}

export const DEFAULT_EXCEL_BRANDING: ExcelBrandingPreferences = {
  presetId: DEFAULT_EXCEL_COLOR_PALETTE.id,
  colors: paletteToColors(DEFAULT_EXCEL_COLOR_PALETTE),
  logoDataUrl: null,
  logoFileName: null,
  applyTo: "todos",
};

/** Caché en memoria hidratada desde la API (persistencia real = BD). */
const runtimeExcelBrandingByOwner = new Map<string, ExcelBrandingPreferences>();

function isBrowserStorageAvailable(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

/**
 * Dueño de la personalización: id del usuario empresa autenticado.
 * Cada empresa tiene su propia cuenta → branding aislado en caché de sesión.
 */
export function resolveExcelBrandingOwnerKey(
  explicitOwnerKey?: string | null,
): string | null {
  const trimmed = explicitOwnerKey?.trim();
  if (trimmed) return trimmed;

  if (!isBrowserStorageAvailable()) return null;

  try {
    // Lectura directa de la sesión (evita acoplar a React).
    const raw = localStorage.getItem("cerebiia_auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      actorType?: string;
      user?: { id?: string; role?: string };
    };
    if (parsed.actorType !== "system_user") return null;
    if (parsed.user?.role !== "empresa") return null;
    return typeof parsed.user.id === "string" && parsed.user.id.trim()
      ? parsed.user.id.trim()
      : null;
  } catch {
    return null;
  }
}

/** @deprecated Preferencias viven en BD; solo útil para limpiar restos legacy. */
export function getExcelBrandingStorageKey(ownerKey: string): string {
  return `${EXCEL_BRANDING_STORAGE_PREFIX_V3}${ownerKey}`;
}

function discardLegacyLocalPreferences(ownerKey?: string | null): void {
  if (!isBrowserStorageAvailable()) return;
  try {
    localStorage.removeItem(EXCEL_BRANDING_STORAGE_KEY);
    localStorage.removeItem("adecerebiia.excelBranding.v1");
    localStorage.removeItem("adecerebiia.excelBranding.v2.claimedBy");
    if (ownerKey) {
      localStorage.removeItem(getExcelBrandingStorageKey(ownerKey));
    }
  } catch {
    // ignore
  }
}

export function normalizeExcelBrandingPreferences(
  raw: Partial<ExcelBrandingPreferences> | null | undefined,
): ExcelBrandingPreferences {
  const presetId =
    typeof raw?.presetId === "string" ? raw.presetId : "cerebiia";
  const rawApplyTo = raw?.applyTo === "ambos" ? "todos" : raw?.applyTo;
  const applyTo: ExcelBrandTarget =
    rawApplyTo === "nomina" ||
    rawApplyTo === "liquidacion" ||
    rawApplyTo === "todos"
      ? rawApplyTo
      : "todos";

  const colors = normalizeColors(
    raw?.colors,
    EXCEL_COLOR_PRESETS.some((p) => p.id === presetId) ? presetId : "cerebiia",
  );

  return {
    presetId: EXCEL_COLOR_PRESETS.some((p) => p.id === presetId)
      ? presetId
      : "custom",
    colors,
    logoDataUrl:
      typeof raw?.logoDataUrl === "string" ? raw.logoDataUrl : null,
    logoFileName:
      typeof raw?.logoFileName === "string" ? raw.logoFileName : null,
    applyTo,
  };
}

/**
 * Convierte una URL de logo (p. ej. S3) a data URL para ExcelJS / vista previa.
 */
export async function fetchLogoAsDataUrl(
  logoUrl: string | null | undefined,
): Promise<string | null> {
  if (!logoUrl || !logoUrl.trim()) return null;
  if (logoUrl.startsWith("data:image/")) return logoUrl;

  try {
    const res = await fetch(logoUrl);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function getExcelColorPresetById(presetId: string): ExcelColorPalette {
  return (
    EXCEL_COLOR_PRESETS.find((p) => p.id === presetId) ??
    DEFAULT_EXCEL_COLOR_PALETTE
  );
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseHexRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace(/^#/, "").toUpperCase();
  const six =
    clean.length === 8
      ? clean.slice(2)
      : clean.length === 6
        ? clean
        : clean.length === 3
          ? clean
              .split("")
              .map((c) => c + c)
              .join("")
          : "";
  if (!/^[0-9A-F]{6}$/.test(six)) return null;
  return {
    r: Number.parseInt(six.slice(0, 2), 16),
    g: Number.parseInt(six.slice(2, 4), 16),
    b: Number.parseInt(six.slice(4, 6), 16),
  };
}

function rgbToArgb(r: number, g: number, b: number): string {
  return `FF${clampByte(r).toString(16).padStart(2, "0")}${clampByte(g)
    .toString(16)
    .padStart(2, "0")}${clampByte(b).toString(16).padStart(2, "0")}`.toUpperCase();
}

function mixRgb(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
): { r: number; g: number; b: number } {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const lin = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

/** Convierte CSS hex (#1E3A8A) a ARGB Excel. */
export function cssHexToArgb(hex: string): string {
  const rgb = parseHexRgb(hex);
  if (!rgb) return DEFAULT_EXCEL_COLOR_PALETTE.headerBg;
  return rgbToArgb(rgb.r, rgb.g, rgb.b);
}

/** Convierte ARGB Excel ("FF1E3A8A") a CSS "#1E3A8A". */
export function argbToCssHex(argb: string): string {
  const clean = argb.replace(/^#/, "").toUpperCase();
  if (clean.length === 8) return `#${clean.slice(2)}`;
  if (clean.length === 6) return `#${clean}`;
  return "#1E3A8A";
}

/**
 * Construye una paleta completa a partir del color de encabezado elegido
 * en la paleta nativa del sistema.
 */
export function buildPaletteFromHeaderColor(
  headerCssHex: string,
  accentCssHex?: string,
): ExcelColorPalette {
  const headerRgb = parseHexRgb(headerCssHex) ?? { r: 30, g: 58, b: 138 };
  const accentRgb =
    (accentCssHex ? parseHexRgb(accentCssHex) : null) ??
    mixRgb(headerRgb, { r: 255, g: 255, b: 255 }, 0.25);

  const dark = mixRgb(headerRgb, { r: 0, g: 0, b: 0 }, 0.28);
  const lightBg = mixRgb(headerRgb, { r: 255, g: 255, b: 255 }, 0.9);
  const footer = mixRgb(headerRgb, { r: 255, g: 255, b: 255 }, 0.82);
  const border = mixRgb(headerRgb, { r: 255, g: 255, b: 255 }, 0.72);
  const text = mixRgb(headerRgb, { r: 0, g: 0, b: 0 }, 0.55);
  const headerFg =
    relativeLuminance(headerRgb) > 0.55
      ? rgbToArgb(30, 41, 59)
      : rgbToArgb(255, 255, 255);

  return {
    id: "custom",
    label: "Personalizado",
    description: "Color libre desde la paleta",
    primaryDark: rgbToArgb(dark.r, dark.g, dark.b),
    accent: rgbToArgb(accentRgb.r, accentRgb.g, accentRgb.b),
    headerBg: rgbToArgb(headerRgb.r, headerRgb.g, headerRgb.b),
    headerFg,
    altRowBg: rgbToArgb(lightBg.r, lightBg.g, lightBg.b),
    border: rgbToArgb(border.r, border.g, border.b),
    footerBg: rgbToArgb(footer.r, footer.g, footer.b),
    text: rgbToArgb(text.r, text.g, text.b),
  };
}

export function colorsToPalette(
  colors: ExcelBrandColors,
  meta?: { id?: string; label?: string; description?: string },
): ExcelColorPalette {
  return {
    id: meta?.id ?? "custom",
    label: meta?.label ?? "Personalizado",
    description: meta?.description ?? "Color libre desde la paleta",
    ...colors,
  };
}

function isValidArgb(value: unknown): value is string {
  return typeof value === "string" && /^FF[0-9A-Fa-f]{6}$/.test(value);
}

function normalizeColors(
  raw: Partial<ExcelBrandColors> | undefined,
  fallbackPresetId: string,
): ExcelBrandColors {
  const fallback = paletteToColors(getExcelColorPresetById(fallbackPresetId));
  if (!raw) return fallback;
  return {
    primaryDark: isValidArgb(raw.primaryDark)
      ? raw.primaryDark.toUpperCase()
      : fallback.primaryDark,
    accent: isValidArgb(raw.accent) ? raw.accent.toUpperCase() : fallback.accent,
    headerBg: isValidArgb(raw.headerBg)
      ? raw.headerBg.toUpperCase()
      : fallback.headerBg,
    headerFg: isValidArgb(raw.headerFg)
      ? raw.headerFg.toUpperCase()
      : fallback.headerFg,
    altRowBg: isValidArgb(raw.altRowBg)
      ? raw.altRowBg.toUpperCase()
      : fallback.altRowBg,
    border: isValidArgb(raw.border) ? raw.border.toUpperCase() : fallback.border,
    footerBg: isValidArgb(raw.footerBg)
      ? raw.footerBg.toUpperCase()
      : fallback.footerBg,
    text: isValidArgb(raw.text) ? raw.text.toUpperCase() : fallback.text,
  };
}

/**
 * Lee la personalización activa en esta sesión (caché hidratada desde BD).
 * Sin hidratar aún → defaults Cerebiia.
 */
export function loadExcelBrandingPreferences(
  ownerKey?: string | null,
): ExcelBrandingPreferences {
  const resolvedOwner = resolveExcelBrandingOwnerKey(ownerKey);
  if (!resolvedOwner) {
    return { ...DEFAULT_EXCEL_BRANDING };
  }

  const cached = runtimeExcelBrandingByOwner.get(resolvedOwner);
  if (cached) {
    return { ...cached, colors: { ...cached.colors } };
  }

  discardLegacyLocalPreferences(resolvedOwner);
  return { ...DEFAULT_EXCEL_BRANDING };
}

/**
 * Actualiza la caché de sesión. La persistencia real es vía API → BD.
 */
export function saveExcelBrandingPreferences(
  prefs: ExcelBrandingPreferences,
  ownerKey?: string | null,
): void {
  const resolvedOwner = resolveExcelBrandingOwnerKey(ownerKey);
  if (!resolvedOwner) return;

  const normalized = normalizeExcelBrandingPreferences(prefs);
  runtimeExcelBrandingByOwner.set(resolvedOwner, normalized);
  discardLegacyLocalPreferences(resolvedOwner);
}

export function clearExcelBrandingPreferences(
  ownerKey?: string | null,
): void {
  const resolvedOwner = resolveExcelBrandingOwnerKey(ownerKey);
  if (resolvedOwner) {
    runtimeExcelBrandingByOwner.delete(resolvedOwner);
    discardLegacyLocalPreferences(resolvedOwner);
  } else {
    runtimeExcelBrandingByOwner.clear();
    discardLegacyLocalPreferences(null);
  }
}

export type ExcelBrandDocument = "nomina" | "liquidacion" | "reporte";

export interface ResolvedExcelBrand {
  palette: ExcelColorPalette;
  logoDataUrl: string | null;
  /** True si el documento usa la personalización guardada. */
  customized: boolean;
}

/**
 * Resuelve colores/logo para un documento concreto.
 * - nomina: plantilla de importación
 * - liquidacion: cuenta de cobro al suspender
 * - reporte: Excels de auditoría (movimientos, retenciones, etc.)
 * Si applyTo es "todos", aplica a cualquier Excel exportable del módulo.
 */
export function resolveExcelBrandForDocument(
  document: ExcelBrandDocument,
  prefs: ExcelBrandingPreferences = loadExcelBrandingPreferences(),
): ResolvedExcelBrand {
  const applies =
    prefs.applyTo === "todos" || prefs.applyTo === document;

  if (!applies) {
    return {
      palette: DEFAULT_EXCEL_COLOR_PALETTE,
      logoDataUrl: null,
      customized: false,
    };
  }

  return {
    palette: colorsToPalette(prefs.colors, {
      id: prefs.presetId,
      label:
        prefs.presetId === "custom"
          ? "Personalizado"
          : getExcelColorPresetById(prefs.presetId).label,
    }),
    logoDataUrl: prefs.logoDataUrl,
    customized: true,
  };
}

export function detectImageExtensionFromDataUrl(
  dataUrl: string,
): "png" | "jpeg" | null {
  if (dataUrl.startsWith("data:image/png")) return "png";
  if (
    dataUrl.startsWith("data:image/jpeg") ||
    dataUrl.startsWith("data:image/jpg")
  ) {
    return "jpeg";
  }
  return null;
}

export function stripDataUrlPrefix(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

/** Límite de logo alineado con el backend (~400 KB). */
export const EXCEL_LOGO_MAX_BYTES = 400 * 1024;
