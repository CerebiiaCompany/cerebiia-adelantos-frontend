import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  empleadosEndpoints,
  mapCreateEmpleadoFormToRequest,
} from "@/shared/api";
import type { CreateEmpleadoFormValues } from "@/shared/validations/empleado.schema";
import { EMPLEADOS_QUERY_KEY } from "./useEmpleadosList";

interface UpdateEmpleadoInput {
  empleadoId: string;
  values: CreateEmpleadoFormValues;
}

export function useUpdateEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ empleadoId, values }: UpdateEmpleadoInput) =>
      empleadosEndpoints.update(
        empleadoId,
        mapCreateEmpleadoFormToRequest(values),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLEADOS_QUERY_KEY });
    },
  });
}
