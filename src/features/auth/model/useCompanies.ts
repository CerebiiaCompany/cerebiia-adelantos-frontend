import { useQuery } from "@tanstack/react-query";
import { companiesEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";
import { demoListCompanies } from "./registerDemo";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      if (env.apiUrl) {
        return companiesEndpoints.list();
      }
      return demoListCompanies();
    },
    staleTime: 5 * 60 * 1000,
  });
}
