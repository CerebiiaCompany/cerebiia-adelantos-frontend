export const MAX_SELFIE_ANALYSIS_DIMENSION = 1280;

export function prepareSelfieAnalysisCanvas(
  source: HTMLCanvasElement,
): HTMLCanvasElement {
  const maxDimension = Math.max(source.width, source.height);

  if (maxDimension <= MAX_SELFIE_ANALYSIS_DIMENSION) {
    return source;
  }

  const scale = MAX_SELFIE_ANALYSIS_DIMENSION / maxDimension;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(source.width * scale);
  canvas.height = Math.round(source.height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo optimizar la selfie para validación");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);

  return canvas;
}
