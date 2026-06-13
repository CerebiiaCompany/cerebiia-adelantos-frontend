const MIN_WIDTH = 1000;
const MIN_HEIGHT = 600;
const MIN_LAPLACIAN_VARIANCE = 80;
const MIN_MEAN_LUMINANCE = 45;
const MAX_BRIGHT_PIXEL_RATIO = 0.18;
const MIN_DOCUMENT_COVERAGE = 0.6;

export function meetsMinimumResolution(width: number, height: number): boolean {
  const landscapeOk = width >= MIN_WIDTH && height >= MIN_HEIGHT;
  const portraitOk = width >= MIN_HEIGHT && height >= MIN_WIDTH;
  return landscapeOk || portraitOk;
}

export function analyzeImageCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("No se pudo analizar la imagen");
  }

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let luminanceSum = 0;
  let brightPixels = 0;
  const grayscale = new Float32Array(width * height);

  for (let index = 0; index < pixels.length; index += 4) {
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    const pixelIndex = index / 4;

    grayscale[pixelIndex] = luminance;
    luminanceSum += luminance;

    if (luminance > 245) {
      brightPixels += 1;
    }
  }

  const totalPixels = width * height;
  const meanLuminance = luminanceSum / totalPixels;
  const brightRatio = brightPixels / totalPixels;
  const laplacianVariance = calculateLaplacianVariance(
    grayscale,
    width,
    height,
  );
  const coverageRatio = estimateDocumentCoverage(grayscale, width, height);

  return {
    width,
    height,
    meanLuminance,
    brightRatio,
    laplacianVariance,
    coverageRatio,
    resolutionPassed: meetsMinimumResolution(width, height),
    sharpnessPassed: laplacianVariance >= MIN_LAPLACIAN_VARIANCE,
    brightnessPassed:
      meanLuminance >= MIN_MEAN_LUMINANCE && brightRatio <= MAX_BRIGHT_PIXEL_RATIO,
    coveragePassed: coverageRatio >= MIN_DOCUMENT_COVERAGE,
    isTooDark: meanLuminance < MIN_MEAN_LUMINANCE,
    isOverexposed: brightRatio > MAX_BRIGHT_PIXEL_RATIO,
    isBlurry: laplacianVariance < MIN_LAPLACIAN_VARIANCE,
    isIncomplete: coverageRatio < MIN_DOCUMENT_COVERAGE,
  };
}

function calculateLaplacianVariance(
  grayscale: Float32Array,
  width: number,
  height: number,
): number {
  const laplacianValues: number[] = [];

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const index = y * width + x;
      const center = grayscale[index];
      const up = grayscale[index - width];
      const down = grayscale[index + width];
      const left = grayscale[index - 1];
      const right = grayscale[index + 1];
      const laplacian = Math.abs(4 * center - up - down - left - right);
      laplacianValues.push(laplacian);
    }
  }

  if (laplacianValues.length === 0) return 0;

  const mean =
    laplacianValues.reduce((sum, value) => sum + value, 0) /
    laplacianValues.length;
  const variance =
    laplacianValues.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    laplacianValues.length;

  return variance;
}

function estimateDocumentCoverage(
  grayscale: Float32Array,
  width: number,
  height: number,
): number {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let contentPixels = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const value = grayscale[y * width + x];
      const isEdgeLike = value < 210 && value > 25;

      if (isEdgeLike) {
        contentPixels += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (contentPixels < 50 || maxX <= minX || maxY <= minY) {
    return 0;
  }

  const boundingArea = (maxX - minX + 1) * (maxY - minY + 1);
  const sampledArea = Math.ceil(width / 2) * Math.ceil(height / 2);
  return boundingArea / sampledArea;
}
