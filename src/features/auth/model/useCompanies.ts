import { useQuery } from "@tanstack/react-query";
import { companiesEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";
import { demoListCompanies } from "./registerDemo";

/**
 * GET /companies no existe aún en backend.
 * Usa demo hasta que el backend exponga listado de empresas.
 */
export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      if (!env.apiUrl) {
        return demoListCompanies();
      }

      try {
        return await companiesEndpoints.list();
      } catch {
        return demoListCompanies();
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
