import type { ImageQualityResult } from "../types";
import {
  analyzeImageCanvas,
  meetsMinimumResolution,
} from "../utils/imageAnalysis";

export function validateImageQuality(
  analysisCanvas: HTMLCanvasElement,
  originalWidth: number,
  originalHeight: number,
): ImageQualityResult {
  const analysis = analyzeImageCanvas(analysisCanvas);
  const resolutionPassed = meetsMinimumResolution(originalWidth, originalHeight);

  return {
    resolution: {
      passed: resolutionPassed,
      width: originalWidth,
      height: originalHeight,
      message: resolutionPassed
        ? undefined
        : "La imagen debe tener al menos 1000 x 600 píxeles",
    },
    sharpness: {
      passed: analysis.sharpnessPassed,
      score: analysis.laplacianVariance,
      message: analysis.isBlurry
        ? "La imagen se ve borrosa. Intenta enfocar mejor el documento"
        : undefined,
    },
    brightness: {
      passed: analysis.brightnessPassed,
      mean: analysis.meanLuminance,
      message: analysis.isTooDark
        ? "La imagen está demasiado oscura. Mejora la iluminación"
        : analysis.isOverexposed
          ? "La imagen está sobreexpuesta. Evita reflejos y luz directa"
          : undefined,
    },
    coverage: {
      passed: analysis.coveragePassed,
      ratio: analysis.coverageRatio,
      message: analysis.isIncomplete
        ? "Asegúrate de capturar todo el documento sin cortar los bordes"
        : undefined,
    },
  };
}
