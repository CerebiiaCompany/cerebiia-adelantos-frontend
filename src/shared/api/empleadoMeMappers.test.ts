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
  it("nunca permite cancelar: el backend no expone el endpoint", () => {
    expect(isSolicitudCancellable("solicitado")).toBe(false);
    expect(isSolicitudCancellable("en_revision")).toBe(false);
    expect(isSolicitudCancellable("aprobado")).toBe(false);
    expect(isSolicitudCancellable("pagado")).toBe(false);
    expect(isSolicitudCancellable("rechazado")).toBe(false);
  });
});
