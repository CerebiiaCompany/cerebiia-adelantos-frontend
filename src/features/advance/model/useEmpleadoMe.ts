import { useQuery } from "@tanstack/react-query";
import { adelantosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";

export const EMPLEADO_ME_QUERY_KEY = ["empleados", "me"] as const;

export function useEmpleadoMe() {
  return useQuery({
    queryKey: EMPLEADO_ME_QUERY_KEY,
    queryFn: () => adelantosEndpoints.empleadoMe(),
    enabled: Boolean(env.apiUrl),
    staleTime: 60_000,
  });
}
