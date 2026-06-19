import { useMutation } from "@tanstack/react-query";
import { flushSync } from "react-dom";
import { useNavigate } from "react-router-dom";import {
  ApiError,
  authEndpoints,
  buildDemoEmpleadoSession,
  empleadosEndpoints,
  mapEmpleadoLoginResponseToSession,
  mapSystemLoginResponseToSession,
  resolveAppRole,
} from "@/shared/api";
import type { LoginFormValues } from "@/shared/validations/auth.schema";
import { env } from "@/shared/config/env";
import { getHomeRouteForAppRole } from "@/shared/config/roleRoutes";
import { useAuth } from "./AuthProvider";
import { rememberedCredentialsStorage } from "./rememberedCredentialsStorage";

function getRememberedIdentifier(values: LoginFormValues): string {
  return values.loginType === "empleado" ? values.documento : values.email;
}

async function authenticate(values: LoginFormValues) {
  if (!env.isApiConfigured) {
    if (values.loginType === "empresa") {
      throw new ApiError(403, "/auth/login/", {
        detail:
          "El acceso de empresa requiere conexión con el servidor. Configura VITE_API_URL.",
      });
    }
    return buildDemoEmpleadoSession();
  }

  const session =
    values.loginType === "empleado"
      ? mapEmpleadoLoginResponseToSession(
          await empleadosEndpoints.login({
            documento: values.documento,
            password: values.password,
          }),
        )
      : mapSystemLoginResponseToSession(
          await authEndpoints.login({
            email: values.email,
            password: values.password,
          }),
        );

  const appRole = resolveAppRole(session);
  if (!appRole) {
    throw new ApiError(403, "/login", {
      detail: "No tienes permisos para acceder a esta aplicación.",
    });
  }

  return session;
}

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authenticate,
    onSuccess: async (session, variables) => {
      const appRole = resolveAppRole(session);
      if (!appRole) return;

      if (variables.rememberMe) {
        await rememberedCredentialsStorage.save(
          variables.loginType,
          getRememberedIdentifier(variables),
          variables.password,
        );
      } else {
        rememberedCredentialsStorage.clear();
      }

      flushSync(() => {
        login(session);
      });
      navigate(getHomeRouteForAppRole(appRole), { replace: true });    },
  });
}
