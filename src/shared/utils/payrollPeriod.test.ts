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
});

describe("buildAdvanceReceiptFolio", () => {
  it("genera un folio con prefijo ADV", () => {
    const folio = buildAdvanceReceiptFolio(new Date("2026-06-10T14:30:00"));
    expect(folio).toMatch(/^ADV-\d{8}-\d+$/);
  });
});
