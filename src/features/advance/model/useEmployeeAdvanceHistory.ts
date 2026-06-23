import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/model/AuthProvider";
import { useProfileView } from "@/features/auth";
import { useSolicitudesAdelanto } from "@/features/advance/model/useSolicitudesAdelanto";
import { enrichAdvanceHistoryRecords } from "@/features/advance/utils/enrichAdvanceHistoryRecords";
import { useEmpleadoMe } from "@/features/advance/model/useEmpleadoMe";
import { deserializeAdvanceHistory } from "@/entities/employee-dashboard";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory";
import { isEmpleadoSession } from "@/shared/api";
import { env } from "@/shared/config/env";
import {
  loadEmployeeDashboardMetrics,
  subscribeEmployeeDashboard,
} from "@/features/dashboard/model/employeeDashboardStorage";

function useLocalEmployeeAdvanceHistory(): AdvanceHistoryRecord[] {
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

export function useEmployeeAdvanceHistory(): AdvanceHistoryRecord[] {
  const { data: apiHistory, isSuccess } = useSolicitudesAdelanto();
  const localHistory = useLocalEmployeeAdvanceHistory();
  const { data: empleadoMe } = useEmpleadoMe();
  const profile = useProfileView();

  return useMemo(() => {
    const base =
      env.apiUrl && isSuccess && apiHistory ? apiHistory : localHistory;

    return enrichAdvanceHistoryRecords(base, empleadoMe, profile);
  }, [apiHistory, isSuccess, localHistory, empleadoMe, profile]);
}
