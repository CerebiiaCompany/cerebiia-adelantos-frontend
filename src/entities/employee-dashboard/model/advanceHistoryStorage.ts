// ⚠️ AGNOSTIC — serialize/deserialize advance history in employee storage

import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";
import { getPayrollPeriodLabel, toSafeDate } from "@/shared/utils/payrollPeriod";
import type { SerializedAdvanceHistoryRecord } from "../model/types";

export function serializeAdvanceHistoryRecord(
  record: AdvanceHistoryRecord,
): SerializedAdvanceHistoryRecord {
  const safeDate = toSafeDate(record.requestedAt) ?? new Date();
  return {
    ...record,
    requestedAt: safeDate.toISOString(),
  };
}

export function deserializeAdvanceHistoryRecord(
  record: SerializedAdvanceHistoryRecord | Record<string, unknown>,
): AdvanceHistoryRecord {
  const rawAmount =
    (record as { amount?: unknown }).amount ??
    (record as { monto?: unknown }).monto ??
    (record as { monto_solicitado?: unknown }).monto_solicitado ??
    (record as { valor?: unknown }).valor ??
    0;
  const parsedAmount =
    typeof rawAmount === "number"
      ? rawAmount
      : Number.parseFloat(String(rawAmount));
  const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

  const rawFee =
    (record as { transactionFeeAmount?: unknown }).transactionFeeAmount ??
    (record as { tarifa_total?: unknown }).tarifa_total ??
    (record as { tarifa?: unknown }).tarifa ??
    (record as { comision?: unknown }).comision ??
    0;
  const parsedFee =
    typeof rawFee === "number" ? rawFee : Number.parseFloat(String(rawFee));
  const transactionFeeAmount = Number.isFinite(parsedFee) ? parsedFee : 0;

  const rawNet =
    (record as { netAmount?: unknown }).netAmount ??
    (record as { monto_a_recibir?: unknown }).monto_a_recibir ??
    (record as { monto_neto?: unknown }).monto_neto ??
    (record as { neto?: unknown }).neto;
  const parsedNet =
    rawNet != null
      ? typeof rawNet === "number"
        ? rawNet
        : Number.parseFloat(String(rawNet))
      : Number.NaN;
  const netAmount =
    Number.isFinite(parsedNet) && parsedNet >= 0
      ? parsedNet
      : Math.max(0, amount - transactionFeeAmount);

  const rawDate =
    (record as { requestedAt?: unknown }).requestedAt ||
    (record as { date?: unknown }).date ||
    (record as { createdAt?: unknown }).createdAt ||
    (record as { created_at?: unknown }).created_at;
  const requestedAt = toSafeDate(rawDate as string | Date) ?? new Date();

  const rawStatus =
    (record as { status?: unknown }).status ??
    (record as { estado?: unknown }).estado ??
    (record as { estadoApi?: unknown }).estadoApi;
  const status =
    rawStatus === "aprobado" ||
    rawStatus === "no_aprobado" ||
    rawStatus === "en_curso"
      ? rawStatus
      : rawStatus === "rechazado"
        ? "no_aprobado"
        : rawStatus === "pagado"
          ? "aprobado"
          : "en_curso";

  return {
    ...(record as unknown as AdvanceHistoryRecord),
    amount,
    netAmount,
    transactionFeeAmount,
    status,
    requestedAt,
    periodLabel:
      (record as { periodLabel?: string }).periodLabel ||
      getPayrollPeriodLabel(requestedAt),
    installments:
      Number((record as { installments?: unknown }).installments) > 0
        ? Number((record as { installments?: unknown }).installments)
        : 1,
    bankName: (record as { bankName?: string }).bankName ?? "—",
    accountTypeLabel:
      (record as { accountTypeLabel?: string }).accountTypeLabel ?? "—",
    accountNumber: (record as { accountNumber?: string }).accountNumber ?? "—",
  };
}

export function deserializeAdvanceHistory(
  records: SerializedAdvanceHistoryRecord[] | undefined,
): AdvanceHistoryRecord[] {
  if (!records?.length) return [];

  return records
    .filter((r): r is SerializedAdvanceHistoryRecord => Boolean(r && typeof r === "object"))
    .map(deserializeAdvanceHistoryRecord)
    .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
}

