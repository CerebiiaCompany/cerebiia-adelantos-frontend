import { describe, expect, it } from "vitest";
import {
  getDaysUntilPayment,
  getNextPaymentDate,
  getPayrollDayType,
  isAdvanceAvailableDay,
  isAdvanceBlockedDay,
  isPaymentDay,
  isTodayCalendarDay,
} from "./payrollCalendar";

describe("payrollCalendar", () => {
  it("identifica días de pago quincenales", () => {
    expect(isPaymentDay(new Date(2026, 3, 1))).toBe(true);
    expect(isPaymentDay(new Date(2026, 3, 15))).toBe(true);
    expect(isPaymentDay(new Date(2026, 3, 10))).toBe(false);
  });

  it("permite adelantos en 1.ª quincena hasta el día 10", () => {
    expect(isAdvanceAvailableDay(new Date(2026, 3, 1))).toBe(true);
    expect(isAdvanceAvailableDay(new Date(2026, 3, 10))).toBe(true);
    expect(isAdvanceAvailableDay(new Date(2026, 3, 11))).toBe(false);
    expect(isAdvanceAvailableDay(new Date(2026, 3, 14))).toBe(false);
  });

  it("permite adelantos en 2.ª quincena del 15 al 20", () => {
    expect(isAdvanceAvailableDay(new Date(2026, 3, 15))).toBe(true);
    expect(isAdvanceAvailableDay(new Date(2026, 3, 20))).toBe(true);
    expect(isAdvanceAvailableDay(new Date(2026, 3, 21))).toBe(false);
    expect(isAdvanceAvailableDay(new Date(2026, 3, 30))).toBe(false);
  });

  it("clasifica tipo de día en el calendario", () => {
    expect(getPayrollDayType(new Date(2026, 3, 15))).toBe("payment");
    expect(getPayrollDayType(new Date(2026, 3, 14))).toBe("blocked");
    expect(getPayrollDayType(new Date(2026, 3, 8))).toBe("available");
    expect(getPayrollDayType(new Date(2026, 3, 18))).toBe("available");
    expect(isAdvanceBlockedDay(new Date(2026, 3, 25))).toBe(true);
  });

  it("calcula el próximo pago y días restantes", () => {
    const next = getNextPaymentDate(new Date(2026, 3, 5));
    expect(next.getDate()).toBe(15);
    expect(getDaysUntilPayment(new Date(2026, 3, 5))).toBe(10);
  });

  it("identifica el día actual del calendario", () => {
    const reference = new Date(2026, 5, 13, 15, 30, 0);
    expect(isTodayCalendarDay(new Date(2026, 5, 13), reference)).toBe(true);
    expect(isTodayCalendarDay(new Date(2026, 5, 12), reference)).toBe(false);
    expect(isTodayCalendarDay(new Date(2026, 5, 13, 23, 59, 59), reference)).toBe(
      true,
    );
  });
});
