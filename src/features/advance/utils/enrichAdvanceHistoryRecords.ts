import type { ProfileView } from "@/entities/user/model/profileView";
import type { EmpleadoMeDTO } from "@/shared/api/types/adelanto";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory.types";
import {
  resolveEmpleadoAccountNumber,
  resolveEmpleadoAccountTypeLabel,
  resolveEmpleadoBankName,
} from "./empleadoBankingDisplay";

function isMissingValue(value: string | undefined): boolean {
  return !value || value.trim() === "" || value.trim() === "—";
}

export function enrichAdvanceHistoryRecords(
  records: AdvanceHistoryRecord[],
  empleadoMe?: EmpleadoMeDTO | null,
  profile?: ProfileView | null,
): AdvanceHistoryRecord[] {
  const bankName = resolveEmpleadoBankName(empleadoMe, profile);
  const accountTypeLabel = resolveEmpleadoAccountTypeLabel(empleadoMe, profile);
  const accountNumber = resolveEmpleadoAccountNumber(empleadoMe, profile);

  return records.map((record) => ({
    ...record,
    installments: record.installments > 0 ? record.installments : 1,
    bankName: isMissingValue(record.bankName) ? bankName : record.bankName,
    accountTypeLabel: isMissingValue(record.accountTypeLabel)
      ? accountTypeLabel
      : record.accountTypeLabel,
    accountNumber: isMissingValue(record.accountNumber)
      ? accountNumber
      : record.accountNumber,
  }));
}

export function formatAdvanceInstallmentsLabel(installments: number): string {
  if (installments <= 1) return "1 cuota";
  return `${installments} cuotas`;
}
