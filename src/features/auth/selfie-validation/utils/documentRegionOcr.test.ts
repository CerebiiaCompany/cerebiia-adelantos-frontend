import { describe, expect, it } from "vitest";
import { hasDocumentOcrSignals, hasPartialDocumentOcrSignals } from "./documentRegionOcr";
import {
  buildDocumentSearchRegions,
  rankDocumentRegionsForOcr,
} from "./documentSearchRegions";
import type { FaceAnalysis } from "./faceEngine";

function mockFace(box: {
  x: number;
  y: number;
  width: number;
  height: number;
}): FaceAnalysis {
  return {
    box,
    score: 0.92,
    landmarks: { positions: [] } as FaceAnalysis["landmarks"],
  };
}

describe("hasDocumentOcrSignals", () => {
  it("detecta texto suficiente de un documento", () => {
    expect(
      hasDocumentOcrSignals(
        "REPUBLICA DE COLOMBIA CEDULA DE CIUDADANIA 1234567890",
      ),
    ).toBe(true);
  });

  it("detecta cédula con palabra clave y números parciales", () => {
    expect(hasDocumentOcrSignals("COLOMBIA 1020304050")).toBe(true);
  });

  it("rechaza bloques alfanuméricos sin palabras clave de documento", () => {
    expect(hasDocumentOcrSignals("AB102030405060708090")).toBe(false);
  });

  it("rechaza texto largo sin palabras clave de cédula", () => {
    expect(
      hasDocumentOcrSignals("ESTE ES UN TEXTO LARGO PERO NO ES DOCUMENTO"),
    ).toBe(false);
  });

  it("rechaza texto vacío o muy corto sin palabras clave", () => {
    expect(hasDocumentOcrSignals("")).toBe(false);
    expect(hasDocumentOcrSignals("hola mundo")).toBe(false);
  });

  it("rechaza ruido típico de camiseta o fondo liso", () => {
    expect(hasDocumentOcrSignals("ee ee")).toBe(false);
  });

  it("detecta señales parciales con palabra clave", () => {
    expect(hasPartialDocumentOcrSignals("COLOMBIA")).toBe(true);
  });

  it("detecta señales parciales con números de documento", () => {
    expect(hasPartialDocumentOcrSignals("1020304050")).toBe(true);
  });
});

describe("buildDocumentSearchRegions", () => {
  it("prioriza zonas laterales al rostro para selfies con documento al lado", () => {
    const face = mockFace({ x: 180, y: 80, width: 220, height: 280 });
    const regions = rankDocumentRegionsForOcr(
      buildDocumentSearchRegions(face, 480, 640),
      face,
    );

    expect(regions.length).toBeGreaterThanOrEqual(2);
    expect(regions[0].y).toBeLessThan(face.box.y + face.box.height * 0.2);
  });
});
