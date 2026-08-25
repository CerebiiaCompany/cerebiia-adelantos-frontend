import { useMutation, useQueryClient } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import type { ReporteDatoIncorrectoDTO } from "@/shared/api/types/empleado";

export interface EnviarMensajeSoporteMeInput {
  reporteId: string;
  mensaje: string;
  evidencias?: File[];
}

export function useEnviarMensajeSoporteMe() {
  const queryClient = useQueryClient();

  return useMutation<ReporteDatoIncorrectoDTO, Error, EnviarMensajeSoporteMeInput>({
    mutationFn: ({ reporteId, mensaje, evidencias }) =>
      empleadosEndpoints.enviarMensajeReporteDatoIncorrectoMe(reporteId, {
        mensaje,
        evidencias,
      }),
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
