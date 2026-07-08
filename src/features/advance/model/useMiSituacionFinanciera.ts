import { useQuery } from "@tanstack/react-query";
import { adelantosEndpoints } from "@/shared/api/endpoints";
import { isEmpleadoSession } from "@/shared/api";
import { env } from "@/shared/config/env";
import { useAuth } from "@/features/auth";

export const MI_SITUACION_FINANCIERA_QUERY_KEY = [
  "adelantos",
  "mi-situacion-financiera",
] as const;

export function useMiSituacionFinanciera() {
  const { session } = useAuth();
  const isEmpleado = session ? isEmpleadoSession(session) : false;

  return useQuery({
    queryKey: MI_SITUACION_FINANCIERA_QUERY_KEY,
    queryFn: () => adelantosEndpoints.miSituacionFinanciera(),
    enabled: Boolean(env.apiUrl) && isEmpleado,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
