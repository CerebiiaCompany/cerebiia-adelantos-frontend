import { useMemo } from "react";
import { calculateMaxAdvanceLimit } from "@/entities/employee-dashboard";
import { useEmployeeDashboard } from "@/features/dashboard";
import { useEmployeeAdvanceHistory } from "@/features/advance/model/useEmployeeAdvanceHistory";

function formatControlMonthLabel(date: Date): string {
  const label = date.toLocaleDateString("es-CO", { month: "short" });
  const normalized = label.replace(/\./g, "");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function getMonthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}`;
}

export function useEmployeeControlData() {
  const dashboard = useEmployeeDashboard();
  const advanceHistory = useEmployeeAdvanceHistory();

  return useMemo(() => {
    if (!dashboard) return null;

    const limitAmount = calculateMaxAdvanceLimit(dashboard.salary);
    const usedAmount = dashboard.totalAdvancedThisMonth;
    const usedPercent =
      limitAmount > 0 ? Math.round((usedAmount / limitAmount) * 100) : 0;

    const monthlyAdvanceData = Array.from({ length: 4 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (3 - index));
      const monthKey = getMonthKey(date);
      const adelantos = advanceHistory
        .filter((record) => getMonthKey(record.requestedAt) === monthKey)
        .reduce((sum, record) => sum + record.amount, 0);

      return {
        name: formatControlMonthLabel(date),
        adelantos,
        limite: limitAmount,
        count: advanceHistory.filter(
          (record) => getMonthKey(record.requestedAt) === monthKey,
        ).length,
        sortKey: monthKey,
        disponible: Math.max(limitAmount - adelantos, 0),
      };
    });

    return {
      limitAmount,
      usedAmount,
      usedPercent,
      nextPaymentNet: Math.max(dashboard.salary - usedAmount, 0),
      limitDelta: 0,
      monthlyAdvanceData,
    };
  }, [dashboard, advanceHistory]);
}
