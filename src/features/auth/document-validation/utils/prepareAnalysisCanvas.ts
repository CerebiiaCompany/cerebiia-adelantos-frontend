import { MAX_ANALYSIS_DIMENSION } from "../constants";
import { sourceToCanvas } from "./fileToImageSource";

export interface PreparedCanvas {
  analysisCanvas: HTMLCanvasElement;
  originalWidth: number;
  originalHeight: number;
}

export function prepareAnalysisCanvas(
  source: HTMLCanvasElement | HTMLImageElement,
): PreparedCanvas {
  const full = sourceToCanvas(source);
  const originalWidth = full.width;
  const originalHeight = full.height;
  const maxDim = Math.max(originalWidth, originalHeight);

  if (maxDim <= MAX_ANALYSIS_DIMENSION) {
    return {
      analysisCanvas: full,
      originalWidth,
      originalHeight,
    };
  }

  const scale = MAX_ANALYSIS_DIMENSION / maxDim;
  const analysisCanvas = document.createElement("canvas");
  analysisCanvas.width = Math.round(originalWidth * scale);
  analysisCanvas.height = Math.round(originalHeight * scale);

  const context = analysisCanvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo optimizar la imagen para análisis");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(full, 0, 0, analysisCanvas.width, analysisCanvas.height);

  return {
    analysisCanvas,
    originalWidth,
    originalHeight,
  };
}

export { MAX_ANALYSIS_DIMENSION };
