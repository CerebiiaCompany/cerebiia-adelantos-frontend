import { useMutation } from "@tanstack/react-query";
import { authEndpoints } from "@/shared/api/endpoints";
import type { LoginRequest } from "@/shared/api/types";

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginRequest) => authEndpoints.login(data),
  });
}
