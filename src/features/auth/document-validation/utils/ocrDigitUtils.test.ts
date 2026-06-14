import { describe, expect, it } from "vitest";
import {
  extractDigits,
  isDocumentNumberInOcrText,
  normalizeOcrDigits,
} from "./ocrDigitUtils";

describe("ocrDigitUtils", () => {
  it("extrae dígitos de cédulas con puntos", () => {
    expect(normalizeOcrDigits("1.005.026.054")).toBe("1005026054");
    expect(normalizeOcrDigits("1 005 026 054")).toBe("1005026054");
  });

  it("encuentra el número en texto del reverso con código PDF417", () => {
    const backText =
      "P-2500150-01224280-F-1005026054-20210324 REGISTRADURIA NACIONAL";

    expect(isDocumentNumberInOcrText(backText, "1005026054")).toBe(true);
  });

  it("tolera confusiones OCR comunes en secuencias numéricas", () => {
    expect(isDocumentNumberInOcrText("1.OO5.O26.O54", "1005026054")).toBe(true);
  });

  it("no altera palabras sin secuencias numéricas largas", () => {
    expect(extractDigits("REPUBLICA DE COLOMBIA")).toBe("");
  });
});
