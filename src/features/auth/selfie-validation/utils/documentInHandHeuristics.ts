import {
  detectDocumentTextInCrop,
  detectDocumentTextInSelfie,
  hasPartialDocumentOcrSignals,
  hasStrongDocumentOcrSignals,
} from "./documentRegionOcr";
import { buildDocumentSearchRegions } from "./documentSearchRegions";
import type { FaceAnalysis } from "./faceEngine";

export interface DocumentInHandResult {
  passed: boolean;
  message?: string;
  score: number;
}

export interface SelfieFaceClassification {
  primary: FaceAnalysis;
  secondary: FaceAnalysis | null;
  error?: string;
}

export interface DocumentStructureAnalysis {
  score: number;
  strictPass: boolean;
  moderatePass: boolean;
  visualPass: boolean;
  secondaryFaceSignal: boolean;
  bestTextBands: number;
  bestWideLines: number;
  bestRect: CandidateRect | null;
}

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CandidateRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CandidateMetrics {
  score: number;
  textBands: number;
  wideLines: number;
  borderUniformity: number;
  averageBorder: number;
  faceOverlapRatio: number;
  besideFace: boolean;
  inHoldingZone: boolean;
  lightInterior: boolean;
  rect: CandidateRect;
}

const CARD_ASPECT_RATIOS = [1.4, 1.585, 1.72];
const MIN_CARD_AREA_RATIO = 0.008;
const MAX_CARD_AREA_RATIO = 0.32;
const MIN_TEXT_BANDS = 4;
const MIN_WIDE_LINES = 3;
const MIN_MODERATE_TEXT_BANDS = 3;
const MIN_MODERATE_WIDE_LINES = 2;
const MIN_BORDER_UNIFORMITY = 0.45;
const MIN_MODERATE_BORDER_UNIFORMITY = 0.34;
const MIN_AVERAGE_BORDER = 10;
const MIN_MODERATE_AVERAGE_BORDER = 6;
const MAX_FACE_OVERLAP_RATIO = 0.12;
const MAX_MODERATE_FACE_OVERLAP_RATIO = 0.18;
const MAX_BESIDE_FACE_OVERLAP_MODERATE = 0.88;
const MAX_BESIDE_FACE_OVERLAP_VISUAL = 0.92;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getLuminanceAt(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  x: number,
  y: number,
): number {
  const safeX = clamp(x, 0, canvasWidth - 1);
  const safeY = clamp(y, 0, Math.floor(pixels.length / (canvasWidth * 4)) - 1);
  const index = (safeY * canvasWidth + safeX) * 4;
  return getLuminance(pixels[index], pixels[index + 1], pixels[index + 2]);
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function measureVerticalEdge(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  x: number,
  y: number,
): number {
  const above = getLuminanceAt(pixels, canvasWidth, x, y - 1);
  const below = getLuminanceAt(pixels, canvasWidth, x, y + 1);
  return Math.abs(below - above);
}

function measureHorizontalEdge(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  x: number,
  y: number,
): number {
  const left = getLuminanceAt(pixels, canvasWidth, x - 1, y);
  const right = getLuminanceAt(pixels, canvasWidth, x + 1, y);
  return Math.abs(right - left);
}

function getRectOverlapRatio(left: CandidateRect, right: CandidateRect): number {
  const overlapWidth = Math.max(
    0,
    Math.min(left.x + left.width, right.x + right.width) -
      Math.max(left.x, right.x),
  );
  const overlapHeight = Math.max(
    0,
    Math.min(left.y + left.height, right.y + right.height) -
      Math.max(left.y, right.y),
  );
  const overlapArea = overlapWidth * overlapHeight;
  return overlapArea / (left.width * left.height || 1);
}

function isPlausibleIdPhotoFace(
  primary: FaceAnalysis,
  secondary: FaceAnalysis,
): boolean {
  const primaryArea = primary.box.width * primary.box.height;
  const secondaryArea = secondary.box.width * secondary.box.height;
  const areaRatio = secondaryArea / (primaryArea || 1);

  if (areaRatio > 0.42 || secondary.box.width > primary.box.width * 0.65) {
    return false;
  }

  const secondaryCenterY = secondary.box.y + secondary.box.height / 2;
  const primaryCenterY = primary.box.y + primary.box.height / 2;
  const verticalDelta = Math.abs(secondaryCenterY - primaryCenterY);

  if (verticalDelta <= primary.box.height * 0.5) {
    return true;
  }

  return secondary.box.y >= primary.box.y + primary.box.height * 0.05;
}

export function isSecondaryFaceOnDocumentRegion(
  primary: FaceAnalysis,
  secondary: FaceAnalysis,
  canvasWidth: number,
  canvasHeight: number,
): boolean {
  if (!isPlausibleIdPhotoFace(primary, secondary)) {
    return false;
  }

  const regions = buildDocumentSearchRegions(primary, canvasWidth, canvasHeight);
  const centerX = secondary.box.x + secondary.box.width / 2;
  const centerY = secondary.box.y + secondary.box.height / 2;

  return regions.some((region) => containsPoint(region, centerX, centerY));
}

export function classifySelfieFaces(
  faces: FaceAnalysis[],
): SelfieFaceClassification {
  if (faces.length === 0) {
    return {
      primary: faces[0],
      secondary: null,
      error: "No detectamos rostro. Asegúrate de que tu cara sea visible y clara",
    };
  }

  const sorted = [...faces].sort(
    (left, right) =>
      right.box.width * right.box.height - left.box.width * left.box.height,
  );
  const primary = sorted[0];

  if (faces.length === 1) {
    return { primary, secondary: null };
  }

  if (faces.length === 2) {
    const secondary = sorted[1];

    if (isPlausibleIdPhotoFace(primary, secondary)) {
      return { primary, secondary };
    }

    return {
      primary,
      secondary: null,
      error: "Detectamos más de un rostro. Debe aparecer solo tu cara",
    };
  }

  const secondary = sorted
    .slice(1)
    .find((face) => isPlausibleIdPhotoFace(primary, face));

  if (secondary) {
    return { primary, secondary };
  }

  return {
    primary,
    secondary: null,
    error: "Detectamos más de un rostro. Debe aparecer solo tu cara",
  };
}

function estimateInnerBackgroundLuminance(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  inner: CandidateRect,
): number {
  const samplePoints = [
    [inner.x + 2, inner.y + 2],
    [inner.x + inner.width - 3, inner.y + 2],
    [inner.x + 2, inner.y + inner.height - 3],
    [inner.x + inner.width - 3, inner.y + inner.height - 3],
    [inner.x + Math.floor(inner.width / 2), inner.y + 2],
  ] as const;

  const samples = samplePoints.map(([x, y]) =>
    getLuminanceAt(pixels, canvasWidth, x, y),
  );

  return samples.reduce((total, value) => total + value, 0) / samples.length;
}

function isDarkTextPixel(luminance: number, backgroundLuminance: number): boolean {
  return luminance < Math.max(42, backgroundLuminance - 36);
}

function isCandidateBesideFace(
  rect: CandidateRect,
  faceBox: CandidateRect,
): boolean {
  const centerY = rect.y + rect.height / 2;
  const verticallyAligned =
    centerY >= faceBox.y + faceBox.height * 0.02 &&
    centerY <= faceBox.y + faceBox.height * 1.02;

  if (!verticallyAligned) {
    return false;
  }

  const cardCenterX = rect.x + rect.width / 2;
  const faceCenterX = faceBox.x + faceBox.width / 2;
  const horizontalOffset = Math.abs(cardCenterX - faceCenterX);
  const offsetRatio = horizontalOffset / Math.max(1, faceBox.width * 0.5);

  if (offsetRatio >= 0.3) {
    return true;
  }

  const leftExposed = rect.x < faceBox.x - rect.width * 0.05;
  const rightExposed =
    rect.x + rect.width > faceBox.x + faceBox.width + rect.width * 0.05;
  const overlapsFromLeft =
    rect.x < faceBox.x &&
    rect.x + rect.width > faceBox.x + faceBox.width * 0.18;
  const overlapsFromRight =
    rect.x + rect.width > faceBox.x + faceBox.width &&
    rect.x < faceBox.x + faceBox.width * 0.82;

  return leftExposed || rightExposed || overlapsFromLeft || overlapsFromRight;
}

function isInDocumentHoldingZone(
  rect: CandidateRect,
  faceBox: CandidateRect,
): boolean {
  const centerY = rect.y + rect.height / 2;
  return centerY <= faceBox.y + faceBox.height * 1.08;
}

function isDarkDocumentTextPixel(
  luminance: number,
  backgroundLuminance: number,
): boolean {
  return luminance < Math.min(96, backgroundLuminance - 48);
}

function hasLightDocumentInterior(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  inner: CandidateRect,
): boolean {
  const samples: number[] = [];
  const stepX = Math.max(1, Math.floor(inner.width / 16));
  const stepY = Math.max(1, Math.floor(inner.height / 16));
  const backgroundLuminance = estimateInnerBackgroundLuminance(
    pixels,
    canvasWidth,
    inner,
  );

  for (let row = inner.y; row < inner.y + inner.height; row += stepY) {
    for (let col = inner.x; col < inner.x + inner.width; col += stepX) {
      samples.push(getLuminanceAt(pixels, canvasWidth, col, row));
    }
  }

  if (samples.length === 0) {
    return false;
  }

  const meanLuminance =
    samples.reduce((total, value) => total + value, 0) / samples.length;

  if (meanLuminance < 168) {
    return false;
  }

  const darkPixels = samples.filter((luminance) =>
    isDarkDocumentTextPixel(luminance, backgroundLuminance),
  ).length;
  const darkRatio = darkPixels / samples.length;

  if (meanLuminance >= 205 && darkRatio <= 0.3) {
    return true;
  }

  return darkRatio >= 0.015 && darkRatio <= 0.34;
}

function countTextBands(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  inner: CandidateRect,
): number {
  const rowStep = Math.max(3, Math.floor(inner.height / 16));
  const backgroundLuminance = estimateInnerBackgroundLuminance(
    pixels,
    canvasWidth,
    inner,
  );
  let textBands = 0;

  for (let row = inner.y; row < inner.y + inner.height; row += rowStep) {
    let darkPixels = 0;
    let samples = 0;

    for (let col = inner.x; col < inner.x + inner.width; col += 2) {
      const luminance = getLuminanceAt(pixels, canvasWidth, col, row);
      if (isDarkTextPixel(luminance, backgroundLuminance)) {
        darkPixels += 1;
      }
      samples += 1;
    }

    if (samples > 0 && darkPixels / samples >= 0.2) {
      textBands += 1;
    }
  }

  return textBands;
}

function countWideTextLines(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  inner: CandidateRect,
): number {
  const rowStep = Math.max(3, Math.floor(inner.height / 16));
  const backgroundLuminance = estimateInnerBackgroundLuminance(
    pixels,
    canvasWidth,
    inner,
  );
  let wideLines = 0;
  const minWideRatio = 0.28;

  for (let row = inner.y; row < inner.y + inner.height; row += rowStep) {
    let runLength = 0;
    let maxRun = 0;

    for (let col = inner.x; col < inner.x + inner.width; col += 1) {
      const luminance = getLuminanceAt(pixels, canvasWidth, col, row);
      const isDark = isDarkTextPixel(luminance, backgroundLuminance);

      if (isDark) {
        runLength += 1;
      } else if (runLength > 0) {
        maxRun = Math.max(maxRun, runLength);
        runLength = 0;
      }
    }

    maxRun = Math.max(maxRun, runLength);

    if (maxRun / inner.width >= minWideRatio) {
      wideLines += 1;
    }
  }

  return wideLines;
}

function getCandidatePlacementRank(metrics: CandidateMetrics): number {
  if (metrics.besideFace && metrics.inHoldingZone && metrics.lightInterior) {
    return 3;
  }
  if (metrics.besideFace && metrics.inHoldingZone) {
    return 2;
  }
  if (metrics.besideFace) {
    return 1;
  }
  return 0;
}

function shouldReplaceBestCandidate(
  next: CandidateMetrics,
  current: CandidateMetrics | null,
): boolean {
  if (!current) {
    return true;
  }

  const nextRank = getCandidatePlacementRank(next);
  const currentRank = getCandidatePlacementRank(current);

  if (nextRank !== currentRank) {
    return nextRank > currentRank;
  }

  return (
    next.score > current.score ||
    (next.score === current.score && next.textBands > current.textBands)
  );
}

function measureBorderSide(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  rect: CandidateRect,
  side: "top" | "bottom" | "left" | "right",
): number {
  const samples = 14;
  let best = 0;

  for (let index = 0; index < samples; index += 1) {
    const t = index / (samples - 1);

    for (const offset of [-2, -1, 0, 1, 2]) {
      if (side === "top" || side === "bottom") {
        const sampleX = rect.x + Math.floor(t * (rect.width - 1));
        const sampleY =
          side === "top"
            ? rect.y + offset
            : rect.y + rect.height - 1 + offset;
        best = Math.max(
          best,
          measureVerticalEdge(pixels, canvasWidth, sampleX, sampleY),
        );
      } else {
        const sampleY = rect.y + Math.floor(t * (rect.height - 1));
        const sampleX =
          side === "left"
            ? rect.x + offset
            : rect.x + rect.width - 1 + offset;
        best = Math.max(
          best,
          measureHorizontalEdge(pixels, canvasWidth, sampleX, sampleY),
        );
      }
    }
  }

  return best;
}

function evaluateCardCandidate(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  rect: CandidateRect,
  imageArea: number,
  faceBox: CandidateRect,
): CandidateMetrics | null {
  const { width, height } = rect;
  const areaRatio = (width * height) / imageArea;

  if (areaRatio < MIN_CARD_AREA_RATIO || areaRatio > MAX_CARD_AREA_RATIO) {
    return null;
  }

  const aspect = width / height;
  const normalizedAspect = aspect >= 1 ? aspect : 1 / aspect;
  if (normalizedAspect < 1.28 || normalizedAspect > 1.95) {
    return null;
  }

  const top = measureBorderSide(pixels, canvasWidth, rect, "top");
  const bottom = measureBorderSide(pixels, canvasWidth, rect, "bottom");
  const left = measureBorderSide(pixels, canvasWidth, rect, "left");
  const right = measureBorderSide(pixels, canvasWidth, rect, "right");
  const edges = [top, bottom, left, right];
  const averageBorder =
    edges.reduce((total, value) => total + value, 0) / edges.length;
  const minimumBorder = Math.min(...edges);
  const borderUniformity = minimumBorder / averageBorder;
  const inner: CandidateRect = {
    x: rect.x + Math.floor(width * 0.08),
    y: rect.y + Math.floor(height * 0.12),
    width: Math.floor(width * 0.84),
    height: Math.floor(height * 0.72),
  };
  const textBands = countTextBands(pixels, canvasWidth, inner);
  const wideLines = countWideTextLines(pixels, canvasWidth, inner);
  const hasTextStructure = textBands >= 2 && wideLines >= 1;

  if (!Number.isFinite(averageBorder) || averageBorder <= 0) {
    return null;
  }

  if (averageBorder < 2.2 && !hasTextStructure) {
    return null;
  }

  if (!hasTextStructure) {
    if (averageBorder < 4 || minimumBorder < averageBorder * 0.32) {
      return null;
    }
  } else if (averageBorder < 2.8 && minimumBorder < averageBorder * 0.22) {
    return null;
  }

  const faceOverlapRatio = getRectOverlapRatio(rect, faceBox);
  const besideFace = isCandidateBesideFace(rect, faceBox);
  const inHoldingZone = isInDocumentHoldingZone(rect, faceBox);
  const lightInterior = hasLightDocumentInterior(pixels, canvasWidth, inner);

  let score = 0;
  score += Math.min(0.25, ((averageBorder - 6) / 40) * 0.25);
  score += borderUniformity * 0.2;
  score += Math.min(0.25, (textBands / MIN_TEXT_BANDS) * 0.25);
  score += Math.min(0.3, (wideLines / MIN_WIDE_LINES) * 0.3);

  if (
    faceOverlapRatio > MAX_FACE_OVERLAP_RATIO &&
    !(besideFace && inHoldingZone)
  ) {
    score *= 0.35;
  }

  return {
    score: Math.min(1, score),
    textBands,
    wideLines,
    borderUniformity,
    averageBorder,
    faceOverlapRatio,
    besideFace,
    inHoldingZone,
    lightInterior,
    rect,
  };
}

function getMaxFaceOverlapRatio(
  metrics: CandidateMetrics,
  tier: "strict" | "moderate" | "visual",
): number {
  if (metrics.besideFace && metrics.inHoldingZone) {
    if (tier === "visual") {
      return MAX_BESIDE_FACE_OVERLAP_VISUAL;
    }
    if (tier === "moderate") {
      return MAX_BESIDE_FACE_OVERLAP_MODERATE;
    }
    return 0.45;
  }

  if (tier === "visual") {
    return 0.35;
  }
  if (tier === "moderate") {
    return MAX_MODERATE_FACE_OVERLAP_RATIO;
  }

  return MAX_FACE_OVERLAP_RATIO;
}

function isStrictDocumentCandidate(metrics: CandidateMetrics): boolean {
  return (
    metrics.besideFace &&
    metrics.inHoldingZone &&
    metrics.lightInterior &&
    metrics.textBands >= MIN_TEXT_BANDS &&
    metrics.wideLines >= MIN_WIDE_LINES &&
    metrics.borderUniformity >= MIN_BORDER_UNIFORMITY &&
    metrics.averageBorder >= MIN_AVERAGE_BORDER &&
    metrics.faceOverlapRatio <= getMaxFaceOverlapRatio(metrics, "strict") &&
    metrics.score >= 0.4
  );
}

function isModerateDocumentCandidate(metrics: CandidateMetrics): boolean {
  return (
    metrics.besideFace &&
    metrics.inHoldingZone &&
    metrics.lightInterior &&
    metrics.textBands >= MIN_MODERATE_TEXT_BANDS &&
    metrics.wideLines >= MIN_MODERATE_WIDE_LINES &&
    metrics.borderUniformity >= MIN_MODERATE_BORDER_UNIFORMITY &&
    metrics.averageBorder >= MIN_MODERATE_AVERAGE_BORDER &&
    metrics.faceOverlapRatio <= getMaxFaceOverlapRatio(metrics, "moderate") &&
    metrics.score >= 0.34
  );
}

function isVisualDocumentCandidate(metrics: CandidateMetrics): boolean {
  return (
    metrics.besideFace &&
    metrics.inHoldingZone &&
    metrics.lightInterior &&
    metrics.textBands >= 2 &&
    metrics.wideLines >= 1 &&
    metrics.borderUniformity >= 0.3 &&
    metrics.averageBorder >= 4.5 &&
    metrics.faceOverlapRatio <= getMaxFaceOverlapRatio(metrics, "visual") &&
    metrics.score >= 0.26
  );
}

function scanRegionForBestCandidate(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  region: Region,
  imageArea: number,
  faceBox: CandidateRect,
): CandidateMetrics | null {
  let bestMetrics: CandidateMetrics | null = null;
  const minPrimary = Math.max(
    24,
    Math.floor(Math.min(region.width, region.height) * 0.14),
  );
  const maxPrimary = Math.max(region.width, region.height) - 4;
  const widthStep = Math.max(
    6,
    Math.floor(Math.min(region.width, region.height) / 22),
  );
  const positionStep = Math.max(
    4,
    Math.floor(Math.min(region.width, region.height) / 26),
  );

  for (let primaryDim = minPrimary; primaryDim <= maxPrimary; primaryDim += widthStep) {
    for (const aspect of CARD_ASPECT_RATIOS) {
      const landscapeWidth = primaryDim;
      const landscapeHeight = Math.floor(primaryDim / aspect);
      const portraitWidth = Math.floor(primaryDim / aspect);
      const portraitHeight = primaryDim;
      const candidates = [
        { width: landscapeWidth, height: landscapeHeight },
        { width: portraitWidth, height: portraitHeight },
      ];

      for (const { width, height } of candidates) {
        if (height < 24 || height > region.height - 4 || width > region.width - 4) {
          continue;
        }

        for (
          let candidateX = region.x;
          candidateX <= region.x + region.width - width;
          candidateX += positionStep
        ) {
          for (
            let candidateY = region.y;
            candidateY <= region.y + region.height - height;
            candidateY += positionStep
          ) {
            const metrics = evaluateCardCandidate(
              pixels,
              canvasWidth,
              {
                x: candidateX,
                y: candidateY,
                width,
                height,
              },
              imageArea,
              faceBox,
            );

            if (!metrics) {
              continue;
            }

            if (
              shouldReplaceBestCandidate(metrics, bestMetrics)
            ) {
              bestMetrics = metrics;
            }
          }
        }
      }
    }
  }

  return bestMetrics;
}

function scanCheekLevelCandidates(
  pixels: Uint8ClampedArray,
  canvasWidth: number,
  faceBox: CandidateRect,
  imageArea: number,
  currentBest: CandidateMetrics | null,
): CandidateMetrics | null {
  let bestMetrics = currentBest;
  const cheekY = Math.floor(faceBox.y + faceBox.height * 0.52);
  const heightOptions = [
    Math.floor(faceBox.height * 0.3),
    Math.floor(faceBox.height * 0.42),
    Math.floor(faceBox.height * 0.55),
  ].filter((value) => value >= 24);

  const xOptions = [
    Math.max(0, Math.floor(faceBox.x - faceBox.height * 0.34)),
    Math.floor(faceBox.x - faceBox.height * 0.18),
    Math.floor(faceBox.x + faceBox.width * 0.34),
    Math.floor(faceBox.x + faceBox.width * 0.62),
  ];

  for (const height of heightOptions) {
    for (const aspect of CARD_ASPECT_RATIOS) {
      const portraitWidth = Math.max(24, Math.floor(height / aspect));
      const portraitHeight = height;
      const landscapeWidth = Math.max(24, Math.floor(height * aspect));
      const landscapeHeight = Math.max(24, Math.floor(height / aspect));
      const sizeOptions = [
        { width: portraitWidth, height: portraitHeight },
        { width: landscapeWidth, height: landscapeHeight },
      ];

      for (const { width, height: rectHeight } of sizeOptions) {
        for (const baseX of xOptions) {
          for (const yOffset of [-24, -8, 0, 12, 28]) {
            const candidateX = clamp(baseX, 0, canvasWidth - width - 1);
            const candidateY = clamp(
              cheekY + yOffset,
              0,
              Math.floor(pixels.length / (canvasWidth * 4)) - rectHeight - 1,
            );
            const metrics = evaluateCardCandidate(
              pixels,
              canvasWidth,
              {
                x: candidateX,
                y: candidateY,
                width,
                height: rectHeight,
              },
              imageArea,
              faceBox,
            );

            if (!metrics) {
              continue;
            }

            if (shouldReplaceBestCandidate(metrics, bestMetrics)) {
              bestMetrics = metrics;
            }
          }
        }
      }
    }
  }

  return bestMetrics;
}

function containsPoint(rect: CandidateRect, x: number, y: number): boolean {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

export function analyzeDocumentStructureHeuristics(
  imageData: ImageData,
  face: FaceAnalysis,
  secondaryFace?: FaceAnalysis | null,
): DocumentStructureAnalysis {
  const { width, height } = imageData;
  const imageArea = width * height;
  const faceBox: CandidateRect = {
    x: Math.floor(face.box.x),
    y: Math.floor(face.box.y),
    width: Math.floor(face.box.width),
    height: Math.floor(face.box.height),
  };
  const regions = buildDocumentSearchRegions(face, width, height);

  let bestMetrics: CandidateMetrics | null = null;

  for (const region of regions) {
    const metrics = scanRegionForBestCandidate(
      imageData.data,
      width,
      region,
      imageArea,
      faceBox,
    );

    if (
      metrics &&
      shouldReplaceBestCandidate(metrics, bestMetrics)
    ) {
      bestMetrics = metrics;
    }
  }

  const hasReliableRegionalCandidate =
    bestMetrics !== null &&
    bestMetrics.besideFace &&
    bestMetrics.inHoldingZone &&
    bestMetrics.textBands >= MIN_MODERATE_TEXT_BANDS;

  if (!hasReliableRegionalCandidate) {
    bestMetrics = scanCheekLevelCandidates(
      imageData.data,
      width,
      faceBox,
      imageArea,
      bestMetrics,
    );
  }

  const score = bestMetrics?.score ?? 0;
  const strictPass = bestMetrics ? isStrictDocumentCandidate(bestMetrics) : false;
  const moderatePass = bestMetrics ? isModerateDocumentCandidate(bestMetrics) : false;
  const visualPass = bestMetrics ? isVisualDocumentCandidate(bestMetrics) : false;

  let secondaryFaceSignal = false;
  if (secondaryFace && isPlausibleIdPhotoFace(face, secondaryFace)) {
    secondaryFaceSignal = isSecondaryFaceOnDocumentRegion(
      face,
      secondaryFace,
      width,
      height,
    );
  }

  return {
    score,
    strictPass,
    moderatePass,
    visualPass,
    secondaryFaceSignal,
    bestTextBands: bestMetrics?.textBands ?? 0,
    bestWideLines: bestMetrics?.wideLines ?? 0,
    bestRect: bestMetrics?.rect ?? null,
  };
}


function passesDocumentStructureAnalysis(
  analysis: DocumentStructureAnalysis,
): boolean {
  return analysis.strictPass || analysis.moderatePass || analysis.visualPass;
}

function passesWithSecondaryDocumentFace(
  face: FaceAnalysis,
  secondaryFace: FaceAnalysis | null | undefined,
  canvasWidth: number,
  canvasHeight: number,
): boolean {
  return Boolean(
    secondaryFace &&
      isSecondaryFaceOnDocumentRegion(
        face,
        secondaryFace,
        canvasWidth,
        canvasHeight,
      ),
  );
}

function passesWithPartialOcr(
  text: string,
  analysis: DocumentStructureAnalysis,
): boolean {
  return (
    hasPartialDocumentOcrSignals(text) &&
    (analysis.moderatePass || analysis.visualPass)
  );
}

function buildSuccessResult(analysis: DocumentStructureAnalysis): DocumentInHandResult {
  return { passed: true, score: analysis.score };
}

function buildFailureResult(score: number): DocumentInHandResult {
  return {
    passed: false,
    score,
    message:
      "Debes sostener tu documento de identidad en la mano, visible junto a tu rostro",
  };
}

function shouldRunDocumentOcr(analysis: DocumentStructureAnalysis): boolean {
  if (analysis.strictPass || analysis.moderatePass || analysis.visualPass) {
    return false;
  }

  return (
    analysis.score >= 0.16 ||
    analysis.bestTextBands >= 2 ||
    analysis.bestRect !== null ||
    analysis.secondaryFaceSignal
  );
}

export async function validateDocumentInHand(
  canvas: HTMLCanvasElement,
  face: FaceAnalysis,
  secondaryFace?: FaceAnalysis | null,
): Promise<DocumentInHandResult> {
  if (
    passesWithSecondaryDocumentFace(
      face,
      secondaryFace,
      canvas.width,
      canvas.height,
    )
  ) {
    return { passed: true, score: 0.5 };
  }

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return {
      passed: false,
      score: 0,
      message: "No se pudo verificar el documento en la foto",
    };
  }

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const analysis = analyzeDocumentStructureHeuristics(
    imageData,
    face,
    secondaryFace,
  );

  if (passesDocumentStructureAnalysis(analysis)) {
    return buildSuccessResult(analysis);
  }

  if (
    secondaryFace &&
    isPlausibleIdPhotoFace(face, secondaryFace) &&
    analysis.secondaryFaceSignal
  ) {
    return buildSuccessResult(analysis);
  }

  if (!shouldRunDocumentOcr(analysis)) {
    return buildFailureResult(analysis.score);
  }

  const ocr = await detectDocumentTextInSelfie(canvas, face);

  if (hasStrongDocumentOcrSignals(ocr.text)) {
    return { passed: true, score: 0.55 };
  }

  if (analysis.bestRect) {
    const cropText = await detectDocumentTextInCrop(canvas, analysis.bestRect);

    if (hasStrongDocumentOcrSignals(cropText)) {
      return { passed: true, score: 0.55 };
    }

    if (passesWithPartialOcr(cropText, analysis)) {
      return buildSuccessResult(analysis);
    }
  }

  if (passesWithPartialOcr(ocr.text, analysis)) {
    return buildSuccessResult(analysis);
  }

  if (
    hasPartialDocumentOcrSignals(ocr.text) &&
    analysis.bestTextBands >= 2 &&
    analysis.bestRect
  ) {
    return buildSuccessResult(analysis);
  }

  return buildFailureResult(analysis.score);
}

/** Alias usado en pruebas unitarias de heurísticas. */
export function validateDocumentInHandFromImageData(
  imageData: ImageData,
  face: FaceAnalysis,
  secondaryFace?: FaceAnalysis | null,
): DocumentInHandResult {
  if (
    passesWithSecondaryDocumentFace(
      face,
      secondaryFace,
      imageData.width,
      imageData.height,
    )
  ) {
    return { passed: true, score: 0.5 };
  }

  const analysis = analyzeDocumentStructureHeuristics(
    imageData,
    face,
    secondaryFace,
  );

  if (passesDocumentStructureAnalysis(analysis)) {
    return buildSuccessResult(analysis);
  }

  if (
    secondaryFace &&
    isPlausibleIdPhotoFace(face, secondaryFace) &&
    analysis.secondaryFaceSignal
  ) {
    return buildSuccessResult(analysis);
  }

  return buildFailureResult(analysis.score);
}

export interface DocumentCardMetrics {
  score: number;
  textBands: number;
  wideLines: number;
  borderUniformity: number;
  averageBorder: number;
  faceOverlapRatio: number;
  besideFace: boolean;
  inHoldingZone: boolean;
  lightInterior: boolean;
}

export function evaluateDocumentCardRectForTests(
  imageData: ImageData,
  rect: { x: number; y: number; width: number; height: number },
  face: FaceAnalysis,
): DocumentCardMetrics | null {
  return evaluateCardCandidate(
    imageData.data,
    imageData.width,
    rect,
    imageData.width * imageData.height,
    {
      x: Math.floor(face.box.x),
      y: Math.floor(face.box.y),
      width: Math.floor(face.box.width),
      height: Math.floor(face.box.height),
    },
  );
}
