// ─── AGNOSTIC ─── advance amount selection rules

export const ADVANCE_MIN_AMOUNT = 10_000;
export const ADVANCE_AMOUNT_STEP = 50_000;
/** Paso fino cuando el cupo es menor al step estándar (p. ej. saldo residual). */
export const ADVANCE_SMALL_AMOUNT_STEP = 1_000;

export const ADVANCE_QUICK_AMOUNT_RATIOS = [0.2, 0.3, 0.5, 1] as const;

export function resolveAdvanceAmountStep(
  maxAmount: number,
  minAmount: number = 0,
): number {
  if (maxAmount <= 0) return ADVANCE_AMOUNT_STEP;
  if (minAmount > 0 && minAmount % ADVANCE_AMOUNT_STEP !== 0) {
    return 10_000;
  }
  if (maxAmount < ADVANCE_AMOUNT_STEP) return ADVANCE_SMALL_AMOUNT_STEP;
  return ADVANCE_AMOUNT_STEP;
}

export function snapAdvanceAmount(
  value: number,
  maxAmount: number,
  minAmount: number = 0,
): number {
  if (maxAmount <= 0) return 0;
  if (value >= maxAmount) return maxAmount;
  if (value <= 0) return 0;

  // Si se solicita un valor menor o igual al mínimo permitido (pero > 0), el resultado debe ser minAmount
  if (minAmount > 0 && value <= minAmount) {
    return minAmount;
  }

  const step = resolveAdvanceAmountStep(maxAmount, minAmount);
  const snapped = Math.round(value / step) * step;
  const clamped = Math.min(maxAmount, Math.max(0, snapped));

  if (minAmount > 0 && clamped < minAmount) {
    return minAmount;
  }

  return clamped;
}

/** Montos sugeridos: valores válidos >= minAmount y <= availableAmount. */
export function buildAdvanceQuickAmounts(
  availableAmount: number,
  minAmount: number = 0,
): number[] {
  if (availableAmount <= 0 || (minAmount > 0 && availableAmount < minAmount)) {
    return [];
  }

  const rawAmounts = ADVANCE_QUICK_AMOUNT_RATIOS.map((ratio) =>
    ratio === 1
      ? availableAmount
      : snapAdvanceAmount(Math.floor(availableAmount * ratio), availableAmount, minAmount),
  );

  const filtered =
    minAmount > 0
      ? rawAmounts.filter((val) => val >= minAmount && val <= availableAmount)
      : rawAmounts.filter((val) => val > 0 && val <= availableAmount);

  if (minAmount > 0 && availableAmount >= minAmount && !filtered.includes(minAmount)) {
    filtered.unshift(minAmount);
  }

  if (minAmount > 0 && filtered.length < 3 && availableAmount - minAmount >= 20_000) {
    const step = resolveAdvanceAmountStep(availableAmount, minAmount);
    const mid = Math.round((minAmount + availableAmount) / 2 / step) * step;
    if (mid > minAmount && mid < availableAmount && !filtered.includes(mid)) {
      filtered.push(mid);
    }
  }

  return Array.from(new Set(filtered)).sort((a, b) => a - b);
}
