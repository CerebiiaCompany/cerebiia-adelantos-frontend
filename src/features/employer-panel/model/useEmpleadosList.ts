import { useQuery } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import { applyLocalEmpleadoDeactivations } from "@/entities/empleado";

export const EMPLEADOS_QUERY_KEY = ["empleados"] as const;

export function useEmpleadosList() {
  return useQuery({
    queryKey: EMPLEADOS_QUERY_KEY,
    queryFn: async () => {
      const empleados = await empleadosEndpoints.list();
      return applyLocalEmpleadoDeactivations(empleados);
    },
  });
}
