import { useMutation, useQueryClient } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api";
import type { EmpleadoDTO } from "@/shared/api/types";
import { EMPLEADOS_QUERY_KEY } from "./useEmpleadosList";
import { EMPLEADOS_METRICAS_QUERY_KEY } from "./useEmpleadosMetricas";

function invalidateEmpleadoQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: EMPLEADOS_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: EMPLEADOS_METRICAS_QUERY_KEY });
}

export function useDeactivateEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (empleado: EmpleadoDTO) =>
      empleadosEndpoints.suspender(empleado.id),
    onSuccess: () => invalidateEmpleadoQueries(queryClient),
  });
}

export function useReactivarEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (empleado: EmpleadoDTO) =>
      empleadosEndpoints.reactivar(empleado.id),
    onSuccess: () => invalidateEmpleadoQueries(queryClient),
  });
}
