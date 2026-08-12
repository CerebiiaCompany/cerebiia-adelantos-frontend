import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ApiError } from "@/shared/api";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import type { ActivarEmpleadoRequest } from "@/shared/api/types";
import { ROUTES } from "@/shared/config/routes";
import { clearRegisterDraft } from "./useRegisterDraftPersistence.types";
import { pendingLoginCredentialsStorage } from "./pendingLoginCredentialsStorage";

export function useActivateEmpleado() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ActivarEmpleadoRequest) =>
      empleadosEndpoints.activar(data),
    onSuccess: async (_response, variables) => {
      const documentoLogin =
        variables.documento_actualizado?.trim() || variables.documento.trim();

      pendingLoginCredentialsStorage.set({
        loginType: "empleado",
        identifier: documentoLogin,
        password: variables.password,
      });

      await clearRegisterDraft();
      toast.success("Cuenta activada. Ya puedes ingresar con tu documento.");
      navigate(ROUTES.login, { replace: true });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "No pudimos activar tu cuenta. Inténtalo de nuevo.",
      );
    },
  });
}
