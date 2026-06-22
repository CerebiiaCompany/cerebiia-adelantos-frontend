import { describe, expect, it } from "vitest";
import { mapTipoDocumentoToApi } from "./empleadoMappers";

describe("empleadoMappers", () => {
  it("mapea tipos de documento del formulario al backend", () => {
    expect(mapTipoDocumentoToApi("CC")).toBe("cc");
    expect(mapTipoDocumentoToApi("PASSPORT")).toBe("pas");
    expect(mapTipoDocumentoToApi("CE")).toBe("ce");
  });
});
