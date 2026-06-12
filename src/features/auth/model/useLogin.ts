import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authEndpoints } from "@/shared/api/endpoints";
import type { LoginRequest } from "@/shared/api/types";
import { env } from "@/shared/config/env";
import { ROUTES } from "@/shared/config/routes";
import { useAuth } from "./AuthProvider";

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      if (env.apiUrl) {
        return authEndpoints.login(data);
      }

      // Modo demo local cuando no hay backend configurado.
      return {
        token: "demo-token",
        role: "employee" as const,
      };
    },
    onSuccess: (data) => {
      login(data);
      navigate(ROUTES.employee.dashboard, { replace: true });
    },
  });
}
