import { useQuery } from "@tanstack/react-query";
import { mapSolicitudToHistoryRecord, isEmpleadoSession } from "@/shared/api";
import { adelantosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";
import { useAuth } from "@/features/auth";

export const SOLICITUDES_ADELANTO_QUERY_KEY = [
  "adelantos",
  "solicitudes",
] as const;

export function useSolicitudesAdelanto() {
  const { session } = useAuth();
  const isEmpleado = session ? isEmpleadoSession(session) : false;

  return useQuery({
    queryKey: SOLICITUDES_ADELANTO_QUERY_KEY,
    queryFn: async () => {
      const solicitudes = await adelantosEndpoints.listSolicitudes();

      const enriched = await Promise.all(
        solicitudes.map(async (sol) => {
          if (
            Array.isArray((sol as Record<string, unknown>).cuotas) &&
            ((sol as Record<string, unknown>).cuotas as unknown[]).length > 0
          ) {
            return sol;
          }
          if (sol.estado === "rechazado") {
            return sol;
          }
          try {
            const detail = await adelantosEndpoints.getSolicitud(sol.id);
            if (detail?.cuotas && Array.isArray(detail.cuotas)) {
              return {
                ...sol,
                ...detail.solicitud,
                cuotas: detail.cuotas,
              };
            }
          } catch {
            // Silencioso en caso de error de red
          }
          return sol;
        }),
      );

      return enriched.map(mapSolicitudToHistoryRecord);
    },
    enabled: Boolean(env.apiUrl) && isEmpleado,
    staleTime: 5_000,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
  });
}
