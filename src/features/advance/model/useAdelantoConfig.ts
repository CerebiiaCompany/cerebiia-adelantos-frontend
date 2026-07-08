import { useMemo } from "react";
import {
  resolveAdelantoConfigFromEmpleadoMe,
  type ParsedAdelantoConfiguracion,
} from "@/shared/api";
import { useEmpleadoMe } from "./useEmpleadoMe";
import { useMiSituacionFinanciera } from "./useMiSituacionFinanciera";

function mapSituacionToConfig(
  situacion: NonNullable<
    ReturnType<typeof useMiSituacionFinanciera>["data"]
  >,
): ParsedAdelantoConfiguracion {
  const tarifa = Number.parseFloat(situacion.tarifa_por_cuota);
  const porcentaje = Number.parseFloat(situacion.porcentaje_maximo);

  return {
    porcentajeMaximoAdelanto: Number.isNaN(porcentaje) ? 30 : porcentaje,
    numeroMaximoCuotas:
      situacion.cuotas_maximas > 0 ? situacion.cuotas_maximas : 3,
    plazoMaximoDias:
      situacion.plazo_maximo_dias > 0 ? situacion.plazo_maximo_dias : 90,
    tarifaFijaPorCuota: Number.isNaN(tarifa) ? 8_000 : Math.round(tarifa),
    updatedAt: "",
  };
}

export function useAdelantoConfig() {
  const empleadoQuery = useEmpleadoMe();
  const situacionQuery = useMiSituacionFinanciera();

  const data = useMemo(() => {
    if (situacionQuery.data) {
      return mapSituacionToConfig(situacionQuery.data);
    }

    if (empleadoQuery.data) {
      return resolveAdelantoConfigFromEmpleadoMe(empleadoQuery.data) ?? undefined;
    }

    return undefined;
  }, [situacionQuery.data, empleadoQuery.data]);

  return {
    ...empleadoQuery,
    isLoading: empleadoQuery.isLoading || situacionQuery.isLoading,
    isError: empleadoQuery.isError || situacionQuery.isError,
    data,
    hasConfig: data != null,
    solicitudActiva: situacionQuery.data?.resumen.solicitud_activa ?? false,
    saldoDisponible: situacionQuery.data?.saldo_disponible,
    montoMaximoSolicitable: situacionQuery.data?.monto_maximo_solicitable,
  };
}
