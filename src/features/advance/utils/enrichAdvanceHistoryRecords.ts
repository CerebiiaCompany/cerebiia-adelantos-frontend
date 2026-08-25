import type { ProfileView } from "@/entities/user/model/profileView";
import type { EmpleadoMeDTO } from "@/shared/api/types/adelanto";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";
import { getPayrollPeriodLabel, toSafeDate } from "@/shared/utils/payrollPeriod";
import {
  resolveEmpleadoAccountNumber,
  resolveEmpleadoAccountTypeLabel,
  resolveEmpleadoBankName,
} from "./empleadoBankingDisplay";

function isMissingValue(value: string | undefined): boolean {
  return !value || value.trim() === "" || value.trim() === "—";
}

export function enrichAdvanceHistoryRecords(
  records: AdvanceHistoryRecord[] | undefined,
  empleadoMe?: EmpleadoMeDTO | null,
  profile?: ProfileView | null,
): AdvanceHistoryRecord[] {
  const bankName = resolveEmpleadoBankName(empleadoMe, profile);
  const accountTypeLabel = resolveEmpleadoAccountTypeLabel(empleadoMe, profile);
  const accountNumber = resolveEmpleadoAccountNumber(empleadoMe, profile);

  return (records || []).map((record) => {
    const requestedAt = toSafeDate(record.requestedAt) ?? new Date();

    const rawAmount =
      record.amount ??
      (record as unknown as { monto?: unknown }).monto ??
      (record as unknown as { monto_solicitado?: unknown }).monto_solicitado ??
      0;
    const parsedAmount =
      typeof rawAmount === "number"
        ? rawAmount
        : Number.parseFloat(String(rawAmount));
    const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

    const rawFee =
      record.transactionFeeAmount ??
      (record as unknown as { tarifa_total?: unknown }).tarifa_total ??
      (record as unknown as { tarifa?: unknown }).tarifa ??
      0;
    const parsedFee =
      typeof rawFee === "number" ? rawFee : Number.parseFloat(String(rawFee));
    const transactionFeeAmount = Number.isFinite(parsedFee) ? parsedFee : 0;

    const rawNet =
      record.netAmount ??
      (record as unknown as { monto_a_recibir?: unknown }).monto_a_recibir ??
      (record as unknown as { monto_neto?: unknown }).monto_neto;
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

    const rawStatus =
      record.status ??
      (record as unknown as { estado?: unknown }).estado ??
      (record as unknown as { estadoApi?: unknown }).estadoApi;
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
      ...record,
      amount,
      netAmount,
      transactionFeeAmount,
      status,
      requestedAt,
      periodLabel: record.periodLabel || getPayrollPeriodLabel(requestedAt),
      installments: record.installments > 0 ? record.installments : 1,
      bankName: isMissingValue(record.bankName) ? bankName : record.bankName,
      accountTypeLabel: isMissingValue(record.accountTypeLabel)
        ? accountTypeLabel
        : record.accountTypeLabel,
      accountNumber: isMissingValue(record.accountNumber)
        ? accountNumber
        : record.accountNumber,
    };
  });
}

export function formatAdvanceInstallmentsLabel(installments: number): string {
  if (installments <= 1) return "1 cuota";
  return `${installments} cuotas`;
}

