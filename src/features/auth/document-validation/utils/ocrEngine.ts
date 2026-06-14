import Tesseract from "tesseract.js";
import type { OCRResult } from "../types";
import { hasSufficientOcrText } from "../utils/ocrNormalizer";
import type { ImageSourceResult } from "../utils/fileToImageSource";
import { prepareAnalysisCanvas } from "../utils/prepareAnalysisCanvas";
import { withTimeout } from "../utils/asyncUtils";
import { OCR_CANVAS_PREP_TIMEOUT_MS, OCR_RECOGNIZE_TIMEOUT_MS } from "../constants";

type ProgressCallback = (progress: number, message: string) => void;

const HEADER_CROP_HEIGHT_RATIO = 0.38;

let workerPromise: ReturnType<typeof Tesseract.createWorker> | null = null;
let activeProgressHandler: ProgressCallback | null = null;
let ocrQueue: Promise<unknown> = Promise.resolve();

function enqueueOcrTask<T>(task: () => Promise<T>): Promise<T> {
  const next = ocrQueue.then(task, task);
  ocrQueue = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function canvasToImageBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return withTimeout(
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
            return;
          }
          reject(new Error("No se pudo preparar la imagen para OCR"));
        },
        "image/png",
      );
    }),
    OCR_CANVAS_PREP_TIMEOUT_MS,
    "No se pudo preparar la imagen para OCR",
  );
}

async function getWorker() {
  if (!workerPromise) {
    workerPromise = Tesseract.createWorker("spa", 1, {
      logger: (message) => {
        if (
          message.status === "recognizing text" &&
          typeof message.progress === "number" &&
          activeProgressHandler
        ) {
          activeProgressHandler(
            0.05 + message.progress * 0.95,
            "Extrayendo texto del documento...",
          );
        }
      },
    });
  }

  return workerPromise;
}

function cropCanvasRegion(
  canvas: HTMLCanvasElement,
  y: number,
  height: number,
): HTMLCanvasElement {
  const cropped = document.createElement("canvas");
  cropped.width = canvas.width;
  cropped.height = height;

  const context = cropped.getContext("2d");
  if (!context) {
    throw new Error("No se pudo recortar la imagen para OCR");
  }

  context.drawImage(
    canvas,
    0,
    y,
    canvas.width,
    height,
    0,
    0,
    canvas.width,
    height,
  );

  return cropped;
}

function cropHeaderRegion(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const height = Math.max(Math.round(canvas.height * HEADER_CROP_HEIGHT_RATIO), 120);
  return cropCanvasRegion(canvas, 0, Math.min(height, canvas.height));
}

async function recognizeCanvasText(
  worker: Awaited<ReturnType<typeof Tesseract.createWorker>>,
  canvas: HTMLCanvasElement,
  pagesegMode: Tesseract.PSM,
  timeoutMs = OCR_RECOGNIZE_TIMEOUT_MS,
): Promise<string> {
  const imageBlob = await canvasToImageBlob(canvas);

  await worker.setParameters({
    tessedit_pageseg_mode: pagesegMode,
  });

  const result = await withTimeout(
    worker.recognize(imageBlob),
    timeoutMs,
    "El reconocimiento de texto tardó demasiado. Intente con JPG o PNG.",
  );

  return result.data.text ?? "";
}

export async function recognizeTextFromCanvas(
  canvas: HTMLCanvasElement,
  pagesegMode: Tesseract.PSM = Tesseract.PSM.SINGLE_BLOCK,
  timeoutMs = OCR_RECOGNIZE_TIMEOUT_MS,
): Promise<string> {
  return enqueueOcrTask(async () => {
    const worker = await getWorker();
    return recognizeCanvasText(worker, canvas, pagesegMode, timeoutMs);
  });
}

export async function warmupOcrEngine(): Promise<void> {
  await getWorker();
}

export async function runOCR(
  imageSource: ImageSourceResult,
  onProgress?: ProgressCallback,
): Promise<OCRResult> {
  return enqueueOcrTask(async () => {
    onProgress?.(0, "Preparando motor de reconocimiento...");
    const worker = await getWorker();
    const { analysisCanvas } = prepareAnalysisCanvas(imageSource.source);

    onProgress?.(0.05, "Extrayendo texto del documento...");
    activeProgressHandler = (progress, message) => onProgress?.(progress, message);

    try {
      const fullText = await recognizeCanvasText(
        worker,
        analysisCanvas,
        Tesseract.PSM.AUTO,
      );

      onProgress?.(0.72, "Leyendo número del documento...");
      const headerCanvas = cropHeaderRegion(analysisCanvas);
      const headerText = await recognizeCanvasText(
        worker,
        headerCanvas,
        Tesseract.PSM.SINGLE_BLOCK,
      );

      const text = [fullText, headerText].filter(Boolean).join("\n");
      const confidence = fullText.length > 0 ? 100 : 0;

      return {
        text,
        confidence,
        sufficientText: hasSufficientOcrText(text),
      };
    } finally {
      activeProgressHandler = null;
    }
  });
}

export async function terminateOcrWorker() {
  activeProgressHandler = null;
  ocrQueue = Promise.resolve();

  if (!workerPromise) return;

  const pendingWorker = workerPromise;
  workerPromise = null;

  try {
    const worker = await pendingWorker;
    await worker.terminate();
  } catch {
    // Ignorar errores al cerrar un worker en creación o ya terminado.
  }
}
