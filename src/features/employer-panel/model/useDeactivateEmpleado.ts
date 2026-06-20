import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, empleadosEndpoints } from "@/shared/api";
import type { EmpleadoDTO } from "@/shared/api/types";
import { deactivateEmpleadoLocally } from "@/entities/empleado";
import { EMPLEADOS_QUERY_KEY } from "./useEmpleadosList";

function shouldUseLocalDeactivation(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 404 || error.status === 405 || error.status === 501)
  );
}

export function useDeactivateEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (empleado: EmpleadoDTO) => {
      try {
        return await empleadosEndpoints.deactivate(empleado.id);
      } catch (error) {
        if (!shouldUseLocalDeactivation(error)) {
          throw error;
        }

        deactivateEmpleadoLocally(empleado.empresa_id, empleado.id);
        return { ...empleado, estado: "inactivo" as const };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLEADOS_QUERY_KEY });
    },
  });
}
