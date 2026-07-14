import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  loadCompanyAdvances,
  mapHistorialEmpresaToRegisteredCompanyAdvances,
  mapToAdvanceAuditRecords,
  mapToLoanInstallmentRecords,
  mapToMovementRecords,
  buildPayrollClosureSnapshot,
  resolveEmpresaId,
  type RegisteredCompanyAdvance,
} from "@/entities/employer-audit";
import { adelantosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";
import {
  EMPLEADOS_QUERY_KEY,
  fetchEmpleadosList,
} from "./useEmpleadosList";

export const EMPLOYER_AUDIT_QUERY_KEY = ["employer", "audit"] as const;

async function fetchEmployerAdvances(
  queryClient: QueryClient,
): Promise<{
  empleados: Awaited<ReturnType<typeof fetchEmpleadosList>>;
  advances: RegisteredCompanyAdvance[];
  empresaId: string | null;
}> {
  const empleados = await queryClient.fetchQuery({
    queryKey: EMPLEADOS_QUERY_KEY,
    queryFn: fetchEmpleadosList,
  });
  const empresaId = resolveEmpresaId(empleados);

  if (!env.apiUrl) {
    return {
      empleados,
      empresaId,
      advances: empresaId ? loadCompanyAdvances(empresaId) : [],
    };
  }

  const historial = await adelantosEndpoints.listHistorialSolicitudesEmpresa();
  return {
    empleados,
    empresaId,
    advances: mapHistorialEmpresaToRegisteredCompanyAdvances(
      historial,
      empleados,
      empresaId,
    ),
  };
}

export function useEmployerCompanyAdvances() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...EMPLOYER_AUDIT_QUERY_KEY, "company-advances"],
    queryFn: () => fetchEmployerAdvances(queryClient),
    staleTime: 30_000,
  });
}

export function useEmployerAdvanceAudit() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...EMPLOYER_AUDIT_QUERY_KEY, "advance-monitoring"],
    queryFn: async () => {
      const { empleados, advances } = await fetchEmployerAdvances(queryClient);
      return mapToAdvanceAuditRecords(advances, empleados);
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useEmployerLoanTracking() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...EMPLOYER_AUDIT_QUERY_KEY, "loan-tracking"],
    queryFn: async () => {
      const { advances } = await fetchEmployerAdvances(queryClient);
      return mapToLoanInstallmentRecords(advances);
    },
    staleTime: 30_000,
  });
}

export function useEmployerMovementsLedger() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...EMPLOYER_AUDIT_QUERY_KEY, "movements-ledger"],
    queryFn: async () => {
      const { advances } = await fetchEmployerAdvances(queryClient);
      return mapToMovementRecords(advances);
    },
    staleTime: 30_000,
  });
}

export function useEmployerPayrollClosure() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...EMPLOYER_AUDIT_QUERY_KEY, "payroll-closure"],
    queryFn: async () => {
      const { advances } = await fetchEmployerAdvances(queryClient);
      return buildPayrollClosureSnapshot(advances);
    },
    staleTime: 30_000,
  });
}
