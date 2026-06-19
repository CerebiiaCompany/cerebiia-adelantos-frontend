import { useMutation } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints";

export function useVerifyPreRegistro() {
  return useMutation({
    mutationFn: (documento: string) =>
      empleadosEndpoints.verificarPreRegistro({ documento }),
  });
}
