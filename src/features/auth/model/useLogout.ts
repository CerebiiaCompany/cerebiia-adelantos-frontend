import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authEndpoints } from "@/shared/api/endpoints";
import { ROUTES } from "@/shared/config/routes";
import { env } from "@/shared/config/env";
import { useAuth } from "./AuthProvider";

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      if (!env.apiUrl) return;
      try {
        await authEndpoints.logout();
      } catch {
        // Si el backend no responde, igual cerramos sesión localmente.
      }
    },
    onSettled: () => {
      logout();
      navigate(ROUTES.login, { replace: true });
    },
  });
}
