import { useMutation, useQueryClient } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import type { ReporteDatoIncorrectoDTO } from "@/shared/api/types/empleado";

export interface FinalizarReporteInput {
  reporteId: string;
  conclusion?: string;
}

export function useFinalizarReporteDatoIncorrecto() {
  const queryClient = useQueryClient();

  return useMutation<ReporteDatoIncorrectoDTO, Error, FinalizarReporteInput>({
    mutationFn: ({ reporteId, conclusion }) =>
      empleadosEndpoints.finalizarReporteDatoIncorrecto(reporteId, conclusion),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["empleados", "reportes-datos"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["notificaciones"],
      });
    },
  });
}
