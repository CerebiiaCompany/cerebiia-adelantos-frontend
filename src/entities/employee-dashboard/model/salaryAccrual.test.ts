import { describe, expect, it } from "vitest";
import {
  calculateCumulativeAccumulatedIncome,
  calculateDailySalaryIncome,
  calculateIncomeForCalendarMonth,
} from "./salaryAccrual";

describe("salaryAccrual", () => {
  const salary = 1_500_000;
  const hireDate = "2026-01-15";

  it("acumula ingresos desde la fecha de ingreso sin reiniciar cada mes", () => {
    const reference = new Date("2026-06-13T10:00:00");

    // Ene (17d) + Feb + Mar + Abr + May + Jun (13d)
    expect(calculateCumulativeAccumulatedIncome(salary, hireDate, reference)).toBe(
      7_472_581,
    );
  });

  it("solo cuenta el mes de ingreso cuando la referencia es el mismo mes", () => {
    const reference = new Date("2026-01-20T10:00:00");

    expect(calculateCumulativeAccumulatedIncome(salary, hireDate, reference)).toBe(
      290_323,
    );
  });

  it("calcula el ingreso diario del mes actual", () => {
    const reference = new Date("2026-06-13T10:00:00");

    expect(calculateDailySalaryIncome(salary, reference)).toBe(50_000);
  });

  it("calcula ingresos por mes para el gráfico", () => {
    const reference = new Date("2026-06-13T10:00:00");
    const may = new Date("2026-05-01T00:00:00");
    const january = new Date("2026-01-01T00:00:00");

    expect(
      calculateIncomeForCalendarMonth(salary, hireDate, may, reference),
    ).toBe(1_500_000);
    expect(
      calculateIncomeForCalendarMonth(salary, hireDate, january, reference),
    ).toBe(822_581);
    expect(
      calculateIncomeForCalendarMonth(salary, hireDate, reference, reference),
    ).toBe(650_000);
  });

  it("retorna cero cuando el salario es cero", () => {
    const reference = new Date("2026-06-13T10:00:00");

    expect(calculateCumulativeAccumulatedIncome(0, hireDate, reference)).toBe(0);
    expect(calculateDailySalaryIncome(0, reference)).toBe(0);
  });

  it("retorna cero si no hay fecha de ingreso", () => {
    const reference = new Date("2026-06-13T10:00:00");

    expect(calculateCumulativeAccumulatedIncome(salary, undefined, reference)).toBe(
      0,
    );
    expect(
      calculateIncomeForCalendarMonth(salary, undefined, reference, reference),
    ).toBe(0);
  });
});
