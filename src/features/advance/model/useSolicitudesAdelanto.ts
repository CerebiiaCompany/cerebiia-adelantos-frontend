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
      return solicitudes.map(mapSolicitudToHistoryRecord);
    },
    enabled: Boolean(env.apiUrl) && isEmpleado,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
