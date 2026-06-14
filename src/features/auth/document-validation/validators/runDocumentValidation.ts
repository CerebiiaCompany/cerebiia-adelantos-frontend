import type { ValidationCheckItem } from "../types";
import { CHECK_LABELS } from "../types";
import { validateFileFormat, validateFileSize } from "../validators/fileFormat.validator";
import { validateImageQuality } from "../validators/imageQuality.validator";
import { fileToImageSource } from "../utils/fileToImageSource";
import { runOCR } from "../utils/ocrEngine";
import { prepareAnalysisCanvas } from "../utils/prepareAnalysisCanvas";
import { withTimeout, yieldToMainThread } from "../utils/asyncUtils";
import {
  OCR_CANVAS_PREP_TIMEOUT_MS,
  OCR_RECOGNIZE_TIMEOUT_MS,
} from "../constants";

const FILE_PREP_TIMEOUT_MS = 45_000;

interface RunValidationParams {
  file: File;
  onProgress?: (progress: number, message: string) => void;
}

function buildCheck(
  id: ValidationCheckItem["id"],
  passed: boolean,
  message?: string,
): ValidationCheckItem {
  return {
    id,
    label: CHECK_LABELS[id],
    passed,
    message,
  };
}

export async function runDocumentFileValidation({
  file,
  onProgress,
}: RunValidationParams) {
  const checks: ValidationCheckItem[] = [];

  onProgress?.(0.05, "Validando formato del archivo...");

  const formatResult = validateFileFormat(file);
  checks.push(buildCheck("format", formatResult.passed, formatResult.message));

  const sizeResult = validateFileSize(file);
  checks.push(buildCheck("size", sizeResult.passed, sizeResult.message));

  if (!formatResult.passed || !sizeResult.passed) {
    return { checks, isValid: false, ocrText: "" };
  }

  onProgress?.(0.12, "Preparando imagen para análisis...");

  const imageSource = await withTimeout(
    fileToImageSource(file, (message) => {
      onProgress?.(0.18, message);
    }),
    FILE_PREP_TIMEOUT_MS,
    "La preparación del archivo tardó demasiado. Intente con JPG o PNG, o un PDF más liviano.",
  );

  await yieldToMainThread();
  onProgress?.(0.35, "Optimizando imagen para análisis...");

  const { analysisCanvas, originalWidth, originalHeight } =
    prepareAnalysisCanvas(imageSource.source);

  await yieldToMainThread();
  onProgress?.(0.42, "Analizando calidad de imagen...");

  const quality = validateImageQuality(
    analysisCanvas,
    originalWidth,
    originalHeight,
  );

  checks.push(
    buildCheck("sharpness", quality.sharpness.passed, quality.sharpness.message),
    buildCheck("brightness", quality.brightness.passed, quality.brightness.message),
    buildCheck("coverage", quality.coverage.passed, quality.coverage.message),
  );

  const qualityPassed = quality.sharpness.passed && quality.coverage.passed;

  if (!qualityPassed) {
    return { checks, isValid: false, ocrText: "" };
  }

  onProgress?.(0.5, "Iniciando reconocimiento de texto...");

  const ocrResult = await withTimeout(
    runOCR(imageSource, (progress, message) => {
      onProgress?.(0.5 + progress * 0.45, message);
    }),
    OCR_RECOGNIZE_TIMEOUT_MS + OCR_CANVAS_PREP_TIMEOUT_MS + 5_000,
    "El reconocimiento de texto tardó demasiado. Intente con JPG o PNG.",
  );

  checks.push(
    buildCheck(
      "ocr",
      ocrResult.sufficientText,
      ocrResult.sufficientText
        ? undefined
        : "No se detectó suficiente texto legible en el documento",
    ),
  );

  onProgress?.(1, "Análisis completado");

  return {
    checks,
    isValid: ocrResult.sufficientText,
    ocrText: ocrResult.text,
  };
}
