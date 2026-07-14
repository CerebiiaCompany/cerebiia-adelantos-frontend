import { useQuery } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import { isSystemUserSession } from "@/shared/api";
import { env } from "@/shared/config/env";
import { useAuth } from "@/features/auth";

export const EMPLEADOS_METRICAS_QUERY_KEY = ["empleados", "metricas"] as const;

export function useEmpleadosMetricas() {
  const { session } = useAuth();
  const isEmpresa =
    session &&
    isSystemUserSession(session) &&
    session.user.role === "empresa";

  return useQuery({
    queryKey: EMPLEADOS_METRICAS_QUERY_KEY,
    queryFn: () => empleadosEndpoints.metricas(),
    enabled: Boolean(env.apiUrl) && Boolean(isEmpresa),
    staleTime: 30_000,
  });
}
