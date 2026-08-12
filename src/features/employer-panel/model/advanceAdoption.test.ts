import { describe, expect, it } from "vitest";
import { computeAdvanceAdoptionStats } from "./advanceAdoption";

describe("computeAdvanceAdoptionStats", () => {
  it("calcula porcentaje de empleados con adelanto sobre la nómina", () => {
    const stats = computeAdvanceAdoptionStats(10, ["a", "b", "c", "a"]);
    expect(stats).toEqual({
      totalNomina: 10,
      conAdelanto: 3,
      sinAdelanto: 7,
      porcentaje: 30,
    });
  });

  it("no supera el total de nómina", () => {
    const stats = computeAdvanceAdoptionStats(2, ["a", "b", "c"]);
    expect(stats.conAdelanto).toBe(2);
    expect(stats.porcentaje).toBe(100);
  });

  it("devuelve 0% si no hay empleados en nómina", () => {
    const stats = computeAdvanceAdoptionStats(0, ["a"]);
    expect(stats.porcentaje).toBe(0);
    expect(stats.totalNomina).toBe(0);
  });
});
