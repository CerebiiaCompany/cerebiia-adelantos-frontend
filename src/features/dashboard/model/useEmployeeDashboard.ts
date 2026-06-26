import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/model/AuthProvider";
import { registerCompanyAdvance } from "@/entities/employer-audit";
import {
  buildEmployeeDashboardSnapshot,
  deriveAdvanceMetricsFromHistory,
  parseEmployeeSalary,
  resolveEmpleadoFechaIngreso,
  type EmployeeDashboardSnapshot,
} from "@/entities/employee-dashboard";
import { useSolicitudesAdelanto } from "@/features/advance/model/useSolicitudesAdelanto";
import { useEmpleadoMe } from "@/features/advance/model/useEmpleadoMe";
import { isEmpleadoSession, parseApiDecimalAmount } from "@/shared/api";
import { env } from "@/shared/config/env";
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
  const { data: apiHistory, isSuccess: hasApiHistory } = useSolicitudesAdelanto();
  const { data: empleadoMe } = useEmpleadoMe();

  useEffect(() => subscribeEmployeeDashboard(() => setVersion((v) => v + 1)), []);

  return useMemo(() => {
    if (!session || !isEmpleadoSession(session)) return null;

    const localMetrics = loadEmployeeDashboardMetrics(session.empleado.id);
    const salary = parseEmployeeSalary(
      empleadoMe?.salario ?? session.empleado.salario,
    );

    const metrics =
      env.apiUrl && hasApiHistory && apiHistory
        ? {
            ...localMetrics,
            ...deriveAdvanceMetricsFromHistory(apiHistory),
          }
        : localMetrics;

    const parsedMaxLimit = empleadoMe?.monto_maximo_adelanto
      ? Number.parseFloat(empleadoMe.monto_maximo_adelanto)
      : Number.NaN;
    const maxAdvanceLimit = Number.isNaN(parsedMaxLimit)
      ? undefined
      : Math.round(parsedMaxLimit);

    const fechaIngreso = resolveEmpleadoFechaIngreso(
      empleadoMe,
      session.empleado,
    );

    const snapshot = buildEmployeeDashboardSnapshot(
      getDisplayName(session.empleado.nombre),
      salary,
      metrics,
      maxAdvanceLimit,
      new Date(),
      fechaIngreso,
    );

    const saldoDisponible = parseApiDecimalAmount(empleadoMe?.saldo_disponible);
    if (saldoDisponible !== undefined) {
      return {
        ...snapshot,
        availableAdvance: saldoDisponible,
      };
    }

    return snapshot;
    // version forces refresh when local metrics change
  }, [session, version, apiHistory, hasApiHistory, empleadoMe]);
}

export function useRecordEmployeeAdvance() {
  const { session } = useAuth();

  return useCallback(
    (amount: number, installments = 1) => {
      if (!session || !isEmpleadoSession(session) || amount <= 0) return;

      const { empleado } = session;
      recordEmployeeAdvance(empleado.id, amount);
      registerCompanyAdvance({
        empresaId: empleado.empresa_id,
        employeeId: empleado.id,
        employeeName: empleado.nombre,
        employeeDocument: empleado.documento,
        baseSalary: parseEmployeeSalary(empleado.salario),
        advancedAmount: amount,
        installments,
      });
    },
    [session],
  );
}
