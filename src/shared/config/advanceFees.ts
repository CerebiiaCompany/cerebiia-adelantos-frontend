/** Porcentaje que retiene la plataforma por transacción (2.5%). */
export const ADVANCE_TRANSACTION_FEE_RATE = 0.025;

export function calculateAdvanceTransactionFee(amount: number): number {
  return Math.round(amount * ADVANCE_TRANSACTION_FEE_RATE);
}

export function formatAdvanceTransactionFeeRate(
  rate = ADVANCE_TRANSACTION_FEE_RATE,
): string {
  const percent = rate * 100;
  return Number.isInteger(percent) ? `${percent}%` : `${percent.toFixed(1)}%`;
}
