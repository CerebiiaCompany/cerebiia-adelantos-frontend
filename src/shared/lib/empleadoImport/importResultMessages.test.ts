import { describe, expect, it } from "vitest";
import {
  buildApiImportRowError,
  formatDuplicateImportMessage,
  groupImportErrorsByKind,
  isDuplicateDocumentError,
} from "./importResultMessages";

describe("importResultMessages", () => {
  it("detecta errores de documento duplicado del backend", () => {
    expect(
      isDuplicateDocumentError(
        "El documento ya existe para esta empresa: 1014234567",
      ),
    ).toBe(true);
  });

  it("formatea duplicados con nombre y documento", () => {
    expect(
      formatDuplicateImportMessage(
        "Juan Carlos Pérez",
        "CC",
        "1014234567",
      ),
    ).toBe("Juan Carlos Pérez · CC 1014234567 ya existe en tus empleados.");
  });

  it("agrupa errores por tipo y ordena por fila", () => {
    const grouped = groupImportErrorsByKind([
      {
        rowNumber: 4,
        kind: "duplicate",
        nombre: "Carlos Eduardo Mendoza",
        documento: "205412789",
        tipoDocumento: "CE",
        message:
          "Carlos Eduardo Mendoza · CE 205412789 ya existe en tus empleados.",
      },
      {
        rowNumber: 5,
        kind: "validation",
        nombre: "Ana María Gómez",
        message: "Número de documento: Ingresa un número de documento válido",
      },
      {
        rowNumber: 2,
        kind: "duplicate",
        nombre: "Juan Carlos Pérez",
        documento: "1014234567",
        tipoDocumento: "CC",
        message:
          "Juan Carlos Pérez · CC 1014234567 ya existe en tus empleados.",
      },
    ]);

    expect(grouped.duplicate.map((error) => error.rowNumber)).toEqual([2, 4]);
    expect(grouped.validation).toHaveLength(1);
  });

  it("construye error de API para documento duplicado", () => {
    const error = buildApiImportRowError(
      2,
      {
        tipo_documento: "CC",
        documento: "1014234567",
        nombre: "Juan Carlos Pérez",
        correo: "juan@empresa.com",
        celular: "3101234567",
        salario: "2500000.00",
        tipo_contrato: "indefinido",
        fecha_ingreso: "2025-03-01",
        banco: "Bancolombia",
        tipo_cuenta: "ahorros",
        numero_cuenta: "123",
      },
      "El documento ya existe para esta empresa: 1014234567",
    );

    expect(error.kind).toBe("duplicate");
    expect(error.message).toBe(
      "Juan Carlos Pérez · CC 1014234567 ya existe en tus empleados.",
    );
  });
});
