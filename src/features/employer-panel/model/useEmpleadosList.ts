import { useQuery } from "@tanstack/react-query";
import { fetchAllEmpleadosPages } from "@/shared/api/empleadoList";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import { applyLocalEmpleadoDeactivations } from "@/entities/empleado";

export const EMPLEADOS_QUERY_KEY = ["empleados"] as const;

export async function fetchEmpleadosList() {
  const empleados = await fetchAllEmpleadosPages((params) =>
    empleadosEndpoints.list(params),
  );
  return applyLocalEmpleadoDeactivations(empleados);
}

export function useEmpleadosList() {
  return useQuery({
    queryKey: EMPLEADOS_QUERY_KEY,
    queryFn: fetchEmpleadosList,
  });
}
