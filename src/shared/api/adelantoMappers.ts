import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory";
import {
  calculateAdvanceTotalFee,
  DEFAULT_TARIFA_FIJA_POR_CUOTA,
} from "@/shared/config/advanceFees";
import { resolveComprobantePagoUrl } from "@/shared/lib/comprobantePago";
import { isSolicitudCancellable } from "./solicitudAdelanto";
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
  const parsedNet = solicitud.monto_a_recibir
    ? Number.parseFloat(solicitud.monto_a_recibir)
    : solicitud.monto_neto
      ? Number.parseFloat(solicitud.monto_neto)
      : Number.NaN;
  const installments = solicitud.numero_cuotas_snapshot > 0
    ? solicitud.numero_cuotas_snapshot
    : 1;
  const parsedTarifaTotal = solicitud.tarifa_total
    ? Number.parseFloat(solicitud.tarifa_total)
    : Number.NaN;
  const transactionFeeAmount =
    !Number.isNaN(parsedTarifaTotal) && parsedTarifaTotal >= 0
      ? Math.round(parsedTarifaTotal)
      : !Number.isNaN(parsedNet) && parsedNet >= 0
        ? Math.max(0, safeAmount - parsedNet)
        : calculateAdvanceTotalFee(
            DEFAULT_TARIFA_FIJA_POR_CUOTA,
            installments,
            safeAmount,
          );
  const netAmount =
    !Number.isNaN(parsedNet) && parsedNet >= 0
      ? Math.round(parsedNet)
      : Math.max(0, safeAmount - transactionFeeAmount);

  return {
    id: solicitud.id,
    amount: safeAmount,
    netAmount,
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
    installments: solicitud.numero_cuotas_snapshot,
    bankName: "—",
    accountTypeLabel: "—",
    accountNumber: "—",
    estadoApi: solicitud.estado,
    canCancel: isSolicitudCancellable(solicitud.estado),
    rejectionReason: solicitud.motivo_rechazo?.trim() || null,
    paymentEvidenceUrl: resolveComprobantePagoUrl(
      solicitud.comprobante_pago ?? solicitud.comprobante_pago_url,
    ),
  };
}

export function formatMontoForApi(amount: number): string {
  return amount.toFixed(2);
}
