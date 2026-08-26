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

  const rawCuotas = (solicitud as Record<string, unknown>).cuotas;
  let montoDescontado = 0;
  let montoPendiente = 0;
  let cuotasPagadas = 0;
  let cuotasPendientes = installments;

  if (Array.isArray(rawCuotas) && rawCuotas.length > 0) {
    for (const c of rawCuotas as Array<Record<string, unknown>>) {
      const cMonto =
        Number(c.monto) || safeAmount / (rawCuotas.length || 1);
      const cEstado = String(c.estado || "").toLowerCase().trim();
      const isPaid =
        cEstado === "pagado" ||
        cEstado === "pagada" ||
        cEstado === "liberado" ||
        cEstado === "liberada" ||
        cEstado === "descontado" ||
        cEstado === "descontada" ||
        Boolean(c.pagado) ||
        Boolean(c.fecha_pago);

      if (isPaid) {
        montoDescontado += cMonto;
        cuotasPagadas += 1;
      } else {
        montoPendiente += cMonto;
      }
    }
    cuotasPendientes = Math.max(0, rawCuotas.length - cuotasPagadas);
    montoDescontado = Math.round(montoDescontado);
    montoPendiente = Math.round(montoPendiente);
  } else {
    const rawCuotasPagadas =
      (solicitud as Record<string, unknown>).cuotas_pagadas ??
      (solicitud as Record<string, unknown>).numero_cuotas_pagadas ??
      (solicitud as Record<string, unknown>).cuotas_liberadas ??
      (solicitud as Record<string, unknown>).cuotasPagadas;

    const rawDescontado =
      (solicitud as Record<string, unknown>).monto_descontado ??
      (solicitud as Record<string, unknown>).total_descontado ??
      (solicitud as Record<string, unknown>).monto_liberado ??
      (solicitud as Record<string, unknown>).monto_pagado;

    const rawPendiente =
      (solicitud as Record<string, unknown>).monto_pendiente ??
      (solicitud as Record<string, unknown>).total_pendiente ??
      (solicitud as Record<string, unknown>).saldo_pendiente;

    if (rawCuotasPagadas !== undefined && rawCuotasPagadas !== null) {
      cuotasPagadas = Math.min(
        installments,
        Math.max(0, Number(rawCuotasPagadas) || 0),
      );
      cuotasPendientes = Math.max(0, installments - cuotasPagadas);
      if (rawDescontado !== undefined) {
        montoDescontado = Math.round(Number(rawDescontado) || 0);
        montoPendiente =
          rawPendiente !== undefined
            ? Math.round(Number(rawPendiente) || 0)
            : Math.max(0, safeAmount - montoDescontado);
      } else {
        montoDescontado = Math.round(
          (safeAmount / installments) * cuotasPagadas,
        );
        montoPendiente = Math.max(0, safeAmount - montoDescontado);
      }
    } else if (rawDescontado !== undefined && rawDescontado !== null) {
      montoDescontado = Math.round(Number(rawDescontado) || 0);
      montoPendiente =
        rawPendiente !== undefined
          ? Math.round(Number(rawPendiente) || 0)
          : Math.max(0, safeAmount - montoDescontado);
      cuotasPagadas = Math.min(
        installments,
        Math.round((montoDescontado / safeAmount) * installments),
      );
      cuotasPendientes = Math.max(0, installments - cuotasPagadas);
    } else if (rawEstado === "pagado") {
      montoDescontado = safeAmount;
      montoPendiente = 0;
      cuotasPagadas = installments;
      cuotasPendientes = 0;
    } else if (rawEstado === "rechazado" || rawEstado === "no_aprobado") {
      montoDescontado = 0;
      montoPendiente = 0;
      cuotasPagadas = 0;
      cuotasPendientes = 0;
    } else {
      montoDescontado = 0;
      montoPendiente = safeAmount;
      cuotasPagadas = 0;
      cuotasPendientes = installments;
    }
  }

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
    montoDescontado,
    montoPendiente,
    cuotasPagadas,
    cuotasPendientes,
  };
}

export function formatMontoForApi(amount: number): string {
  return amount.toFixed(2);
}


