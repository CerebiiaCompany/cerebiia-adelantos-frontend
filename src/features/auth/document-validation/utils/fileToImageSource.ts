import { MAX_ANALYSIS_DIMENSION } from "../constants";

type ProgressCallback = (message: string) => void;

let pdfjsModulePromise: Promise<typeof import("pdfjs-dist")> | null = null;
let pdfWorkerConfigured = false;

async function getPdfJs() {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = import("pdfjs-dist");
  }

  const pdfjsLib = await pdfjsModulePromise;

  if (!pdfWorkerConfigured) {
    const workerModule = await import(
      "pdfjs-dist/build/pdf.worker.min.mjs?url"
    );
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
    pdfWorkerConfigured = true;
  }

  return pdfjsLib;
}

export interface ImageSourceResult {
  source: HTMLCanvasElement | HTMLImageElement;
  isPdf: boolean;
}

export async function warmupPdfEngine(): Promise<void> {
  await getPdfJs();
}

export async function fileToImageSource(
  file: File,
  onProgress?: ProgressCallback,
): Promise<ImageSourceResult> {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  if (isPdf) {
    const canvas = await renderPdfFirstPage(file, onProgress);
    return { source: canvas, isPdf: true };
  }

  onProgress?.("Cargando imagen...");
  const image = await loadImageFromFile(file);
  return { source: image, isPdf: false };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen"));
    };

    image.src = url;
  });
}

async function renderPdfFirstPage(
  file: File,
  onProgress?: ProgressCallback,
): Promise<HTMLCanvasElement> {
  onProgress?.("Inicializando visor PDF...");
  const pdfjsLib = await getPdfJs();

  onProgress?.("Leyendo archivo PDF...");
  const buffer = await file.arrayBuffer();

  onProgress?.("Renderizando página del documento...");
  const pdf = await pdfjsLib.getDocument({
    data: buffer,
    disableFontFace: true,
    disableRange: true,
    disableStream: true,
    useSystemFonts: true,
    verbosity: 0,
  }).promise;

  const page = await pdf.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = Math.min(
    1.5,
    MAX_ANALYSIS_DIMENSION /
      Math.max(baseViewport.width, baseViewport.height),
  );
  const viewport = page.getViewport({ scale: Math.max(scale, 0.75) });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo preparar el lienzo para el PDF");
  }

  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);

  await page.render({ canvasContext: context, viewport, canvas }).promise;
  return canvas;
}

export function sourceToCanvas(
  source: HTMLCanvasElement | HTMLImageElement,
): HTMLCanvasElement {
  if (source instanceof HTMLCanvasElement) {
    return source;
  }

  const canvas = document.createElement("canvas");
  canvas.width = source.naturalWidth;
  canvas.height = source.naturalHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo analizar la imagen");
  }

  context.drawImage(source, 0, 0);
  return canvas;
}
