import { useMutation } from "@tanstack/react-query";
import {
  authEndpoints,
  authStorage,
  empleadosEndpoints,
  isEmpleadoSession,
  isSystemUserSession,
  mapEmpleadoDtoToProfile,
  normalizeAuthUser,
  passwordChangeCompletionStorage,
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
          await authEndpoints.changePassword(payload);

          if (session && isSystemUserSession(session)) {
            passwordChangeCompletionStorage.markCompleted(session.user.id);

            let nextUser = normalizeAuthUser({
              ...session.user,
              must_change_password: false,
            });

            try {
              const me = normalizeAuthUser(await authEndpoints.me());
              nextUser = {
                ...me,
                must_change_password: me.must_change_password ?? false,
              };
            } catch {
              // Si /me falla, limpiamos el flag localmente tras el cambio exitoso.
            }

            authStorage.updateSystemUser(nextUser);
            login({ ...session, user: nextUser });
          }
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
