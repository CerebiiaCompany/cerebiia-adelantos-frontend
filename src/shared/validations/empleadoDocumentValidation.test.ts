import { describe, expect, it } from "vitest";
import {
  isValidEmpleadoDocumentNumber,
  normalizeEmpleadoDocumentNumber,
} from "./empleadoDocumentValidation";

describe("empleadoDocumentValidation", () => {
  it("valida documentos con formatos reales de nómina", () => {
    expect(isValidEmpleadoDocumentNumber("CC", "1014234567")).toBe(true);
    expect(isValidEmpleadoDocumentNumber("PASSPORT", "98765432")).toBe(true);
    expect(isValidEmpleadoDocumentNumber("CE", "205412789")).toBe(true);
    expect(isValidEmpleadoDocumentNumber("PPT", "4561230")).toBe(true);
  });

  it("rechaza pasaporte alfanumérico y PPT con ceros de relleno PILA", () => {
    expect(isValidEmpleadoDocumentNumber("PASSPORT", "AB987654")).toBe(false);
    expect(isValidEmpleadoDocumentNumber("PPT", "000000456123000")).toBe(
      false,
    );
  });

  it("normaliza PPT quitando ceros a la izquierda", () => {
    expect(normalizeEmpleadoDocumentNumber("PPT", "0000004561230")).toBe(
      "4561230",
    );
  });
});
