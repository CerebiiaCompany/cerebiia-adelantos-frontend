import { describe, expect, it } from "vitest";
import {
  buildAdvanceReceiptFolio,
  formatAdvanceRequestDate,
  getPayrollPeriodLabel,
} from "./payrollPeriod";

describe("getPayrollPeriodLabel", () => {
  it("identifica la primera quincena", () => {
    const label = getPayrollPeriodLabel(new Date("2026-06-10T12:00:00"));
    expect(label).toContain("junio 2026");
    expect(label).toContain("1.ª quincena");
  });

  it("identifica la segunda quincena", () => {
    const label = getPayrollPeriodLabel(new Date("2026-05-22T12:00:00"));
    expect(label).toContain("mayo 2026");
    expect(label).toContain("2.ª quincena");
  });
});

describe("formatAdvanceRequestDate", () => {
  it("formatea la fecha en español colombiano", () => {
    const formatted = formatAdvanceRequestDate(
      new Date("2026-06-10T14:30:00"),
    );
    expect(formatted).toMatch(/2026/);
    expect(formatted.toLowerCase()).toContain("jun");
  });

  it("acepta strings ISO de fecha", () => {
    const formatted = formatAdvanceRequestDate("2026-06-10T14:30:00");
    expect(formatted).toMatch(/2026/);
    expect(formatted.toLowerCase()).toContain("jun");
  });

  it("retorna raya para valores indefinidos o nulos sin lanzar excepción", () => {
    expect(formatAdvanceRequestDate(undefined)).toBe("—");
    expect(formatAdvanceRequestDate(null)).toBe("—");
    expect(formatAdvanceRequestDate("invalid-date")).toBe("—");
  });
});

describe("buildAdvanceReceiptFolio", () => {
  it("genera un folio con prefijo ADV", () => {
    const folio = buildAdvanceReceiptFolio(new Date("2026-06-10T14:30:00"));
    expect(folio).toMatch(/^ADV-\d{8}-\d+$/);
  });

  it("no lanza error con fecha undefined", () => {
    const folio = buildAdvanceReceiptFolio(undefined);
    expect(folio).toMatch(/^ADV-\d{8}-\d+$/);
  });
});

