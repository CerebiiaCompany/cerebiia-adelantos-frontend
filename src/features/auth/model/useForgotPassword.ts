import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import type { ForgotPasswordRequest } from "@/shared/api/types";
import { env } from "@/shared/config/env";
import { normalizeEmail } from "@/shared/validations/register.schema";

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      const payload = { email: normalizeEmail(data.email) };

      if (env.apiUrl) {
        // Backend aún no expone POST /auth/password/forgot/
        throw new ApiError(501, "/auth/password/forgot/", {
          detail:
            "La recuperación de contraseña aún no está disponible. Contacta al administrador del sistema.",
        });
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1200));

      return {
        message:
          "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.",
        email: payload.email,
      };
    },
  });
}
