import { useMemo } from "react";
import {
  calculateMaxAdvanceLimit,
  countsTowardAdvanceLimit,
  getAdvanceMonthKey,
} from "@/entities/employee-dashboard";
import { useEmployeeDashboard } from "@/features/dashboard";
import { useEmployeeAdvanceHistory } from "@/features/advance/model/useEmployeeAdvanceHistory";
import { buildControlMonthlyAdvanceData } from "./buildControlMonthlyAdvanceData";
import {
  calculateCurrentMonthPayrollDeduction,
  calculateNextPaymentNet,
} from "./calculateNextPaymentNet";

export function useEmployeeControlData() {
  const dashboard = useEmployeeDashboard();
  const advanceHistory = useEmployeeAdvanceHistory();

  return useMemo(() => {
    if (!dashboard) return null;

    const limitAmount =
      dashboard.maxAdvanceLimit > 0
        ? dashboard.maxAdvanceLimit
        : calculateMaxAdvanceLimit(dashboard.salary);
    const advancePercentage = dashboard.advancePercentage ?? 30;
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

    const payrollDeductionThisMonth =
      calculateCurrentMonthPayrollDeduction(advanceHistory);
    const nextPaymentNet = calculateNextPaymentNet(
      dashboard.salary,
      payrollDeductionThisMonth,
    );

    return {
      limitAmount,
      advancePercentage,
      usedAmount,
      usedPercent,
      payrollDeductionThisMonth,
      nextPaymentNet,
      limitDelta: 0,
      monthlyAdvanceData: buildControlMonthlyAdvanceData(
        advanceHistory,
        limitAmount,
      ),
    };
  }, [dashboard, advanceHistory]);
}
