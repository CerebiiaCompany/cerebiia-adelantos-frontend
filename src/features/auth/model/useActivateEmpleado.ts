import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ApiError } from "@/shared/api";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import type { ActivarEmpleadoRequest } from "@/shared/api/types";
import { ROUTES } from "@/shared/config/routes";
import { clearRegisterDraft } from "./useRegisterDraftPersistence.types";

export function useActivateEmpleado() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ActivarEmpleadoRequest) =>
      empleadosEndpoints.activar(data),
    onSuccess: async () => {
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
