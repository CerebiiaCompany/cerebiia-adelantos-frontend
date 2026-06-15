import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authEndpoints } from "@/shared/api/endpoints";
import type { LoginRequest } from "@/shared/api/types";
import type { LoginFormValues } from "@/shared/validations/auth.schema";
import { env } from "@/shared/config/env";
import { ROUTES } from "@/shared/config/routes";
import { useAuth } from "./AuthProvider";
import { rememberedCredentialsStorage } from "./rememberedCredentialsStorage";

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ rememberMe: _rememberMe, ...data }: LoginFormValues) => {
      const credentials = data as LoginRequest;

      if (env.apiUrl) {
        return authEndpoints.login(credentials);
      }

      // Modo demo local cuando no hay backend configurado.
      return {
        token: "demo-token",
        role: "employee" as const,
      };
    },
    onSuccess: async (_data, variables) => {
      if (variables.rememberMe) {
        await rememberedCredentialsStorage.save(
          variables.email,
          variables.password,
        );
      } else {
        rememberedCredentialsStorage.clear();
      }

      login(_data);
      navigate(ROUTES.employee.dashboard, { replace: true });
    },
  });
}
