import { useQuery } from "@tanstack/react-query";
import { mapSolicitudToHistoryRecord } from "@/shared/api";
import { adelantosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";

export const SOLICITUDES_ADELANTO_QUERY_KEY = [
  "adelantos",
  "solicitudes",
] as const;

export function useSolicitudesAdelanto() {
  return useQuery({
    queryKey: SOLICITUDES_ADELANTO_QUERY_KEY,
    queryFn: async () => {
      const solicitudes = await adelantosEndpoints.listSolicitudes();
      return solicitudes.map(mapSolicitudToHistoryRecord);
    },
    enabled: Boolean(env.apiUrl),
    staleTime: 30_000,
  });
}
