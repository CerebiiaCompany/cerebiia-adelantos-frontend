import { useQuery } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";

export const BANCOS_QUERY_KEY = ["empleados", "bancos"] as const;

export async function fetchBancosList() {
  return empleadosEndpoints.listBancos();
}

export function useBancos(enabled = true) {
  return useQuery({
    queryKey: BANCOS_QUERY_KEY,
    queryFn: fetchBancosList,
    enabled: Boolean(env.apiUrl) && enabled,
    staleTime: 10 * 60_000,
    retry: 2,
  });
}
