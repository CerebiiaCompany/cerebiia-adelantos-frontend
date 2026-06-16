import { describe, expect, it } from "vitest";
import { amountInWordsSpanish } from "./amountInWords";

describe("amountInWordsSpanish", () => {
  it("convierte montos comunes de adelanto", () => {
    expect(amountInWordsSpanish(500_000)).toContain("quinientos mil");
    expect(amountInWordsSpanish(1_000_000)).toContain("un millón");
    expect(amountInWordsSpanish(1)).toBe("uno peso colombiano");
  });

  it("maneja cero", () => {
    expect(amountInWordsSpanish(0)).toBe("cero pesos colombianos");
  });
});
