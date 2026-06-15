import { useMutation } from "@tanstack/react-query";
import { authEndpoints } from "@/shared/api/endpoints";
import type { ChangePasswordRequest } from "@/shared/api/types";
import { env } from "@/shared/config/env";
import { rememberedCredentialsStorage } from "./rememberedCredentialsStorage";

interface ChangePasswordInput extends ChangePasswordRequest {
  email: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const { email, ...payload } = data;

      if (env.apiUrl) {
        await authEndpoints.changePassword(payload);
      }

      await rememberedCredentialsStorage.updatePasswordIfMatches(
        email,
        payload.newPassword,
      );

      return { email };
    },
  });
}

/** Sincroniza credenciales recordadas tras restablecer contraseña (p. ej. enlace por correo). */
export async function syncRememberedCredentialsAfterPasswordReset(
  email: string,
  newPassword: string,
): Promise<void> {
  await rememberedCredentialsStorage.updatePasswordIfMatches(email, newPassword);
}
