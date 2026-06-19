import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/model/AuthProvider";
import {
  buildEmployeeDashboardSnapshot,
  parseEmployeeSalary,
  type EmployeeDashboardSnapshot,
} from "@/entities/employee-dashboard";
import { isEmpleadoSession } from "@/shared/api";
import {
  loadEmployeeDashboardMetrics,
  recordEmployeeAdvance,
  subscribeEmployeeDashboard,
} from "./employeeDashboardStorage";

function getDisplayName(nombre: string): string {
  const firstName = nombre.trim().split(/\s+/)[0];
  return firstName || nombre;
}

export function useEmployeeDashboard(): EmployeeDashboardSnapshot | null {
  const { session } = useAuth();
  const [version, setVersion] = useState(0);

  useEffect(() => subscribeEmployeeDashboard(() => setVersion((v) => v + 1)), []);

  return useMemo(() => {
    if (!session || !isEmpleadoSession(session)) return null;

    const metrics = loadEmployeeDashboardMetrics(session.empleado.id);
    const salary = parseEmployeeSalary(session.empleado.salario);

    return buildEmployeeDashboardSnapshot(
      getDisplayName(session.empleado.nombre),
      salary,
      metrics,
    );
    // version forces refresh when local metrics change
  }, [session, version]);
}

export function useRecordEmployeeAdvance() {
  const { session } = useAuth();

  return useCallback(
    (amount: number) => {
      if (!session || !isEmpleadoSession(session) || amount <= 0) return;
      recordEmployeeAdvance(session.empleado.id, amount);
    },
    [session],
  );
}
