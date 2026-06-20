import { describe, expect, it } from "vitest";
import { buildAdvanceQuickAmounts } from "./calculations";

describe("buildAdvanceQuickAmounts", () => {
  it("calcula 20%, 30%, 50% y 100% del cupo disponible", () => {
    expect(buildAdvanceQuickAmounts(510_000)).toEqual([
      100_000,
      150_000,
      250_000,
      510_000,
    ]);
  });

  it("retorna arreglo vacío si no hay cupo", () => {
    expect(buildAdvanceQuickAmounts(0)).toEqual([]);
  });
});
