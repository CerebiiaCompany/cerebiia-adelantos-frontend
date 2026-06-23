import { describe, expect, it } from "vitest";
import {
  ADVANCE_WINDOW_LAST_DAY,
  getAdvanceAvailabilityInfo,
  getDaysUntilPayment,
  getNextAdvanceAvailableDate,
  getNextPaymentDate,
  getPayrollDayType,
  isAdvanceAvailableDay,
  isAdvanceBlockedDay,
  isPaymentDay,
  isTodayCalendarDay,
  resolvePaymentDayInMonth,
} from "./payrollCalendar";

describe("payrollCalendar", () => {
  it("identifica días de pago mensuales (1 y 30)", () => {
    expect(isPaymentDay(new Date(2026, 3, 1))).toBe(true);
    expect(isPaymentDay(new Date(2026, 3, 30))).toBe(true);
    expect(isPaymentDay(new Date(2026, 3, 15))).toBe(false);
    expect(isPaymentDay(new Date(2026, 3, 10))).toBe(false);
  });

  it("ajusta el pago del día 30 en meses cortos", () => {
    const febPayment = resolvePaymentDayInMonth(2026, 1, 30);
    expect(febPayment.getDate()).toBe(28);
    expect(isPaymentDay(febPayment)).toBe(true);
  });

  it("permite adelantos del día 1 al 20", () => {
    expect(isAdvanceAvailableDay(new Date(2026, 5, 1))).toBe(true);
    expect(isAdvanceAvailableDay(new Date(2026, 5, 10))).toBe(true);
    expect(isAdvanceAvailableDay(new Date(2026, 5, 20))).toBe(true);
    expect(isAdvanceAvailableDay(new Date(2026, 5, 21))).toBe(false);
    expect(isAdvanceAvailableDay(new Date(2026, 5, 30))).toBe(false);
  });

  it("clasifica tipo de día en el calendario", () => {
    expect(getPayrollDayType(new Date(2026, 5, 30))).toBe("payment");
    expect(getPayrollDayType(new Date(2026, 5, 21))).toBe("blocked");
    expect(getPayrollDayType(new Date(2026, 5, 8))).toBe("available");
    expect(getPayrollDayType(new Date(2026, 5, 18))).toBe("available");
    expect(isAdvanceBlockedDay(new Date(2026, 5, 25))).toBe(true);
  });

  it("calcula el próximo pago y días restantes", () => {
    const next = getNextPaymentDate(new Date(2026, 5, 5));
    expect(next.getDate()).toBe(30);
    expect(next.getMonth()).toBe(5);
    expect(getDaysUntilPayment(new Date(2026, 5, 23))).toBe(7);
  });

  it("identifica el día actual del calendario", () => {
    const reference = new Date(2026, 5, 13, 15, 30, 0);
    expect(isTodayCalendarDay(new Date(2026, 5, 13), reference)).toBe(true);
    expect(isTodayCalendarDay(new Date(2026, 5, 12), reference)).toBe(false);
    expect(isTodayCalendarDay(new Date(2026, 5, 13, 23, 59, 59), reference)).toBe(
      true,
    );
  });

  it("informa si hoy se puede solicitar adelanto", () => {
    expect(getAdvanceAvailabilityInfo(new Date(2026, 5, 8)).canRequestAdvance).toBe(
      true,
    );
    expect(getAdvanceAvailabilityInfo(new Date(2026, 5, 8)).headline).toContain(
      "puedes solicitar",
    );
    expect(getAdvanceAvailabilityInfo(new Date(2026, 5, 8)).detail).toContain(
      String(ADVANCE_WINDOW_LAST_DAY),
    );

    const blocked = getAdvanceAvailabilityInfo(new Date(2026, 5, 23));
    expect(blocked.canRequestAdvance).toBe(false);
    expect(blocked.headline).toContain("no puedes solicitar");
    expect(blocked.detail).toContain("próxima ventana");

    const availableMidMonth = getAdvanceAvailabilityInfo(new Date(2026, 5, 16));
    expect(availableMidMonth.canRequestAdvance).toBe(true);
    expect(availableMidMonth.detail).toContain("ventana mensual");
  });

  it("calcula la próxima fecha con adelanto disponible", () => {
    expect(getNextAdvanceAvailableDate(new Date(2026, 5, 23)).getDate()).toBe(1);
    expect(getNextAdvanceAvailableDate(new Date(2026, 5, 23)).getMonth()).toBe(6);
    expect(getNextAdvanceAvailableDate(new Date(2026, 5, 12)).getDate()).toBe(12);
    expect(getNextAdvanceAvailableDate(new Date(2026, 5, 25)).getMonth()).toBe(6);
    expect(getNextAdvanceAvailableDate(new Date(2026, 5, 25)).getDate()).toBe(1);
  });
});
