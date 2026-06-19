import { useQuery } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints";

export const EMPLEADOS_QUERY_KEY = ["empleados"] as const;

export function useEmpleadosList() {
  return useQuery({
    queryKey: EMPLEADOS_QUERY_KEY,
    queryFn: empleadosEndpoints.list,
  });
}
