import { useMutation } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import type { VerificarPreRegistroRequest } from "@/shared/api/types";

export function useVerifyPreRegistro() {
  return useMutation({
    mutationFn: (data: VerificarPreRegistroRequest) =>
      empleadosEndpoints.verificarPreRegistro(data),
  });
}
