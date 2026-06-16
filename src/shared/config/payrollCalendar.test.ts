import { describe, expect, it } from "vitest";
import {
  getDaysUntilPayment,
  getNextPaymentDate,
  getPayrollDayType,
  isAdvanceBlockedDay,
  isPaymentDay,
} from "./payrollCalendar";

describe("payrollCalendar", () => {
  it("identifica días de pago quincenales", () => {
    expect(isPaymentDay(new Date(2026, 3, 1))).toBe(true);
    expect(isPaymentDay(new Date(2026, 3, 15))).toBe(true);
    expect(isPaymentDay(new Date(2026, 3, 10))).toBe(false);
  });

  it("bloquea ventanas de corte y día de pago", () => {
    expect(isAdvanceBlockedDay(new Date(2026, 3, 15))).toBe(true);
    expect(isAdvanceBlockedDay(new Date(2026, 3, 14))).toBe(true);
    expect(isAdvanceBlockedDay(new Date(2026, 3, 30))).toBe(true);
    expect(isAdvanceBlockedDay(new Date(2026, 3, 20))).toBe(false);
  });

  it("prioriza tipo pago sobre bloqueo visual", () => {
    expect(getPayrollDayType(new Date(2026, 3, 15))).toBe("payment");
    expect(getPayrollDayType(new Date(2026, 3, 14))).toBe("blocked");
    expect(getPayrollDayType(new Date(2026, 3, 20))).toBe("available");
  });

  it("calcula el próximo pago y días restantes", () => {
    const next = getNextPaymentDate(new Date(2026, 3, 5));
    expect(next.getDate()).toBe(15);
    expect(getDaysUntilPayment(new Date(2026, 3, 5))).toBe(10);
  });
});
