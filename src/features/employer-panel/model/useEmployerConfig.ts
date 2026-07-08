import { useQuery } from "@tanstack/react-query";
import { mapAdelantoConfiguracion } from "@/shared/api";
import { configuracionEndpoints } from "@/shared/api/endpoints";
import { isSystemUserSession } from "@/shared/api";
import { env } from "@/shared/config/env";
import { useAuth } from "@/features/auth";

export const EMPLOYER_CONFIG_QUERY_KEY = ["employer", "configuracion"] as const;

export function useEmployerConfig() {
  const { session } = useAuth();
  const isEmpresa =
    session &&
    isSystemUserSession(session) &&
    session.user.role === "empresa";

  return useQuery({
    queryKey: EMPLOYER_CONFIG_QUERY_KEY,
    queryFn: async () => {
      const dto = await configuracionEndpoints.getAdelantos();
      return mapAdelantoConfiguracion(dto);
    },
    enabled: Boolean(env.apiUrl) && Boolean(isEmpresa),
    staleTime: 60_000,
  });
}
