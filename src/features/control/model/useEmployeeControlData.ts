import { useMemo } from "react";
import {
  calculateMaxAdvanceLimit,
  countsTowardAdvanceLimit,
  getAdvanceMonthKey,
} from "@/entities/employee-dashboard";
import { useEmployeeDashboard } from "@/features/dashboard";
import { useEmployeeAdvanceHistory } from "@/features/advance/model/useEmployeeAdvanceHistory";
import { buildControlMonthlyAdvanceData } from "./buildControlMonthlyAdvanceData";

export function useEmployeeControlData() {
  const dashboard = useEmployeeDashboard();
  const advanceHistory = useEmployeeAdvanceHistory();

  return useMemo(() => {
    if (!dashboard) return null;

    const limitAmount = calculateMaxAdvanceLimit(dashboard.salary);
    const currentMonthKey = getAdvanceMonthKey(new Date());
    const usedAmount = advanceHistory
      .filter(
        (record) =>
          countsTowardAdvanceLimit(record.status) &&
          getAdvanceMonthKey(record.requestedAt) === currentMonthKey,
      )
      .reduce((sum, record) => sum + record.amount, 0);
    const usedPercent =
      limitAmount > 0 ? Math.round((usedAmount / limitAmount) * 100) : 0;

    return {
      limitAmount,
      usedAmount,
      usedPercent,
      nextPaymentNet: Math.max(dashboard.salary - usedAmount, 0),
      limitDelta: 0,
      monthlyAdvanceData: buildControlMonthlyAdvanceData(
        advanceHistory,
        limitAmount,
      ),
    };
  }, [dashboard, advanceHistory]);
}
