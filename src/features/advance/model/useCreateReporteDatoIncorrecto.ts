import { useMutation, useQueryClient } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints/empleados";

export function useCreateReporteDatoIncorrecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      campos_reportados: string[];
      mensaje: string;
      evidencias: File[];
    }) => empleadosEndpoints.createReporteDatoIncorrecto(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["empleados", "reportes-datos"],
      });
    },
  });
}
