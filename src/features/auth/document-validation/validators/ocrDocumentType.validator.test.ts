import { describe, expect, it } from "vitest";
import { validateDocumentByType } from "./ocrDocumentType.validator";

describe("validateDocumentByType", () => {
  it("valida CC con al menos dos coincidencias OCR", () => {
    const result = validateDocumentByType(
      "CC",
      "REPUBLICA DE COLOMBIA CEDULA DE CIUDADANIA IDENTIFICACION PERSONAL 1234567890",
      "1234567890",
    );

    expect(result.isValid).toBe(true);
    expect(result.matches.length).toBeGreaterThanOrEqual(2);
    expect(result.errors).toHaveLength(0);
  });

  it("rechaza CC cuando faltan coincidencias", () => {
    const result = validateDocumentByType("CC", "DOCUMENTO GENERICO 12345");

    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toBe(
      "El documento cargado no parece ser una Cédula de Ciudadanía.",
    );
  });

  it("valida CE sin depender exclusivamente de REPUBLICA DE COLOMBIA", () => {
    const result = validateDocumentByType(
      "CE",
      "CEDULA DE EXTRANJERIA MIGRACION COLOMBIA EXTRANJERIA 987654321",
      "987654321",
    );

    expect(result.isValid).toBe(true);
    expect(result.matches).toEqual(
      expect.arrayContaining([
        "CEDULA DE EXTRANJERIA",
        "MIGRACION COLOMBIA",
        "EXTRANJERIA",
      ]),
    );
  });

  it("valida PASSPORT con palabras clave y número alfanumérico", () => {
    const result = validateDocumentByType(
      "PASSPORT",
      "PASAPORTE PASSPORT P<COLOMBIA<<JUAN<<1234567A",
      "AB1234567",
    );

    expect(result.isValid).toBe(true);
    expect(result.matches.length).toBeGreaterThanOrEqual(2);
  });

  it("valida PPT con 15 dígitos", () => {
    const result = validateDocumentByType(
      "PPT",
      "PERMISO POR PROTECCION TEMPORAL PPT MIGRACION COLOMBIA 123456789012345",
      "123456789012345",
    );

    expect(result.isValid).toBe(true);
  });

  it("detecta incoherencia entre tipo seleccionado y OCR", () => {
    const result = validateDocumentByType(
      "CC",
      "PASAPORTE PASSPORT P<COLOMBIA<<JUAN<<1234567A",
    );

    expect(result.isValid).toBe(false);
    expect(result.detectedType).toBe("PASSPORT");
    expect(result.errors).toContain(
      "El documento cargado no coincide con el tipo de documento seleccionado.",
    );
  });

  it("retorna estructura completa de validación", () => {
    const result = validateDocumentByType("CE", "TEXTO SIN COINCIDENCIAS");

    expect(result).toMatchObject({
      isValid: expect.any(Boolean),
      confidence: expect.any(Number),
      matches: expect.any(Array),
      errors: expect.any(Array),
    });
  });
});
