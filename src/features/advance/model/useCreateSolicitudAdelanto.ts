import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, formatMontoForApi } from "@/shared/api";
import { adelantosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";
import { SOLICITUDES_ADELANTO_QUERY_KEY } from "./useSolicitudesAdelanto";
import { EMPLEADO_ME_QUERY_KEY } from "./useEmpleadoMe";
import { MI_SITUACION_FINANCIERA_QUERY_KEY } from "./useMiSituacionFinanciera";

interface CreateSolicitudInput {
  amount: number;
  numeroCuotas: number;
}

export function useCreateSolicitudAdelanto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, numeroCuotas }: CreateSolicitudInput) => {
      if (!env.apiUrl) {
        throw new ApiError(0, "/adelantos/solicitudes/", {
          detail: "La solicitud de adelanto requiere conexión con el servidor.",
        });
      }

      return adelantosEndpoints.createSolicitud({
        monto: formatMontoForApi(amount),
        numero_cuotas: numeroCuotas,
      });
    },
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
