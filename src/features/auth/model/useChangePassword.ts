import { useMutation } from "@tanstack/react-query";
import {
  ApiError,
  authStorage,
  empleadosEndpoints,
  isEmpleadoSession,
  mapEmpleadoDtoToProfile,
} from "@/shared/api";
import type { ChangePasswordRequest } from "@/shared/api/types";
import { env } from "@/shared/config/env";
import { useAuth } from "./AuthProvider";
import { rememberedCredentialsStorage } from "./rememberedCredentialsStorage";

interface ChangePasswordInput extends ChangePasswordRequest {
  loginType: "empresa" | "empleado";
  identifier: string;
}

export function useChangePassword() {
  const { session, login } = useAuth();

  return useMutation({
    mutationFn: async (data: ChangePasswordInput) => {
      const { loginType, identifier, ...payload } = data;

      if (env.apiUrl) {
        if (loginType === "empleado") {
          const updated = await empleadosEndpoints.updateMe({
            password: payload.newPassword,
          });
          const profile = mapEmpleadoDtoToProfile(updated);
          authStorage.updateEmpleado(profile);
          if (session && isEmpleadoSession(session)) {
            login({ ...session, empleado: profile });
          }
        } else {
          // Backend aún no expone POST /auth/password/change/
          throw new ApiError(501, "/auth/password/change/", {
            detail:
              "El cambio de contraseña para cuentas de empresa aún no está disponible. Contacta al administrador.",
          });
        }
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
