import { describe, expect, it } from "vitest";
import { DEMO_ADVANCE_HISTORY } from "@/shared/config/advanceHistory";
import {
  DEFAULT_ADVANCE_HISTORY_FILTERS,
  filterAdvanceHistory,
  hasActiveAdvanceHistoryFilters,
} from "./advanceHistoryFilters";

describe("filterAdvanceHistory", () => {
  it("devuelve todos los registros sin filtros activos", () => {
    expect(
      filterAdvanceHistory(DEMO_ADVANCE_HISTORY, DEFAULT_ADVANCE_HISTORY_FILTERS),
    ).toHaveLength(DEMO_ADVANCE_HISTORY.length);
  });

  it("filtra por estado", () => {
    const filtered = filterAdvanceHistory(DEMO_ADVANCE_HISTORY, {
      ...DEFAULT_ADVANCE_HISTORY_FILTERS,
      status: "aprobado",
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((record) => record.status === "aprobado")).toBe(true);
  });

  it("filtra por rango de fechas", () => {
    const filtered = filterAdvanceHistory(DEMO_ADVANCE_HISTORY, {
      ...DEFAULT_ADVANCE_HISTORY_FILTERS,
      dateFrom: "2026-05-01",
      dateTo: "2026-05-31",
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(
      filtered.every(
        (record) =>
          record.requestedAt >= new Date(2026, 4, 1) &&
          record.requestedAt <= new Date(2026, 4, 31, 23, 59, 59, 999),
      ),
    ).toBe(true);
  });

  it("combina estado y fechas", () => {
    const filtered = filterAdvanceHistory(DEMO_ADVANCE_HISTORY, {
      status: "no_aprobado",
      dateFrom: "2026-04-01",
      dateTo: "2026-04-30",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe("adv-002");
  });
});

describe("hasActiveAdvanceHistoryFilters", () => {
  it("detecta filtros activos", () => {
    expect(
      hasActiveAdvanceHistoryFilters(DEFAULT_ADVANCE_HISTORY_FILTERS),
    ).toBe(false);
    expect(
      hasActiveAdvanceHistoryFilters({
        ...DEFAULT_ADVANCE_HISTORY_FILTERS,
        status: "en_curso",
      }),
    ).toBe(true);
  });
});
