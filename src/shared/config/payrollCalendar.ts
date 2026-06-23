/** Días del mes en que se dispersa la nómina. */
export const PAYMENT_DAYS_OF_MONTH = [1, 30] as const;

/** Ventana mensual: adelantos del día 1 al 20 (inclusive). Del 21 al 1 no hay adelantos. */
export const ADVANCE_WINDOW_FIRST_DAY = 1;
export const ADVANCE_WINDOW_LAST_DAY = 20;

export type PayrollDayType = "payment" | "blocked" | "available";

export function getLastDayOfMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Resuelve el día de pago en un mes (p. ej. 30 → 28/29 en febrero). */
export function resolvePaymentDayInMonth(
  year: number,
  month: number,
  paymentDay: number,
): Date {
  const lastDay = getLastDayOfMonth(year, month);
  const day = Math.min(paymentDay, lastDay);
  return new Date(year, month, day);
}

export function isPaymentDay(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  return PAYMENT_DAYS_OF_MONTH.some((paymentDay) => {
    const resolved = resolvePaymentDayInMonth(year, month, paymentDay);
    return (
      resolved.getFullYear() === year &&
      resolved.getMonth() === month &&
      resolved.getDate() === day
    );
  });
}

/** Días del mes en los que el empleado puede solicitar adelanto. */
export function isAdvanceAvailableDay(date: Date): boolean {
  const day = date.getDate();
  return (
    day >= ADVANCE_WINDOW_FIRST_DAY && day <= ADVANCE_WINDOW_LAST_DAY
  );
}

/** Días sin solicitud de adelanto (del 21 al fin de mes). */
export function isAdvanceBlockedDay(date: Date): boolean {
  return !isAdvanceAvailableDay(date);
}

export function getPayrollDayType(date: Date): PayrollDayType {
  if (isPaymentDay(date)) return "payment";
  if (isAdvanceBlockedDay(date)) return "blocked";
  return "available";
}

export function getNextPaymentDate(from: Date = new Date()): Date {
  const start = startOfDay(from);
  const candidates: Date[] = [];

  for (let monthOffset = 0; monthOffset <= 1; monthOffset += 1) {
    const date = new Date(start);
    date.setDate(1);
    date.setMonth(start.getMonth() + monthOffset);

    const year = date.getFullYear();
    const month = date.getMonth();

    for (const paymentDay of PAYMENT_DAYS_OF_MONTH) {
      const candidate = startOfDay(
        resolvePaymentDayInMonth(year, month, paymentDay),
      );
      if (candidate >= start) {
        candidates.push(candidate);
      }
    }
  }

  candidates.sort((a, b) => a.getTime() - b.getTime());
  return candidates[0] ?? resolvePaymentDayInMonth(
    start.getFullYear(),
    start.getMonth() + 1,
    PAYMENT_DAYS_OF_MONTH[0],
  );
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getCalendarDayStart(date: Date = new Date()): Date {
  return startOfDay(date);
}

export function isTodayCalendarDay(
  date: Date,
  reference: Date = new Date(),
): boolean {
  return startOfDay(date).getTime() === startOfDay(reference).getTime();
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function getDaysUntilPayment(from: Date = new Date()): number {
  const next = getNextPaymentDate(from);
  const start = startOfDay(from);
  const diffMs = startOfDay(next).getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

export function canRequestAdvanceOnDate(date: Date): boolean {
  return isAdvanceAvailableDay(date);
}

export function getNextAdvanceAvailableDate(from: Date = new Date()): Date {
  const start = startOfDay(from);

  for (let offset = 0; offset < 62; offset += 1) {
    const candidate = new Date(start);
    candidate.setDate(start.getDate() + offset);

    if (isAdvanceAvailableDay(candidate)) {
      return candidate;
    }
  }

  return start;
}

export type AdvanceAvailabilityInfo = {
  canRequestAdvance: boolean;
  headline: string;
  detail: string;
};

export function getAdvanceAvailabilityInfo(
  date: Date = new Date(),
): AdvanceAvailabilityInfo {
  const dayStart = startOfDay(date);

  if (canRequestAdvanceOnDate(dayStart)) {
    return {
      canRequestAdvance: true,
      headline: "Hoy puedes solicitar adelanto",
      detail: isPaymentDay(dayStart)
        ? "Es día de pago de nómina y la ventana de adelanto está abierta."
        : `La ventana mensual está activa (días ${ADVANCE_WINDOW_FIRST_DAY} al ${ADVANCE_WINDOW_LAST_DAY}).`,
    };
  }

  const nextDate = getNextAdvanceAvailableDate(dayStart);
  const daysUntil = Math.max(
    0,
    Math.round(
      (startOfDay(nextDate).getTime() - dayStart.getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );

  const nextDateLabel = nextDate.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  let detail: string;
  if (daysUntil <= 0) {
    detail = "La ventana de adelanto se abre hoy.";
  } else if (daysUntil === 1) {
    detail = "La próxima ventana abre mañana.";
  } else {
    detail = `La próxima ventana abre el ${nextDateLabel} (en ${daysUntil} días).`;
  }

  return {
    canRequestAdvance: false,
    headline: "Hoy no puedes solicitar adelanto",
    detail,
  };
}
