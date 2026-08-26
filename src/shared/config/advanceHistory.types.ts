export type AdvanceReceiptStatus = "en_curso" | "aprobado" | "transferido";

export type AdvanceHistoryStatus = "aprobado" | "en_curso" | "no_aprobado";

import type { EstadoSolicitud } from "@/shared/api/types/adelanto";

export type AdvanceHistoryRecord = {
  id: string;
  amount: number;
  /** Monto neto que recibe el empleado (monto − comisión). */
  netAmount: number;
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
  /** Motivo de rechazo visible para el empleado. */
  rejectionReason?: string | null;
  /** URL absoluta o relativa al comprobante de transferencia del super admin. */
  paymentEvidenceUrl?: string | null;
  /** Monto total descontado por nómina de este adelanto. */
  montoDescontado?: number;
  /** Monto restante pendiente por descontar de nómina. */
  montoPendiente?: number;
  /** Número de cuotas ya pagadas / descontadas. */
  cuotasPagadas?: number;
  /** Número de cuotas aún pendientes por descontar. */
  cuotasPendientes?: number;
};
