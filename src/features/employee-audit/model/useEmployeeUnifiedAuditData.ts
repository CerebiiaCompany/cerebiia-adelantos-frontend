import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuditoriaCambiosMe } from "@/features/auditoria-cambios";
import { useEmployeeDashboard } from "@/features/dashboard/model/useEmployeeDashboard";
import { adelantosEndpoints } from "@/shared/api/endpoints/adelantos";
import {
  deriveEmployeeUnifiedAudit,
  type EnrichedSolicitudWithCuotas,
  type EmployeeUnifiedAuditRecord,
  type EmployeeAuditSummaryMetrics,
} from "@/entities/employee-audit";

export function useEmployeeUnifiedAuditData(): {
  records: EmployeeUnifiedAuditRecord[];
  metrics: EmployeeAuditSummaryMetrics;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
} {
  const profileQuery = useAuditoriaCambiosMe({ page: 1, page_size: 100 });
  const dashboard = useEmployeeDashboard();

  const solicitudesQuery = useQuery<EnrichedSolicitudWithCuotas[]>({
    queryKey: ["employee-solicitudes-audit-enriched"],
    queryFn: async () => {
      const basicList = await adelantosEndpoints.listSolicitudes();
      if (!basicList || basicList.length === 0) return [];

      const enriched = await Promise.allSettled(
        basicList.map(async (solicitud) => {
          try {
            const detail = await adelantosEndpoints.getSolicitud(solicitud.id);
            return {
              ...solicitud,
              cuotas: detail.cuotas,
            };
          } catch {
            return solicitud;
          }
        }),
      );

      return enriched.map((res, index) =>
        res.status === "fulfilled" ? res.value : basicList[index],
      );
    },
    staleTime: 30_000,
  });

  const isLoading = profileQuery.isLoading || solicitudesQuery.isLoading;
  const isError = profileQuery.isError && solicitudesQuery.isError;

  const { records, metrics } = useMemo(() => {
    return deriveEmployeeUnifiedAudit({
      profileAuditRecords: profileQuery.data?.results ?? [],
      solicitudes: solicitudesQuery.data ?? [],
      availableAdvance: dashboard?.availableAdvance ?? 0,
      maxAdvanceLimit: dashboard?.maxAdvanceLimit ?? 0,
    });
  }, [
    profileQuery.data?.results,
    solicitudesQuery.data,
    dashboard?.availableAdvance,
    dashboard?.maxAdvanceLimit,
  ]);

  const refetch = async () => {
    await Promise.all([
      profileQuery.refetch(),
      solicitudesQuery.refetch(),
    ]);
  };

  return {
    records,
    metrics,
    isLoading,
    isError,
    refetch,
  };
}
