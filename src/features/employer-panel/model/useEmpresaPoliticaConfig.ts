import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { empresasEndpoints } from "@/shared/api/endpoints/empresas";
import type { UpdateEmpresaConfiguracionRequest } from "@/shared/api/types/empresa";
import { env } from "@/shared/config/env";
import { useAuth } from "@/features/auth";
import { isSystemUserSession } from "@/shared/api";

export const EMPRESA_POLITICA_CONFIG_QUERY_KEY = [
  "empresa",
  "me",
  "configuracion",
] as const;

export function useEmpresaPoliticaConfig() {
  const { session } = useAuth();
  const isEmployer =
    session &&
    isSystemUserSession(session) &&
    (session.user.role === "empresa" || session.user.role === "super_admin");

  return useQuery({
    queryKey: EMPRESA_POLITICA_CONFIG_QUERY_KEY,
    queryFn: async () => {
      return empresasEndpoints.getConfiguracion();
    },
    enabled: Boolean(env.apiUrl) && Boolean(isEmployer),
    staleTime: 30_000,
  });
}

export function useUpdateEmpresaPoliticaConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateEmpresaConfiguracionRequest) => {
      return empresasEndpoints.updateConfiguracion(payload);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(EMPRESA_POLITICA_CONFIG_QUERY_KEY, data);
      queryClient.invalidateQueries({
        queryKey: EMPRESA_POLITICA_CONFIG_QUERY_KEY,
      });
      toast.success("Configuración de antigüedad mínima guardada correctamente.");
    },
    onError: (error: unknown) => {
      const err = error as { message?: string };
      const message =
        err?.message ||
        "No se pudo guardar la configuración de antigüedad mínima.";
      toast.error(message);
    },
  });
}
