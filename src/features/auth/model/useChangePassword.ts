import { useMutation } from "@tanstack/react-query";
import { authEndpoints } from "@/shared/api/endpoints";
import type { ChangePasswordRequest } from "@/shared/api/types";
import { env } from "@/shared/config/env";
import { rememberedCredentialsStorage } from "./rememberedCredentialsStorage";

interface ChangePasswordInput extends ChangePasswordRequest {
  loginType: "empresa";
  identifier: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const { loginType, identifier, ...payload } = data;

      if (env.apiUrl) {
        await authEndpoints.changePassword(payload);
      }

      await rememberedCredentialsStorage.updatePasswordIfMatches(
        loginType,
        identifier,
        payload.newPassword,
      );

      return { identifier };
    },
  });
}

/** Sincroniza credenciales recordadas tras restablecer contraseña (p. ej. enlace por correo). */
export async function syncRememberedCredentialsAfterPasswordReset(
  email: string,
  newPassword: string,
): Promise<void> {
  await rememberedCredentialsStorage.updatePasswordIfMatches(
    "empresa",
    email,
    newPassword,
  );
}
