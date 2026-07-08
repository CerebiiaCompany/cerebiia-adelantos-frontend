import { describe, expect, it } from "vitest";
import { normalizeVerificarPreRegistroResponse } from "./verificarPreRegistroMappers";

describe("normalizeVerificarPreRegistroResponse", () => {
  it("mapea pre-registro existente", () => {
    expect(
      normalizeVerificarPreRegistroResponse({
        existe: true,
        nombre: "Juan Pérez",
        ya_activo: false,
      }),
    ).toEqual({
      existe: true,
      nombre: "Juan Pérez",
      ya_activo: false,
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
    });
  });
});
