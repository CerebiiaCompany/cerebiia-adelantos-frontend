import { useMutation, useQueryClient } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints/empleados";

export function useResponderReporteDatoIncorrecto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { reporteId: string; respuesta: string }) =>
      empleadosEndpoints.responderReporteDatoIncorrecto(
        payload.reporteId,
        payload.respuesta,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["empleados", "reportes-datos"],
      });
    },
  });
}
