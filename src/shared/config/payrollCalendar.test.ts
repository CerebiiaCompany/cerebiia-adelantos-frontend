import { describe, expect, it } from "vitest";
import {
  getAdvanceAvailabilityInfo,
  getDaysUntilPayment,
  getNextAdvanceAvailableDate,
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

  it("informa si hoy se puede solicitar adelanto", () => {
    expect(getAdvanceAvailabilityInfo(new Date(2026, 5, 8)).canRequestAdvance).toBe(
      true,
    );
    expect(getAdvanceAvailabilityInfo(new Date(2026, 5, 8)).headline).toContain(
      "puedes solicitar",
    );

    const blocked = getAdvanceAvailabilityInfo(new Date(2026, 5, 12));
    expect(blocked.canRequestAdvance).toBe(false);
    expect(blocked.headline).toContain("no puedes solicitar");
    expect(blocked.detail).toContain("próxima ventana");

    const availableSecondWindow = getAdvanceAvailabilityInfo(new Date(2026, 5, 16));
    expect(availableSecondWindow.canRequestAdvance).toBe(true);
    expect(availableSecondWindow.detail).toContain("2.ª quincena");
  });

  it("calcula la próxima fecha con adelanto disponible", () => {
    expect(getNextAdvanceAvailableDate(new Date(2026, 5, 12)).getDate()).toBe(15);
    expect(getNextAdvanceAvailableDate(new Date(2026, 5, 25)).getMonth()).toBe(6);
    expect(getNextAdvanceAvailableDate(new Date(2026, 5, 25)).getDate()).toBe(1);
  });
});
