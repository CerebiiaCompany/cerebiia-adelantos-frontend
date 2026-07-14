import { useQuery } from "@tanstack/react-query";
import { adelantosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";

export const SOLICITUD_DETALLE_QUERY_KEY = ["adelantos", "solicitud"] as const;

export function useSolicitudDetalle(solicitudId: string | null) {
  return useQuery({
    queryKey: [...SOLICITUD_DETALLE_QUERY_KEY, solicitudId],
    queryFn: () => adelantosEndpoints.getSolicitud(solicitudId!),
    enabled: Boolean(env.apiUrl) && Boolean(solicitudId),
    staleTime: 30_000,
  });
}
