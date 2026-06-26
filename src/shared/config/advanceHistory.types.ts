export type AdvanceReceiptStatus = "en_curso" | "aprobado" | "transferido";

export type AdvanceHistoryStatus = "aprobado" | "en_curso" | "no_aprobado";

import type { EstadoSolicitud } from "@/shared/api/types/adelanto";

export type AdvanceHistoryRecord = {
  id: string;
  amount: number;
  requestedAt: Date;
  periodLabel: string;
  status: AdvanceHistoryStatus;
  transactionFeeAmount: number;
  folio: string;
  receiptStatus: AdvanceReceiptStatus | null;
  paymentMethod: string;
  installments: number;
  bankName: string;
  accountTypeLabel: string;
  accountNumber: string;
  estadoApi?: EstadoSolicitud;
  canCancel?: boolean;
};
