import { useMutation } from "@tanstack/react-query";
import { authEndpoints } from "@/shared/api/endpoints";
import type { ForgotPasswordRequest } from "@/shared/api/types";
import { env } from "@/shared/config/env";
import { normalizeEmail } from "@/shared/validations/register.schema";

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: ForgotPasswordRequest) => {
      const payload = { email: normalizeEmail(data.email) };

      if (env.apiUrl) {
        return authEndpoints.forgotPassword(payload);
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1200));

      return {
        message:
          "Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.",
      };
    },
  });
}
