import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory";
import { calculateAdvanceTransactionFee } from "@/shared/config/advanceFees";
import type { SolicitudAdelantoDTO, EstadoSolicitud } from "./types/adelanto";

function mapEstadoToHistoryStatus(
  estado: EstadoSolicitud,
): AdvanceHistoryRecord["status"] {
  if (estado === "rechazado") return "no_aprobado";
  if (estado === "aprobado" || estado === "pagado") return "aprobado";
  return "en_curso";
}

function mapEstadoToReceiptStatus(
  estado: EstadoSolicitud,
): AdvanceHistoryRecord["receiptStatus"] {
  if (estado === "pagado") return "transferido";
  if (estado === "aprobado") return "aprobado";
  if (estado === "rechazado") return null;
  return "en_curso";
}

export function mapSolicitudToHistoryRecord(
  solicitud: SolicitudAdelantoDTO,
): AdvanceHistoryRecord {
  const amount = Number.parseFloat(solicitud.monto);
  const safeAmount = Number.isNaN(amount) ? 0 : amount;
  const transactionFeeAmount = calculateAdvanceTransactionFee(safeAmount);

  return {
    id: solicitud.id,
    amount: safeAmount,
    requestedAt: new Date(solicitud.created_at),
    periodLabel: new Date(solicitud.created_at).toLocaleDateString("es-CO", {
      month: "long",
      year: "numeric",
    }),
    status: mapEstadoToHistoryStatus(solicitud.estado),
    transactionFeeAmount,
    folio: solicitud.id.slice(0, 8).toUpperCase(),
    receiptStatus: mapEstadoToReceiptStatus(solicitud.estado),
    paymentMethod: "Transferencia bancaria",
  };
}

export function formatMontoForApi(amount: number): string {
  return amount.toFixed(2);
}
