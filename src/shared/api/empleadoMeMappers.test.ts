import { describe, expect, it } from "vitest";
import { parseApiDecimalAmount } from "./empleadoMeMappers";
import { isSolicitudCancellable } from "./solicitudAdelanto";

describe("parseApiDecimalAmount", () => {
  it("parsea montos decimales del API", () => {
    expect(parseApiDecimalAmount("450000.00")).toBe(450000);
  });

  it("devuelve undefined para valores inválidos", () => {
    expect(parseApiDecimalAmount("")).toBeUndefined();
    expect(parseApiDecimalAmount("abc")).toBeUndefined();
  });
});

describe("isSolicitudCancellable", () => {
  it("permite cancelar solicitudes pendientes", () => {
    expect(isSolicitudCancellable("solicitado")).toBe(true);
    expect(isSolicitudCancellable("en_revision")).toBe(true);
  });

  it("no permite cancelar solicitudes finalizadas", () => {
    expect(isSolicitudCancellable("aprobado")).toBe(false);
    expect(isSolicitudCancellable("pagado")).toBe(false);
    expect(isSolicitudCancellable("rechazado")).toBe(false);
  });
});
