import { describe, expect, it } from "vitest";
import {
  joinNombreCompleto,
  normalizeVerificarPreRegistroResponse,
  splitNombreCompleto,
} from "./verificarPreRegistroMappers";

describe("normalizeVerificarPreRegistroResponse", () => {
  it("mapea pre-registro existente con datos de confirmación", () => {
    expect(
      normalizeVerificarPreRegistroResponse({
        existe: true,
        nombre: "Juan Pérez",
        ya_activo: false,
        documento: "12345678",
        tipo_documento: "cc",
        celular: "3001234567",
        banco_id: "banco-1",
        banco_nombre: "Bancolombia",
        tipo_cuenta: "ahorros",
        numero_cuenta: "123456789",
      }),
    ).toEqual({
      existe: true,
      nombre: "Juan Pérez",
      ya_activo: false,
      documento: "12345678",
      tipo_documento: "cc",
      celular: "3001234567",
      banco_id: "banco-1",
      banco_nombre: "Bancolombia",
      tipo_cuenta: "ahorros",
      numero_cuenta: "123456789",
    });
  });

  it("detecta documento ya activo", () => {
    expect(
      normalizeVerificarPreRegistroResponse({
        existe: false,
        nombre: "",
        ya_activo: true,
      }),
    ).toEqual({
      existe: false,
      nombre: "",
      ya_activo: true,
      documento: "",
      tipo_documento: "",
      celular: "",
      banco_id: "",
      banco_nombre: "",
      tipo_cuenta: "",
      numero_cuenta: "",
    });
  });

  it("normaliza respuestas legacy sin ya_activo", () => {
    expect(
      normalizeVerificarPreRegistroResponse({
        existe: false,
        nombre: "",
      }),
    ).toEqual({
      existe: false,
      nombre: "",
      ya_activo: false,
      documento: "",
      tipo_documento: "",
      celular: "",
      banco_id: "",
      banco_nombre: "",
      tipo_cuenta: "",
      numero_cuenta: "",
    });
  });
});

describe("splitNombreCompleto / joinNombreCompleto", () => {
  it("parte nombres y apellidos", () => {
    expect(splitNombreCompleto("Juan Pérez")).toEqual({
      nombres: "Juan",
      apellidos: "Pérez",
    });
    expect(splitNombreCompleto("Hans Dieter Schmidt")).toEqual({
      nombres: "Hans Dieter",
      apellidos: "Schmidt",
    });
  });

  it("une nombres y apellidos", () => {
    expect(joinNombreCompleto("Juan", "Pérez")).toBe("Juan Pérez");
  });
});
