import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  empleadosEndpoints,
  mapCreateEmpleadoFormToRequest,
} from "@/shared/api";
import type { CreateEmpleadoFormValues } from "@/shared/validations/empleado.schema";
import { EMPLEADOS_QUERY_KEY } from "./useEmpleadosList";

export function useCreateEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmpleadoFormValues) =>
      empleadosEndpoints.create(mapCreateEmpleadoFormToRequest(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLEADOS_QUERY_KEY });
    },
  });
}
