import Tesseract from "tesseract.js";
import { recognizeTextFromCanvas } from "@/features/auth/document-validation/utils/ocrEngine";
import {
  countKeywordMatches,
  hasSufficientOcrText,
  normalizeOcrText,
} from "@/features/auth/document-validation/utils/ocrNormalizer";
import type { FaceAnalysis } from "./faceEngine";
import {
  buildDocumentSearchRegions,
  rankDocumentRegionsForOcr,
} from "./documentSearchRegions";
import { SELFIE_DOCUMENT_OCR_TIMEOUT_MS } from "../constants";

const MIN_OCR_CROP_DIMENSION = 400;
const MAX_OCR_CROP_DIMENSION = 720;
const MAX_OCR_REGIONS = 2;

const DOCUMENT_KEYWORDS = [
  "REPUBLICA",
  "COLOMBIA",
  "CEDULA",
  "CIUDADANIA",
  "IDENTIFICACION",
  "NUIP",
  "REGISTRADOR",
  "NACIONAL",
  "IDENTIDAD",
];

export interface DocumentRegionOcrResult {
  hasDocumentText: boolean;
  text: string;
}

export function hasPartialDocumentOcrSignals(text: string): boolean {
  const normalized = normalizeOcrText(text);
  const keywordMatches = countKeywordMatches(normalized, DOCUMENT_KEYWORDS);
  const digitCount = (normalized.match(/\d/g) ?? []).length;

  return keywordMatches.length >= 1 || digitCount >= 8;
}

export function hasStrongDocumentOcrSignals(text: string): boolean {
  const normalized = normalizeOcrText(text);
  const keywordMatches = countKeywordMatches(normalized, DOCUMENT_KEYWORDS);
  const digitCount = (normalized.match(/\d/g) ?? []).length;

  if (keywordMatches.length >= 2) {
    return true;
  }

  if (keywordMatches.length >= 1 && digitCount >= 6) {
    return true;
  }

  if (keywordMatches.length >= 1 && hasSufficientOcrText(text)) {
    return true;
  }

  return false;
}

/** Alias conservado para pruebas y lectura temprana de regiones OCR. */
export function hasDocumentOcrSignals(text: string): boolean {
  return hasStrongDocumentOcrSignals(text);
}

function cropRegionToCanvas(
  canvas: HTMLCanvasElement,
  region: { x: number; y: number; width: number; height: number },
): HTMLCanvasElement {
  const cropped = document.createElement("canvas");
  cropped.width = region.width;
  cropped.height = region.height;

  const context = cropped.getContext("2d");
  if (!context) {
    throw new Error("No se pudo recortar la zona del documento");
  }

  context.drawImage(
    canvas,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    region.width,
    region.height,
  );

  return cropped;
}

function resizeCropForOcr(
  canvas: HTMLCanvasElement,
  targetMaxDimension: number,
): HTMLCanvasElement {
  const maxDimension = Math.max(canvas.width, canvas.height);
  if (maxDimension === targetMaxDimension) {
    return canvas;
  }

  const scale = targetMaxDimension / maxDimension;
  const resized = document.createElement("canvas");
  resized.width = Math.max(1, Math.round(canvas.width * scale));
  resized.height = Math.max(1, Math.round(canvas.height * scale));

  const context = resized.getContext("2d");
  if (!context) {
    return canvas;
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(canvas, 0, 0, resized.width, resized.height);
  return resized;
}

function prepareCropForOcr(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const maxDimension = Math.max(canvas.width, canvas.height);

  if (maxDimension > MAX_OCR_CROP_DIMENSION) {
    return resizeCropForOcr(canvas, MAX_OCR_CROP_DIMENSION);
  }

  if (maxDimension < MIN_OCR_CROP_DIMENSION) {
    return resizeCropForOcr(canvas, MIN_OCR_CROP_DIMENSION);
  }

  return canvas;
}

function flipCanvasHorizontally(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const flipped = document.createElement("canvas");
  flipped.width = canvas.width;
  flipped.height = canvas.height;

  const context = flipped.getContext("2d");
  if (!context) {
    return canvas;
  }

  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.drawImage(canvas, 0, 0);
  return flipped;
}

function enhanceCanvasContrast(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const enhanced = document.createElement("canvas");
  enhanced.width = canvas.width;
  enhanced.height = canvas.height;

  const context = enhanced.getContext("2d");
  if (!context) {
    return canvas;
  }

  context.drawImage(canvas, 0, 0);
  const imageData = context.getImageData(0, 0, enhanced.width, enhanced.height);
  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const luminance =
      0.299 * pixels[index] +
      0.587 * pixels[index + 1] +
      0.114 * pixels[index + 2];
    const stretched = Math.max(0, Math.min(255, (luminance - 70) * (255 / 120)));
    pixels[index] = stretched;
    pixels[index + 1] = stretched;
    pixels[index + 2] = stretched;
  }

  context.putImageData(imageData, 0, 0);
  return enhanced;
}

async function recognizePreparedCrop(
  crop: HTMLCanvasElement,
  pagesegMode: Tesseract.PSM,
): Promise<string> {
  return recognizeTextFromCanvas(
    crop,
    pagesegMode,
    SELFIE_DOCUMENT_OCR_TIMEOUT_MS,
  );
}

async function recognizeCropWithMirror(
  crop: HTMLCanvasElement,
): Promise<string> {
  const prepared = prepareCropForOcr(crop);
  const mirrored = flipCanvasHorizontally(prepared);
  const texts: string[] = [];

  for (const variant of [mirrored, prepared]) {
    const text = await recognizePreparedCrop(variant, Tesseract.PSM.AUTO);
    texts.push(text);

    if (hasStrongDocumentOcrSignals(text)) {
      return text;
    }
  }

  const bestPartial = texts.find((text) => hasPartialDocumentOcrSignals(text));
  if (bestPartial) {
    return bestPartial;
  }

  const enhanced = enhanceCanvasContrast(prepared);
  for (const variant of [enhanced, flipCanvasHorizontally(enhanced)]) {
    const text = await recognizePreparedCrop(variant, Tesseract.PSM.SINGLE_BLOCK);
    texts.push(text);

    if (hasStrongDocumentOcrSignals(text)) {
      return text;
    }
  }

  return texts.reduce(
    (best, current) => (current.length > best.length ? current : best),
    "",
  );
}

export async function detectDocumentTextInSelfie(
  canvas: HTMLCanvasElement,
  face: FaceAnalysis,
): Promise<DocumentRegionOcrResult> {
  const regions = rankDocumentRegionsForOcr(
    buildDocumentSearchRegions(face, canvas.width, canvas.height),
    face,
  );

  if (regions.length === 0) {
    return { hasDocumentText: false, text: "" };
  }

  const texts: string[] = [];

  for (const region of regions.slice(0, MAX_OCR_REGIONS)) {
    const crop = cropRegionToCanvas(canvas, region);
    const text = await recognizeCropWithMirror(crop);
    texts.push(text);

    if (hasStrongDocumentOcrSignals(text)) {
      return {
        hasDocumentText: true,
        text,
      };
    }
  }

  return {
    hasDocumentText: false,
    text: texts.join("\n").trim(),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export async function detectDocumentTextInCrop(
  canvas: HTMLCanvasElement,
  rect: { x: number; y: number; width: number; height: number },
): Promise<string> {
  const padding = Math.round(Math.max(rect.width, rect.height) * 0.1);
  const x = clamp(rect.x - padding, 0, canvas.width - 1);
  const y = clamp(rect.y - padding, 0, canvas.height - 1);
  const width = clamp(
    rect.width + padding * 2,
    1,
    canvas.width - x,
  );
  const height = clamp(
    rect.height + padding * 2,
    1,
    canvas.height - y,
  );

  const crop = cropRegionToCanvas(canvas, { x, y, width, height });
  return recognizeCropWithMirror(crop);
}
