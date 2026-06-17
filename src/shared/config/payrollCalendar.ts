/** Días del mes en que se dispersa la nómina (quincenal). */
export const PAYMENT_DAYS_OF_MONTH = [1, 15] as const;

/** 1.ª quincena: adelantos del día 1 al 10 (inclusive). */
export const FIRST_QUINCENA_ADVANCE_FIRST_DAY = 1;
export const FIRST_QUINCENA_ADVANCE_LAST_DAY = 10;

/** 2.ª quincena: adelantos del día 15 al 20 (inclusive). */
export const SECOND_QUINCENA_ADVANCE_FIRST_DAY = 15;
export const SECOND_QUINCENA_ADVANCE_LAST_DAY = 20;

export type PayrollDayType = "payment" | "blocked" | "available";

export function isPaymentDay(date: Date): boolean {
  const day = date.getDate();
  return (PAYMENT_DAYS_OF_MONTH as readonly number[]).includes(day);
}

export function isFirstQuincenaAdvanceDay(day: number): boolean {
  return (
    day >= FIRST_QUINCENA_ADVANCE_FIRST_DAY &&
    day <= FIRST_QUINCENA_ADVANCE_LAST_DAY
  );
}

export function isSecondQuincenaAdvanceDay(day: number): boolean {
  return (
    day >= SECOND_QUINCENA_ADVANCE_FIRST_DAY &&
    day <= SECOND_QUINCENA_ADVANCE_LAST_DAY
  );
}

/** Días del mes en los que el empleado puede solicitar adelanto. */
export function isAdvanceAvailableDay(date: Date): boolean {
  const day = date.getDate();
  return isFirstQuincenaAdvanceDay(day) || isSecondQuincenaAdvanceDay(day);
}

/** Días sin solicitud de adelanto fuera de las ventanas quincenales. */
export function isAdvanceBlockedDay(date: Date): boolean {
  return !isAdvanceAvailableDay(date);
}

export function getPayrollDayType(date: Date): PayrollDayType {
  if (isPaymentDay(date)) return "payment";
  if (isAdvanceBlockedDay(date)) return "blocked";
  return "available";
}

export function getNextPaymentDate(from: Date = new Date()): Date {
  const year = from.getFullYear();
  const month = from.getMonth();

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
    const quincenaLabel = isFirstQuincenaAdvanceDay(dayStart.getDate())
      ? "1.ª quincena"
      : "2.ª quincena";

    return {
      canRequestAdvance: true,
      headline: "Hoy puedes solicitar adelanto",
      detail: isPaymentDay(dayStart)
        ? "Es día de pago de nómina y la ventana de adelanto está abierta."
        : `La ventana de la ${quincenaLabel} está activa.`,
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
