import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  loadCompanyAdvances,
  mapToAdvanceAuditRecords,
  mapToLoanInstallmentRecords,
  mapToMovementRecords,
  buildPayrollClosureSnapshot,
  resolveEmpresaId,
  subscribeCompanyAdvances,
} from "@/entities/employer-audit";
import { empleadosEndpoints } from "@/shared/api/endpoints";

export const EMPLOYER_AUDIT_QUERY_KEY = ["employer", "audit"] as const;

function useEmployerAuditVersion() {
  const [version, setVersion] = useState(0);

  useEffect(
    () => subscribeCompanyAdvances(() => setVersion((current) => current + 1)),
    [],
  );

  return version;
}

export function useEmployerCompanyAdvances() {
  const version = useEmployerAuditVersion();

  return useQuery({
    queryKey: [...EMPLOYER_AUDIT_QUERY_KEY, "company-advances", version],
    queryFn: async () => {
      const empleados = await empleadosEndpoints.list();
      const empresaId = resolveEmpresaId(empleados);

      if (!empresaId) {
        return { empleados, empresaId: null, advances: [] };
      }

      return {
        empleados,
        empresaId,
        advances: loadCompanyAdvances(empresaId),
      };
    },
    staleTime: 30_000,
  });
}

export function useEmployerAdvanceAudit() {
  const version = useEmployerAuditVersion();

  return useQuery({
    queryKey: [...EMPLOYER_AUDIT_QUERY_KEY, "advance-monitoring", version],
    queryFn: async () => {
      const empleados = await empleadosEndpoints.list();
      const empresaId = resolveEmpresaId(empleados);
      const advances = empresaId ? loadCompanyAdvances(empresaId) : [];
      return mapToAdvanceAuditRecords(advances, empleados);
    },
    staleTime: 30_000,
  });
}

export function useEmployerLoanTracking() {
  const version = useEmployerAuditVersion();

  return useQuery({
    queryKey: [...EMPLOYER_AUDIT_QUERY_KEY, "loan-tracking", version],
    queryFn: async () => {
      const empleados = await empleadosEndpoints.list();
      const empresaId = resolveEmpresaId(empleados);
      const advances = empresaId ? loadCompanyAdvances(empresaId) : [];
      return mapToLoanInstallmentRecords(advances);
    },
    staleTime: 30_000,
  });
}

export function useEmployerMovementsLedger() {
  const version = useEmployerAuditVersion();

  return useQuery({
    queryKey: [...EMPLOYER_AUDIT_QUERY_KEY, "movements-ledger", version],
    queryFn: async () => {
      const empleados = await empleadosEndpoints.list();
      const empresaId = resolveEmpresaId(empleados);
      const advances = empresaId ? loadCompanyAdvances(empresaId) : [];
      return mapToMovementRecords(advances);
    },
    staleTime: 30_000,
  });
}

export function useEmployerPayrollClosure() {
  const version = useEmployerAuditVersion();

  return useQuery({
    queryKey: [...EMPLOYER_AUDIT_QUERY_KEY, "payroll-closure", version],
    queryFn: async () => {
      const empleados = await empleadosEndpoints.list();
      const empresaId = resolveEmpresaId(empleados);
      const advances = empresaId ? loadCompanyAdvances(empresaId) : [];
      return buildPayrollClosureSnapshot(advances);
    },
    staleTime: 30_000,
  });
}
