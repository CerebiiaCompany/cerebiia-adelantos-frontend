import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory";
import {
  calculateAdvanceTotalFee,
  DEFAULT_TARIFA_FIJA_POR_CUOTA,
} from "@/shared/config/advanceFees";
import { resolveSolicitudComprobanteUrl } from "@/shared/lib/comprobantePago";
import { getPayrollPeriodLabel, toSafeDate } from "@/shared/utils/payrollPeriod";
import { isSolicitudCancellable } from "./solicitudAdelanto";
import type { SolicitudAdelantoDTO, EstadoSolicitud } from "./types/adelanto";

function mapEstadoToHistoryStatus(
  estado: unknown,
): AdvanceHistoryRecord["status"] {
  if (estado === "rechazado" || estado === "no_aprobado") return "no_aprobado";
  if (estado === "aprobado" || estado === "pagado") return "aprobado";
  return "en_curso";
}

function mapEstadoToReceiptStatus(
  estado: unknown,
): AdvanceHistoryRecord["receiptStatus"] {
  if (estado === "pagado" || estado === "transferido") return "transferido";
  if (estado === "aprobado") return "aprobado";
  if (estado === "rechazado" || estado === "no_aprobado") return null;
  return "en_curso";
}

export function mapSolicitudToHistoryRecord(
  solicitud: SolicitudAdelantoDTO | Record<string, unknown>,
): AdvanceHistoryRecord {
  const rawAmount =
    solicitud.monto ??
    (solicitud as Record<string, unknown>).amount ??
    (solicitud as Record<string, unknown>).monto_solicitado ??
    (solicitud as Record<string, unknown>).valor ??
    (solicitud as Record<string, unknown>).monto_aprobado ??
    0;
  const parsedAmount =
    typeof rawAmount === "number"
      ? rawAmount
      : Number.parseFloat(String(rawAmount));
  const safeAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

  const rawNet =
    solicitud.monto_a_recibir ??
    solicitud.monto_neto ??
    (solicitud as Record<string, unknown>).netAmount ??
    (solicitud as Record<string, unknown>).neto ??
    (solicitud as Record<string, unknown>).valor_a_recibir;
  const parsedNet =
    rawNet != null
      ? typeof rawNet === "number"
        ? rawNet
        : Number.parseFloat(String(rawNet))
      : Number.NaN;

  const rawInstallments =
    solicitud.numero_cuotas_snapshot ??
    (solicitud as Record<string, unknown>).installments ??
    (solicitud as Record<string, unknown>).numero_cuotas ??
    (solicitud as Record<string, unknown>).cuotas ??
    1;
  const parsedInstallments = Number(rawInstallments);
  const installments =
    Number.isFinite(parsedInstallments) && parsedInstallments > 0
      ? parsedInstallments
      : 1;

  const rawTarifaTotal =
    solicitud.tarifa_total ??
    (solicitud as Record<string, unknown>).transactionFeeAmount ??
    (solicitud as Record<string, unknown>).tarifa ??
    (solicitud as Record<string, unknown>).fee ??
    (solicitud as Record<string, unknown>).comision;
  const parsedTarifaTotal =
    rawTarifaTotal != null
      ? typeof rawTarifaTotal === "number"
        ? rawTarifaTotal
        : Number.parseFloat(String(rawTarifaTotal))
      : Number.NaN;

  const transactionFeeAmount =
    Number.isFinite(parsedTarifaTotal) && parsedTarifaTotal >= 0
      ? Math.round(parsedTarifaTotal)
      : Number.isFinite(parsedNet) && parsedNet >= 0
        ? Math.max(0, safeAmount - parsedNet)
        : calculateAdvanceTotalFee(
            DEFAULT_TARIFA_FIJA_POR_CUOTA,
            installments,
            safeAmount,
          );
  const netAmount =
    Number.isFinite(parsedNet) && parsedNet >= 0
      ? Math.round(parsedNet)
      : Math.max(0, safeAmount - transactionFeeAmount);

  const rawDate =
    solicitud.created_at ||
    (solicitud as Record<string, unknown>).requestedAt ||
    (solicitud as Record<string, unknown>).fecha_creacion ||
    (solicitud as Record<string, unknown>).fecha_solicitud ||
    (solicitud as Record<string, unknown>).fecha ||
    (solicitud as Record<string, unknown>).createdAt ||
    (solicitud as Record<string, unknown>).date ||
    solicitud.updated_at ||
    solicitud.pagado_en ||
    solicitud.decidido_en;
  const requestedAt = toSafeDate(rawDate as string | Date) ?? new Date();

  const rawEstado =
    solicitud.estado ??
    (solicitud as Record<string, unknown>).status ??
    (solicitud as Record<string, unknown>).estadoApi;

  const id = String(solicitud.id ?? `adv-${requestedAt.getTime()}`);

  return {
    id,
    amount: safeAmount,
    netAmount,
    requestedAt,
    periodLabel: getPayrollPeriodLabel(requestedAt),
    status: mapEstadoToHistoryStatus(rawEstado),
    transactionFeeAmount,
    folio: id.slice(0, 8).toUpperCase(),
    receiptStatus: mapEstadoToReceiptStatus(rawEstado),
    paymentMethod:
      (solicitud as Record<string, unknown>).paymentMethod as string ||
      "Transferencia bancaria",
    installments,
    bankName:
      (solicitud as Record<string, unknown>).bankName as string || "—",
    accountTypeLabel:
      (solicitud as Record<string, unknown>).accountTypeLabel as string || "—",
    accountNumber:
      (solicitud as Record<string, unknown>).accountNumber as string || "—",
    estadoApi: (solicitud.estado ?? rawEstado) as EstadoSolicitud,
    canCancel: isSolicitudCancellable(rawEstado as EstadoSolicitud),
    rejectionReason: solicitud.motivo_rechazo?.trim() || null,
    paymentEvidenceUrl: resolveSolicitudComprobanteUrl(
      solicitud as SolicitudAdelantoDTO,
    ),
  };
}

export function formatMontoForApi(amount: number): string {
  return amount.toFixed(2);
}


