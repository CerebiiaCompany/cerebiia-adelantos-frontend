import { formatCOP } from "@/shared/lib/currency";

/** Comisión fija que retiene la plataforma por cada adelanto (COP). */
export const ADVANCE_TRANSACTION_FEE_AMOUNT = 8_000;

export function calculateAdvanceTransactionFee(amount: number): number {
  return amount > 0 ? ADVANCE_TRANSACTION_FEE_AMOUNT : 0;
}

export function formatAdvanceTransactionFeeLabel(): string {
  return `Comisión fija (${formatCOP(ADVANCE_TRANSACTION_FEE_AMOUNT)})`;
}
