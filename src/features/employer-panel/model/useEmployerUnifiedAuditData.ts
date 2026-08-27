import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuditoriaCambiosEmpresa } from "@/features/auditoria-cambios";
import { useEmployerConfig } from "@/features/employer-panel/model/useEmployerConfig";
import { adelantosEndpoints } from "@/shared/api/endpoints/adelantos";
import {
  deriveEmployerUnifiedAudit,
  type EnrichedHistorialSolicitudEmpresa,
  type EmployerUnifiedAuditRecord,
  type EmployerAuditSummaryMetrics,
} from "@/entities/employer-audit";

export function useEmployerUnifiedAuditData(): {
  records: EmployerUnifiedAuditRecord[];
  metrics: EmployerAuditSummaryMetrics;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
} {
  const profileQuery = useAuditoriaCambiosEmpresa({ page: 1, page_size: 100 });
  const { data: config, isLoading: isConfigLoading, isError: isConfigError, refetch: refetchConfig } = useEmployerConfig();

  const advancesQuery = useQuery<EnrichedHistorialSolicitudEmpresa[]>({
    queryKey: ["employer-advances-audit-enriched"],
    queryFn: async () => {
      const basicList = await adelantosEndpoints.listHistorialSolicitudesEmpresa();
      if (!basicList || basicList.length === 0) return [];

      const missingCuotasItems = basicList.filter(
        (item) => !item.cuotas || item.cuotas.length === 0,
      );

      if (missingCuotasItems.length > 0) {
        const details = await Promise.allSettled(
          missingCuotasItems.map((item) => adelantosEndpoints.getSolicitud(item.id)),
        );

        details.forEach((res, index) => {
          if (res.status === "fulfilled" && res.value?.cuotas) {
            missingCuotasItems[index].cuotas = res.value.cuotas;
          }
        });
      }

      return basicList;
    },
    staleTime: 30_000,
  });

  const isLoading = profileQuery.isLoading || advancesQuery.isLoading || isConfigLoading;
  const isError = profileQuery.isError && advancesQuery.isError;

  const { records, metrics } = useMemo(() => {
    return deriveEmployerUnifiedAudit({
      employeeProfileAudits: profileQuery.data?.results ?? [],
      advances: advancesQuery.data ?? [],
      config: config ?? null,
    });
  }, [
    profileQuery.data?.results,
    advancesQuery.data,
    config,
  ]);

  const refetch = async () => {
    await Promise.all([
      profileQuery.refetch(),
      advancesQuery.refetch(),
      refetchConfig(),
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
