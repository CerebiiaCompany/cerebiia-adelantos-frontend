// ⚠️ AGNOSTIC — advance amount selection rules

export const ADVANCE_AMOUNT_STEP = 50_000;

export const ADVANCE_QUICK_AMOUNT_RATIOS = [0.2, 0.3, 0.5, 1] as const;

export function snapAdvanceAmount(value: number, maxAmount: number): number {
  const snapped =
    Math.round(value / ADVANCE_AMOUNT_STEP) * ADVANCE_AMOUNT_STEP;
  return Math.min(maxAmount, Math.max(0, snapped));
}

/** Montos sugeridos: 20%, 30%, 50% y 100% del cupo disponible (redondeados al step). */
export function buildAdvanceQuickAmounts(availableAmount: number): number[] {
  if (availableAmount <= 0) return [];

  const amounts = ADVANCE_QUICK_AMOUNT_RATIOS.map((ratio) =>
    ratio === 1
      ? availableAmount
      : snapAdvanceAmount(Math.floor(availableAmount * ratio), availableAmount),
  );

  return amounts.filter(
    (value, index) => value > 0 && amounts.indexOf(value) === index,
  );
}
