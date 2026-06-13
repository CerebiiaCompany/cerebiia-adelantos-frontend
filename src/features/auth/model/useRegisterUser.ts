import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authEndpoints } from "@/shared/api/endpoints";
import type { RegisterUserRequest } from "@/shared/api/types";
import { env } from "@/shared/config/env";
import { ROUTES } from "@/shared/config/routes";
import { demoRegisterUser } from "./registerDemo";

export function useRegisterUser() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterUserRequest) => {
      if (env.apiUrl) {
        return authEndpoints.register(data);
      }
      return demoRegisterUser();
    },
    onSuccess: () => {
      navigate(ROUTES.login, { replace: true });
    },
  });
}
