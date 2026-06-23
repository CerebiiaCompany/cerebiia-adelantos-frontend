// ⚠️ AGNOSTIC — salary income accrual from hire date (fecha_ingreso)

const MS_PER_DAY = 86_400_000;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function countInclusiveDays(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

export function parseIncomeStartDate(
  input: string | Date | undefined | null,
): Date | null {
  if (!input) return null;

  if (typeof input === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]) - 1;
      const day = Number(match[3]);
      const localDate = new Date(year, month, day);
      if (Number.isNaN(localDate.getTime())) return null;
      return startOfDay(localDate);
    }
  }

  const parsed = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(parsed.getTime())) return null;

  return startOfDay(parsed);
}

export function calculateDailySalaryIncome(
  salary: number,
  referenceDate: Date = new Date(),
): number {
  if (salary <= 0) return 0;

  const daysInMonth = getDaysInMonth(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
  );

  return Math.round(salary / daysInMonth);
}

/** Ingreso devengado en un mes calendario concreto. */
export function calculateIncomeForCalendarMonth(
  salary: number,
  incomeStartDate: string | Date | undefined | null,
  monthDate: Date,
  referenceDate: Date = new Date(),
): number {
  if (salary <= 0) return 0;

  const hireDate = parseIncomeStartDate(incomeStartDate);
  const reference = startOfDay(referenceDate);

  if (!hireDate) {
    return 0;
  }

  if (hireDate > reference) return 0;

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const monthStart = startOfDay(new Date(year, month, 1));
  const monthEnd = startOfDay(new Date(year, month, daysInMonth));

  if (monthEnd < hireDate || monthStart > reference) return 0;

  const periodStart = hireDate > monthStart ? hireDate : monthStart;
  const isCurrentMonth =
    year === reference.getFullYear() && month === reference.getMonth();
  const periodEnd = isCurrentMonth ? reference : monthEnd;

  if (periodStart > periodEnd) return 0;

  const daysWorked = countInclusiveDays(periodStart, periodEnd);
  return Math.round((salary * daysWorked) / daysInMonth);
}

/** Ingreso acumulado desde la fecha de ingreso (no se reinicia cada mes). */
export function calculateCumulativeAccumulatedIncome(
  salary: number,
  incomeStartDate: string | Date | undefined | null,
  referenceDate: Date = new Date(),
): number {
  if (salary <= 0) return 0;

  const hireDate = parseIncomeStartDate(incomeStartDate);
  const reference = startOfDay(referenceDate);

  if (!hireDate || hireDate > reference) return 0;

  let total = 0;
  const cursor = new Date(hireDate.getFullYear(), hireDate.getMonth(), 1);

  while (
    cursor.getFullYear() < reference.getFullYear() ||
    (cursor.getFullYear() === reference.getFullYear() &&
      cursor.getMonth() <= reference.getMonth())
  ) {
    total += calculateIncomeForCalendarMonth(
      salary,
      hireDate,
      cursor,
      reference,
    );
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return total;
}

/** @deprecated Use calculateIncomeForCalendarMonth */
export function calculateMonthlySalaryIncome(
  salary: number,
  monthDate: Date,
  referenceDate: Date = new Date(),
  incomeStartDate?: string | Date | null,
): number {
  return calculateIncomeForCalendarMonth(
    salary,
    incomeStartDate,
    monthDate,
    referenceDate,
  );
}

/** @deprecated Use calculateCumulativeAccumulatedIncome */
export function calculateMonthlyAccumulatedIncome(
  salary: number,
  referenceDate: Date = new Date(),
  incomeStartDate?: string | Date | null,
): number {
  return calculateCumulativeAccumulatedIncome(
    salary,
    incomeStartDate,
    referenceDate,
  );
}
