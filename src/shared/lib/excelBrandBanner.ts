// ⚠️ AGNOSTIC — banner Excel (layout fijo como plantilla de referencia; solo varían colores)
// Nota: el ajuste del logo a píxeles de celda usa Canvas solo si hay DOM (navegador).

import type ExcelJS from "exceljs";
import {
  detectImageExtensionFromDataUrl,
  stripDataUrlPrefix,
  type ExcelColorPalette,
} from "./excelBranding";

export const EXCEL_DOCUMENT_TITLES = {
  nomina: "Plantilla de Importación de Nómina",
  liquidacion: "Plantilla Deudas Pendientes",
  movimientos: "Historial de Movimientos",
  retenciones: "Retenciones de Nómina",
} as const;

export type ExcelBannerDocument = keyof typeof EXCEL_DOCUMENT_TITLES;

/**
 * Medidas fijas según la plantilla de referencia (logo izq. + título centrado).
 * No dependen del archivo de logo subido: solo cambian los colores de marca.
 */
export const EXCEL_BANNER_ROW_HEIGHT = 60;
/** Ancho columna A (celda del logo). */
export const EXCEL_LOGO_COLUMN_WIDTH = 16;

export function getExcelDocumentTitle(document: ExcelBannerDocument): string {
  return EXCEL_DOCUMENT_TITLES[document];
}

/**
 * Tamaño en píxeles (96 DPI) de la celda A1 del banner — logo 1:1 con la celda.
 * Excel: ~7px por unidad de ancho de columna; altura en puntos → px = pt * 96/72.
 */
export function getExcelLogoCellSizePx(): { width: number; height: number } {
  return {
    width: Math.round(EXCEL_LOGO_COLUMN_WIDTH * 7),
    height: Math.round(EXCEL_BANNER_ROW_HEIGHT * (96 / 72)),
  };
}

function loadHtmlImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const timer = window.setTimeout(() => {
      reject(new Error("Timeout cargando logo"));
    }, 2000);
    image.onload = () => {
      window.clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      reject(new Error("No se pudo cargar el logo"));
    };
    image.src = dataUrl;
  });
}

/**
 * Redimensiona el logo exactamente al tamaño de A1 (object-fit: fill).
 * Así, aunque Excel conserve proporción, el bitmap ya coincide con la celda
 * y se ve centrado ocupando todo el espacio. En Node/tests (sin DOM útil) no altera.
 */
export async function fitLogoDataUrlToCellSize(
  logoDataUrl: string,
): Promise<{ dataUrl: string; extension: "png" | "jpeg" }> {
  const originalExt = detectImageExtensionFromDataUrl(logoDataUrl) ?? "png";
  const { width, height } = getExcelLogoCellSizePx();

  const canDraw =
    typeof document !== "undefined" &&
    typeof Image !== "undefined" &&
    typeof document.createElement === "function" &&
    !(typeof process !== "undefined" && process.env?.VITEST);

  if (!canDraw) {
    return { dataUrl: logoDataUrl, extension: originalExt };
  }

  try {
    const image = await loadHtmlImage(logoDataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { dataUrl: logoDataUrl, extension: originalExt };

    ctx.clearRect(0, 0, width, height);
    // Llena toda la celda (misma escala que A1), centrado por definición.
    ctx.drawImage(image, 0, 0, width, height);

    return {
      dataUrl: canvas.toDataURL("image/png"),
      extension: "png",
    };
  } catch {
    return { dataUrl: logoDataUrl, extension: originalExt };
  }
}

/**
 * Inserta la fila de marca:
 * | LOGO (A1, tamaño = celda) | Título centrado (B1…última) |
 * Devuelve 1.
 */
export async function applyModernExcelBrandBanner(options: {
  workbook: ExcelJS.Workbook;
  worksheet: ExcelJS.Worksheet;
  columnCount: number;
  palette: ExcelColorPalette;
  logoDataUrl: string | null;
  title: string;
}): Promise<number> {
  const { workbook, worksheet, columnCount, palette, logoDataUrl, title } =
    options;

  const safeColumnCount = Math.max(columnCount, 2);

  worksheet.insertRow(1, Array.from({ length: safeColumnCount }, () => null));
  const bannerRow = worksheet.getRow(1);
  bannerRow.height = EXCEL_BANNER_ROW_HEIGHT;

  const hasLogo =
    !!logoDataUrl && !!detectImageExtensionFromDataUrl(logoDataUrl);

  worksheet.getColumn(1).width = EXCEL_LOGO_COLUMN_WIDTH;

  for (let column = 1; column <= safeColumnCount; column += 1) {
    const cell = bannerRow.getCell(column);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: palette.footerBg },
    };
    cell.border = {
      top: { style: "thin", color: { argb: palette.border } },
      bottom: { style: "medium", color: { argb: palette.accent } },
      left: { style: "thin", color: { argb: palette.border } },
      right: { style: "thin", color: { argb: palette.border } },
    };
  }

  if (hasLogo && logoDataUrl) {
    for (let column = 2; column <= safeColumnCount; column += 1) {
      styleTitleCell(
        bannerRow.getCell(column),
        palette,
        column === 2 ? title : null,
      );
    }
    worksheet.mergeCells(1, 2, 1, safeColumnCount);
    styleTitleCell(bannerRow.getCell(2), palette, title);

    try {
      const fitted = await fitLogoDataUrlToCellSize(logoDataUrl);
      const imageId = workbook.addImage({
        base64: stripDataUrlPrefix(fitted.dataUrl),
        extension: fitted.extension,
      });

      const cellPx = getExcelLogoCellSizePx();
      // oneCell + ext en px = tamaño visual idéntico a A1 (centrado en la celda).
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: cellPx.width, height: cellPx.height },
        editAs: "oneCell",
      });
    } catch {
      // Título ya aplicado; sin logo si la imagen falla.
    }
  } else {
    for (let column = 1; column <= safeColumnCount; column += 1) {
      styleTitleCell(
        bannerRow.getCell(column),
        palette,
        column === 1 ? title : null,
      );
    }
    worksheet.mergeCells(1, 1, 1, safeColumnCount);
    styleTitleCell(bannerRow.getCell(1), palette, title);
  }

  return 1;
}

function styleTitleCell(
  titleCell: ExcelJS.Cell,
  palette: ExcelColorPalette,
  title: string | null,
): void {
  if (title !== null) {
    titleCell.value = title;
  }
  titleCell.font = {
    name: "Calibri",
    size: 16,
    bold: true,
    color: { argb: palette.primaryDark },
  };
  titleCell.alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: false,
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: palette.footerBg },
  };
}

/**
 * ExcelJS fija noChangeAspect=1. Se desbloquea para que el marco del logo
 * coincida con el tamaño de A1 sin letterbox.
 */
export async function stretchExcelImagesToAnchor(
  buffer: ArrayBuffer,
): Promise<ArrayBuffer> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const drawingFiles = Object.keys(zip.files).filter((name) =>
    /^xl\/drawings\/drawing\d+\.xml$/i.test(name),
  );

  await Promise.all(
    drawingFiles.map(async (name) => {
      const file = zip.file(name);
      if (!file) return;
      const xml = await file.async("string");
      const next = xml
        .replace(/noChangeAspect="1"/g, 'noChangeAspect="0"')
        .replace(/<a:picLocks[^/]*\/>/g, '<a:picLocks noChangeAspect="0"/>');
      if (next !== xml) zip.file(name, next);
    }),
  );

  return zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
  });
}
