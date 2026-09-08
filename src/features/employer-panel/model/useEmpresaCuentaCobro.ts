import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { adelantosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";

export const EMPRESA_CUENTA_COBRO_QUERY_KEY = [
  "adelantos",
  "empresa",
  "cuenta-cobro",
] as const;

export function useEmpresaCuentaCobro(periodo: string) {
  return useQuery({
    queryKey: [...EMPRESA_CUENTA_COBRO_QUERY_KEY, periodo],
    queryFn: async () => {
      try {
        return await adelantosEndpoints.getCuentaCobroEmpresa(periodo);
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(env.apiUrl) && Boolean(periodo),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
