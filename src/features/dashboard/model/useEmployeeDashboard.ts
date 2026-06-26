import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/model/AuthProvider";
import { registerCompanyAdvance } from "@/entities/employer-audit";
import {
  buildEmployeeDashboardSnapshot,
  deriveAdvanceMetricsFromHistory,
  parseEmployeeSalary,
  resolveAdvanceLimitsFromNomina,
  resolveEmpleadoFechaIngreso,
  type EmployeeDashboardSnapshot,
} from "@/entities/employee-dashboard";
import { useSolicitudesAdelanto } from "@/features/advance/model/useSolicitudesAdelanto";
import { useEmpleadoMe } from "@/features/advance/model/useEmpleadoMe";
import { isEmpleadoSession } from "@/shared/api";
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
  const {
    data: empleadoMe,
    isLoading: isNominaLoading,
    isSuccess: hasNomina,
  } = useEmpleadoMe();

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

    const fechaIngreso = resolveEmpleadoFechaIngreso(
      empleadoMe,
      session.empleado,
    );

    if (env.apiUrl) {
      if (isNominaLoading) {
        const pendingSnapshot = buildEmployeeDashboardSnapshot(
          getDisplayName(session.empleado.nombre),
          salary,
          metrics,
          undefined,
          new Date(),
          fechaIngreso,
        );

        return {
          ...pendingSnapshot,
          availableAdvance: 0,
          maxAdvanceLimit: 0,
          isNominaLoading: true,
        };
      }

      if (hasNomina && empleadoMe) {
        const limits = resolveAdvanceLimitsFromNomina(
          empleadoMe,
          metrics.totalAdvancedThisMonth,
        );

        const snapshot = buildEmployeeDashboardSnapshot(
          getDisplayName(session.empleado.nombre),
          salary,
          metrics,
          limits.maxAdvanceLimit,
          new Date(),
          fechaIngreso,
        );

        return {
          ...snapshot,
          availableAdvance: limits.availableAdvance,
          maxAdvanceLimit: limits.maxAdvanceLimit,
          advancePercentage: limits.advancePercentage,
          isNominaLoading: false,
        };
      }

      const fallbackSnapshot = buildEmployeeDashboardSnapshot(
        getDisplayName(session.empleado.nombre),
        salary,
        metrics,
        undefined,
        new Date(),
        fechaIngreso,
      );

      return {
        ...fallbackSnapshot,
        availableAdvance: 0,
        maxAdvanceLimit: 0,
        isNominaLoading: false,
      };
    }

    return buildEmployeeDashboardSnapshot(
      getDisplayName(session.empleado.nombre),
      salary,
      metrics,
      undefined,
      new Date(),
      fechaIngreso,
    );
    // version forces refresh when local metrics change
  }, [
    session,
    version,
    apiHistory,
    hasApiHistory,
    empleadoMe,
    hasNomina,
    isNominaLoading,
  ]);
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
