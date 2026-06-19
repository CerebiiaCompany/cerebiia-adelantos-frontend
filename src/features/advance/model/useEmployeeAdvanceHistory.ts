import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/model/AuthProvider";
import { deserializeAdvanceHistory } from "@/entities/employee-dashboard";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory";
import { isEmpleadoSession } from "@/shared/api";
import {
  loadEmployeeDashboardMetrics,
  subscribeEmployeeDashboard,
} from "@/features/dashboard/model/employeeDashboardStorage";

export function useEmployeeAdvanceHistory(): AdvanceHistoryRecord[] {
  const { session } = useAuth();
  const [version, setVersion] = useState(0);

  useEffect(
    () => subscribeEmployeeDashboard(() => setVersion((current) => current + 1)),
    [],
  );

  return useMemo(() => {
    if (!session || !isEmpleadoSession(session)) return [];

    const metrics = loadEmployeeDashboardMetrics(session.empleado.id);
    return deserializeAdvanceHistory(metrics.advanceHistory);
  }, [session, version]);
}
