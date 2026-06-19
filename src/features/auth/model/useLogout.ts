import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/shared/config/routes";
import { useAuth } from "./AuthProvider";

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => undefined,
    onSettled: () => {
      logout();
      navigate(ROUTES.login, { replace: true });
    },
  });
}
