import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adelantosEndpoints } from "@/shared/api/endpoints";
import { EMPLEADO_ME_QUERY_KEY } from "./useEmpleadoMe";
import { SOLICITUDES_ADELANTO_QUERY_KEY } from "./useSolicitudesAdelanto";
import { MI_SITUACION_FINANCIERA_QUERY_KEY } from "./useMiSituacionFinanciera";

export function useCancelSolicitudAdelanto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (solicitudId: string) =>
      adelantosEndpoints.cancelSolicitud(solicitudId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: SOLICITUDES_ADELANTO_QUERY_KEY,
      });
      void queryClient.invalidateQueries({ queryKey: EMPLEADO_ME_QUERY_KEY });
      void queryClient.invalidateQueries({
        queryKey: MI_SITUACION_FINANCIERA_QUERY_KEY,
      });
    },
  });
}
