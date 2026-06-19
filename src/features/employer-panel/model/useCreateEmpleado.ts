import { useMutation, useQueryClient } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import type { CreateEmpleadoRequest } from "@/shared/api/types";
import { EMPLEADOS_QUERY_KEY } from "./useEmpleadosList";

export function useCreateEmpleado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmpleadoRequest) => empleadosEndpoints.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLEADOS_QUERY_KEY });
    },
  });
}
