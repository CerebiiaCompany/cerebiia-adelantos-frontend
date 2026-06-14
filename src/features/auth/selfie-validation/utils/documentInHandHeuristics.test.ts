import { describe, expect, it } from "vitest";
import type { FaceAnalysis } from "./faceEngine";
import {
  classifySelfieFaces,
  evaluateDocumentCardRectForTests,
  validateDocumentInHandFromImageData,
} from "./documentInHandHeuristics";

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

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function fillRect(
  pixels: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  rectWidth: number,
  rectHeight: number,
  color: [number, number, number],
): void {
  for (let row = y; row < y + rectHeight; row += 1) {
    for (let col = x; col < x + rectWidth; col += 1) {
      const index = (row * width + col) * 4;
      pixels[index] = color[0];
      pixels[index + 1] = color[1];
      pixels[index + 2] = color[2];
      pixels[index + 3] = 255;
    }
  }
}

function createTestImageData(
  width: number,
  height: number,
  draw: (pixels: Uint8ClampedArray, width: number) => void,
): ImageData {
  const pixels = new Uint8ClampedArray(width * height * 4);
  fillRect(pixels, width, 0, 0, width, height, hexToRgb("#ddd4c8"));
  draw(pixels, width);
  return { data: pixels, width, height } as ImageData;
}

describe("classifySelfieFaces", () => {
  it("acepta un rostro principal y uno secundario pequeño tipo foto de cédula", () => {
    const result = classifySelfieFaces([
      mockFace({ x: 120, y: 40, width: 240, height: 300 }),
      mockFace({ x: 150, y: 430, width: 70, height: 90 }),
    ]);

    expect(result.error).toBeUndefined();
    expect(result.secondary).not.toBeNull();
  });

  it("rechaza dos rostros de tamaño similar", () => {
    const result = classifySelfieFaces([
      mockFace({ x: 80, y: 60, width: 220, height: 280 }),
      mockFace({ x: 260, y: 70, width: 210, height: 270 }),
    ]);

    expect(result.error).toContain("más de un rostro");
    expect(result.secondary).toBeNull();
  });
});

describe("validateDocumentInHandFromImageData", { timeout: 15_000 }, () => {
  it("rechaza una selfie donde solo se ve el rostro", () => {
    const imageData = createTestImageData(480, 640, (pixels, width) => {
      fillRect(pixels, width, 90, 40, 300, 520, hexToRgb("#d4a574"));
    });

    const face = mockFace({ x: 90, y: 40, width: 300, height: 520 });
    const result = validateDocumentInHandFromImageData(imageData, face);

    expect(result.passed).toBe(false);
    expect(result.message).toContain("documento");
  });

  it("rechaza rostro con camiseta y cuello pero sin documento", () => {
    const imageData = createTestImageData(480, 640, (pixels, width) => {
      fillRect(pixels, width, 0, 0, width, 640, hexToRgb("#6aab9e"));
      fillRect(pixels, width, 150, 70, 180, 230, hexToRgb("#d4a574"));
      fillRect(pixels, width, 110, 300, 260, 320, hexToRgb("#f5f5f5"));
      fillRect(pixels, width, 120, 300, 240, 10, hexToRgb("#1a1a1a"));
    });

    const face = mockFace({ x: 150, y: 70, width: 180, height: 230 });
    const result = validateDocumentInHandFromImageData(imageData, face);

    expect(result.passed).toBe(false);
    expect(result.message).toContain("documento");
  });

  it("rechaza selfie con fondo blanco y cuello de camiseta sin documento", () => {
    const imageData = createTestImageData(480, 640, (pixels, width) => {
      fillRect(pixels, width, 0, 0, width, 640, hexToRgb("#ffffff"));
      fillRect(pixels, width, 150, 60, 180, 250, hexToRgb("#d4a574"));
      fillRect(pixels, width, 120, 310, 240, 300, hexToRgb("#f8f8f8"));
      fillRect(pixels, width, 130, 310, 220, 12, hexToRgb("#222222"));
    });

    const face = mockFace({ x: 150, y: 60, width: 180, height: 250 });
    const result = validateDocumentInHandFromImageData(imageData, face);

    expect(result.passed).toBe(false);
    expect(result.message).toContain("documento");
  });

  it("rechaza selfie con camiseta rosa y cuello oscuro sin documento", () => {
    const imageData = createTestImageData(480, 640, (pixels, width) => {
      fillRect(pixels, width, 0, 0, width, 640, hexToRgb("#f5c4cf"));
      fillRect(pixels, width, 140, 55, 200, 260, hexToRgb("#d4a574"));
      fillRect(pixels, width, 100, 315, 280, 320, hexToRgb("#f5c4cf"));
      fillRect(pixels, width, 110, 315, 260, 40, hexToRgb("#f8d4dc"));
      fillRect(pixels, width, 120, 355, 240, 18, hexToRgb("#5c2438"));
    });

    const face = mockFace({ x: 140, y: 55, width: 200, height: 260 });
    const result = validateDocumentInHandFromImageData(imageData, face);

    expect(result.passed).toBe(false);
    expect(result.message).toContain("documento");
  });

  it("acepta documento sostenido al lado del rostro", () => {
    const imageData = createTestImageData(480, 640, (pixels, width) => {
      fillRect(pixels, width, 170, 70, 220, 290, hexToRgb("#d4a574"));
      drawDocumentCard(pixels, width, 24, 180, 130, 190);
    });

    const face = mockFace({ x: 170, y: 70, width: 220, height: 290 });
    const metrics = evaluateDocumentCardRectForTests(
      imageData,
      { x: 24, y: 180, width: 130, height: 190 },
      face,
    );

    expect(metrics, JSON.stringify(metrics)).not.toBeNull();
    expect(metrics?.besideFace).toBe(true);
    expect(metrics?.inHoldingZone).toBe(true);
    expect(metrics?.lightInterior).toBe(true);

    const result = validateDocumentInHandFromImageData(imageData, face);

    expect(result.passed).toBe(true);
  });

  it("acepta foto de cédula detectada como segundo rostro al lado de la mejilla", () => {
    const imageData = createTestImageData(480, 640, (pixels, width) => {
      fillRect(pixels, width, 170, 70, 220, 290, hexToRgb("#d4a574"));
      drawDocumentCard(pixels, width, 24, 180, 130, 190);
    });

    const face = mockFace({ x: 170, y: 70, width: 220, height: 290 });
    const secondary = mockFace({ x: 34, y: 194, width: 42, height: 58 });
    const result = validateDocumentInHandFromImageData(imageData, face, secondary);

    expect(result.passed).toBe(true);
  });

  it("acepta documento pequeño junto a la mejilla en selfie grande", () => {
    const imageData = createTestImageData(720, 1280, (pixels, width) => {
      fillRect(pixels, width, 250, 180, 220, 420, hexToRgb("#d4a574"));
      drawDocumentCard(pixels, width, 280, 520, 88, 128);
    });

    const face = mockFace({ x: 250, y: 180, width: 220, height: 420 });
    const result = validateDocumentInHandFromImageData(imageData, face);

    expect(result.passed).toBe(true);
  });
});

function drawDocumentCard(
  pixels: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
  cardWidth: number,
  cardHeight: number,
): void {
  fillRect(pixels, width, x, y, cardWidth, cardHeight, hexToRgb("#f7f3ea"));

  for (let line = 0; line < 8; line += 1) {
    fillRect(
      pixels,
      width,
      x + 10,
      y + 20 + line * 14,
      cardWidth - 20,
      4,
      hexToRgb("#111111"),
    );
  }

  fillRect(pixels, width, x + 10, y + 14, 42, 58, hexToRgb("#c8b59a"));
  fillRect(pixels, width, x, y, cardWidth, 3, hexToRgb("#2f2f2f"));
  fillRect(
    pixels,
    width,
    x,
    y + cardHeight - 3,
    cardWidth,
    3,
    hexToRgb("#2f2f2f"),
  );
  fillRect(pixels, width, x, y, 3, cardHeight, hexToRgb("#2f2f2f"));
  fillRect(
    pixels,
    width,
    x + cardWidth - 3,
    y,
    3,
    cardHeight,
    hexToRgb("#2f2f2f"),
  );
}
