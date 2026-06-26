import { useQuery } from "@tanstack/react-query";
import { adelantosEndpoints, isEmpleadoSession } from "@/shared/api";
import { env } from "@/shared/config/env";
import { useAuth } from "@/features/auth";

export const EMPLEADO_ME_QUERY_KEY = ["empleados", "me"] as const;

export function useEmpleadoMe() {
  const { session } = useAuth();
  const isEmpleado = session ? isEmpleadoSession(session) : false;

  return useQuery({
    queryKey: EMPLEADO_ME_QUERY_KEY,
    queryFn: () => adelantosEndpoints.empleadoMe(),
    enabled: Boolean(env.apiUrl) && isEmpleado,
    staleTime: 60_000,
  });
}
