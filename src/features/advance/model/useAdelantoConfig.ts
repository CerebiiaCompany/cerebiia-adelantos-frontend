import { useMemo } from "react";
import { resolveAdelantoConfigFromEmpleadoMe } from "@/shared/api";
import { useEmpleadoMe } from "./useEmpleadoMe";

export function useAdelantoConfig() {
  const empleadoQuery = useEmpleadoMe();

  const data = useMemo(
    () =>
      empleadoQuery.data
        ? resolveAdelantoConfigFromEmpleadoMe(empleadoQuery.data)
        : undefined,
    [empleadoQuery.data],
  );

  return {
    ...empleadoQuery,
    data: data ?? undefined,
    hasConfig: data != null,
  };
}
