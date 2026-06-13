import Tesseract from "tesseract.js";
import type { OCRResult } from "../types";
import { hasSufficientOcrText } from "../utils/ocrNormalizer";
import type { ImageSourceResult } from "../utils/fileToImageSource";
import { prepareAnalysisCanvas } from "../utils/prepareAnalysisCanvas";
import { withTimeout } from "../utils/asyncUtils";
import { OCR_CANVAS_PREP_TIMEOUT_MS, OCR_RECOGNIZE_TIMEOUT_MS } from "../constants";

type ProgressCallback = (progress: number, message: string) => void;

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
      const imageBlob = await canvasToImageBlob(analysisCanvas);

      await worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      });

      const result = await withTimeout(
        worker.recognize(imageBlob),
        OCR_RECOGNIZE_TIMEOUT_MS,
        "El reconocimiento de texto tardó demasiado. Intente con JPG o PNG.",
      );

      const text = result.data.text ?? "";
      const confidence = result.data.confidence ?? 0;

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
