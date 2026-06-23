// ⚠️ AGNOSTIC — serialize/deserialize advance history in employee storage

import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";
import type { SerializedAdvanceHistoryRecord } from "../model/types";

export function serializeAdvanceHistoryRecord(
  record: AdvanceHistoryRecord,
): SerializedAdvanceHistoryRecord {
  return {
    ...record,
    requestedAt: record.requestedAt.toISOString(),
  };
}

export function deserializeAdvanceHistoryRecord(
  record: SerializedAdvanceHistoryRecord,
): AdvanceHistoryRecord {
  return {
    ...record,
    requestedAt: new Date(record.requestedAt),
    installments: record.installments ?? 1,
    bankName: record.bankName ?? "—",
    accountTypeLabel: record.accountTypeLabel ?? "—",
    accountNumber: record.accountNumber ?? "—",
  };
}

export function deserializeAdvanceHistory(
  records: SerializedAdvanceHistoryRecord[] | undefined,
): AdvanceHistoryRecord[] {
  if (!records?.length) return [];

  return records
    .map(deserializeAdvanceHistoryRecord)
    .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
}
