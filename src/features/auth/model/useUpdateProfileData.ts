import { useMutation } from "@tanstack/react-query";
import { env } from "@/shared/config/env";
import type { UpdateProfileDataFormValues } from "@/shared/validations/auth.schema";

export function useUpdateProfileData() {
  return useMutation({
    mutationFn: async (data: UpdateProfileDataFormValues) => {
      if (env.apiUrl) {
        await new Promise((resolve) => window.setTimeout(resolve, 1200));
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 1200));
      }

      return {
        message: "Tus datos se actualizaron correctamente.",
        data,
      };
    },
  });
}
