import { useQuery } from "@tanstack/react-query";
import { mapAdelantoConfiguracion } from "@/shared/api";
import { configuracionEndpoints } from "@/shared/api/endpoints";
import { isSystemUserSession } from "@/shared/api";
import { env } from "@/shared/config/env";
import { useAuth } from "@/features/auth";

export const EMPLOYER_CONFIG_QUERY_KEY = ["employer", "configuracion"] as const;

export function useEmployerConfig() {
  const { session } = useAuth();
  const isSystemUser =
    session &&
    isSystemUserSession(session) &&
    (session.user.role === "empresa" || session.user.role === "super_admin");

  return useQuery({
    queryKey: EMPLOYER_CONFIG_QUERY_KEY,
    queryFn: async () => {
      const dto = await configuracionEndpoints.getAdelantos();
      return mapAdelantoConfiguracion(dto);
    },
    enabled: Boolean(env.apiUrl) && Boolean(isSystemUser),
    staleTime: 0,
    refetchInterval: 5_000,
    refetchOnWindowFocus: true,
  });
}

/** Alias para useEmployerConfig según convención de configuración efectiva */
export const useConfiguracion = useEmployerConfig;

