import type { FaceAnalysis } from "./faceEngine";

export interface DocumentSearchRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function buildDocumentSearchRegions(
  face: FaceAnalysis,
  width: number,
  height: number,
): DocumentSearchRegion[] {
  const faceBox = face.box;
  const faceBottom = faceBox.y + faceBox.height;
  const margin = Math.round(Math.min(width, height) * 0.03);
  const regions: DocumentSearchRegion[] = [];

  const cheekBandY = clamp(
    Math.floor(faceBox.y - faceBox.height * 0.05),
    0,
    height - 1,
  );
  const cheekBandBottom = clamp(
    Math.floor(faceBottom + faceBox.height * 0.38),
    cheekBandY + 24,
    height - margin,
  );
  const cheekBandHeight = cheekBandBottom - cheekBandY;

  const leftRegionWidth = Math.floor(faceBox.x + faceBox.width * 0.56 - margin);
  if (leftRegionWidth > 24) {
    regions.push({
      x: margin,
      y: cheekBandY,
      width: leftRegionWidth,
      height: cheekBandHeight,
    });
  }

  const rightRegionX = Math.floor(faceBox.x + faceBox.width * 0.44);
  const rightRegionWidth = width - rightRegionX - margin;
  if (rightRegionWidth > 24) {
    regions.push({
      x: rightRegionX,
      y: cheekBandY,
      width: rightRegionWidth,
      height: cheekBandHeight,
    });
  }

  const belowY = clamp(
    Math.floor(faceBottom - faceBox.height * 0.06),
    0,
    height - 1,
  );
  const belowHeight = height - belowY;

  if (belowHeight > height * 0.12) {
    regions.push({
      x: margin,
      y: belowY,
      width: width - margin * 2,
      height: belowHeight - margin,
    });
  }

  return regions.filter((region) => region.width > 20 && region.height > 20);
}

export function rankDocumentRegionsForOcr(
  regions: DocumentSearchRegion[],
  face: FaceAnalysis,
): DocumentSearchRegion[] {
  const faceCenterY = face.box.y + face.box.height / 2;

  return [...regions].sort((left, right) => {
    const leftScore = scoreRegionForOcr(left, faceCenterY, face.box.height);
    const rightScore = scoreRegionForOcr(right, faceCenterY, face.box.height);
    return rightScore - leftScore;
  });
}

function scoreRegionForOcr(
  region: DocumentSearchRegion,
  faceCenterY: number,
  faceHeight: number,
): number {
  const regionCenterY = region.y + region.height / 2;
  const verticalAlignment =
    1 -
    Math.min(1, Math.abs(regionCenterY - faceCenterY) / (faceHeight * 0.55));
  const area = region.width * region.height;

  return area * (0.25 + verticalAlignment * 0.75);
}
