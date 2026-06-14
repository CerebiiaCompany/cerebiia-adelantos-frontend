import {
  MAX_SELFIE_BRIGHT_RATIO,
  MIN_SELFIE_DIMENSION,
  MIN_SELFIE_LAPLACIAN,
  MIN_SELFIE_LUMINANCE,
} from "../constants";

export interface SelfieQualityResult {
  blockingPassed: boolean;
  blockingMessage?: string;
  advisoryMessage?: string;
  isBlurry: boolean;
  isTooDark: boolean;
  isOverexposed: boolean;
  resolutionPassed: boolean;
}

export function analyzeSelfieQuality(
  canvas: HTMLCanvasElement,
): SelfieQualityResult {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return {
      blockingPassed: false,
      blockingMessage: "No se pudo analizar la imagen",
      isBlurry: true,
      isTooDark: true,
      isOverexposed: false,
      resolutionPassed: false,
    };
  }

  const { width, height } = canvas;
  const resolutionPassed =
    width >= MIN_SELFIE_DIMENSION && height >= MIN_SELFIE_DIMENSION;

  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  let luminanceSum = 0;
  let brightPixels = 0;
  const grayscale = new Float32Array(width * height);

  for (let index = 0; index < pixels.length; index += 4) {
    const luminance =
      0.299 * pixels[index] +
      0.587 * pixels[index + 1] +
      0.114 * pixels[index + 2];
    const pixelIndex = index / 4;
    grayscale[pixelIndex] = luminance;
    luminanceSum += luminance;
    if (luminance > 245) brightPixels += 1;
  }

  const totalPixels = width * height;
  const meanLuminance = luminanceSum / totalPixels;
  const brightRatio = brightPixels / totalPixels;
  const laplacianVariance = calculateLaplacianVariance(grayscale, width, height);

  const isBlurry = laplacianVariance < MIN_SELFIE_LAPLACIAN;
  const isTooDark = meanLuminance < MIN_SELFIE_LUMINANCE;
  const isOverexposed = brightRatio > MAX_SELFIE_BRIGHT_RATIO;

  if (!resolutionPassed) {
    return {
      blockingPassed: false,
      blockingMessage: "La imagen es demasiado pequeña. Usa una foto más cercana",
      isBlurry,
      isTooDark,
      isOverexposed,
      resolutionPassed,
    };
  }

  if (meanLuminance < 18) {
    return {
      blockingPassed: false,
      blockingMessage: "La imagen está demasiado oscura para reconocer tu rostro",
      isBlurry,
      isTooDark,
      isOverexposed,
      resolutionPassed,
    };
  }

  const advisoryParts: string[] = [];
  if (isBlurry) {
    advisoryParts.push("nitidez mejorable");
  }
  if (isTooDark) {
    advisoryParts.push("poca iluminación");
  }
  if (isOverexposed) {
    advisoryParts.push("mucho brillo o reflejo");
  }

  return {
    blockingPassed: true,
    advisoryMessage:
      advisoryParts.length > 0
        ? `Imagen aceptable (${advisoryParts.join(", ")}). Verificando coincidencia facial...`
        : undefined,
    isBlurry,
    isTooDark,
    isOverexposed,
    resolutionPassed,
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
      const laplacian = Math.abs(
        4 * center -
          grayscale[index - width] -
          grayscale[index + width] -
          grayscale[index - 1] -
          grayscale[index + 1],
      );
      laplacianValues.push(laplacian);
    }
  }

  if (laplacianValues.length === 0) return 0;

  const mean =
    laplacianValues.reduce((sum, value) => sum + value, 0) /
    laplacianValues.length;

  return (
    laplacianValues.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    laplacianValues.length
  );
}
