import { useQuery } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";

export const BANCOS_QUERY_KEY = ["empleados", "bancos"] as const;

export function useBancos() {
  return useQuery({
    queryKey: BANCOS_QUERY_KEY,
    queryFn: () => empleadosEndpoints.listBancos(),
    enabled: Boolean(env.apiUrl),
    staleTime: 10 * 60_000,
  });
}
