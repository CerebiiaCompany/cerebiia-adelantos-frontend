export type AdvanceReceiptStatus = "en_curso" | "aprobado" | "transferido";

export type AdvanceHistoryStatus = "aprobado" | "en_curso" | "no_aprobado";

export type AdvanceHistoryRecord = {
  id: string;
  amount: number;
  requestedAt: Date;
  periodLabel: string;
  status: AdvanceHistoryStatus;
  transactionFeeRate: number;
  transactionFeeAmount: number;
  folio: string;
  receiptStatus: AdvanceReceiptStatus | null;
  paymentMethod: string;
};
