import { useMutation } from "@tanstack/react-query";
import {
  authStorage,
  empleadosEndpoints,
  isEmpleadoSession,
  mapEmpleadoDtoToProfile,
} from "@/shared/api";
import { env } from "@/shared/config/env";
import type { UpdateProfileDataFormValues } from "@/shared/validations/auth.schema";
import { useAuth } from "./AuthProvider";

export function useUpdateProfileData() {
  const { session, login } = useAuth();

  return useMutation({
    mutationFn: async (data: UpdateProfileDataFormValues) => {
      if (env.apiUrl && session && isEmpleadoSession(session)) {
        const updated = await empleadosEndpoints.updateMe({
          email: data.email,
          celular: data.phone,
        });
        const profile = mapEmpleadoDtoToProfile(updated);
        authStorage.updateEmpleado(profile);
        login({ ...session, empleado: profile });

        return {
          message: "Tus datos se actualizaron correctamente.",
          data,
        };
      }

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
