/** Días del mes en que se dispersa la nómina (quincenal). */
export const PAYMENT_DAYS_OF_MONTH = [1, 15] as const;

export type PayrollDayType = "payment" | "blocked" | "available";

export function isPaymentDay(date: Date): boolean {
  const day = date.getDate();
  return (PAYMENT_DAYS_OF_MONTH as readonly number[]).includes(day);
}

export function getLastDayOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** Días sin solicitud de adelanto: día de pago y ventanas de corte previas. */
export function isAdvanceBlockedDay(date: Date): boolean {
  const day = date.getDate();
  const lastDay = getLastDayOfMonth(date);

  if (isPaymentDay(date)) return true;
  if (day === 13 || day === 14) return true;
  if (day >= lastDay - 1) return true;

  return false;
}

export function getPayrollDayType(date: Date): PayrollDayType {
  if (isPaymentDay(date)) return "payment";
  if (isAdvanceBlockedDay(date)) return "blocked";
  return "available";
}

export function getNextPaymentDate(from: Date = new Date()): Date {
  const year = from.getFullYear();
  const month = from.getMonth();
  const day = from.getDate();

  const candidates = PAYMENT_DAYS_OF_MONTH.map(
    (paymentDay) => new Date(year, month, paymentDay),
  ).filter((date) => date >= startOfDay(from));

  if (candidates.length > 0) {
    return candidates[0]!;
  }

  return new Date(year, month + 1, PAYMENT_DAYS_OF_MONTH[0]);
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getDaysUntilPayment(from: Date = new Date()): number {
  const next = getNextPaymentDate(from);
  const start = startOfDay(from);
  const diffMs = startOfDay(next).getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}
