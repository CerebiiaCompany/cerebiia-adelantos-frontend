import { useMemo } from "react";
import { useAuth } from "./AuthProvider";
import {
  mapEmpleadoToProfileView,
  mapSystemUserToProfileView,
  type ProfileView,
} from "@/entities/user/model/profileView";
import { isEmpleadoSession, isSystemUserSession } from "@/shared/api";

export function useProfileView(): ProfileView | null {
  const { session } = useAuth();

  return useMemo(() => {
    if (!session) return null;

    if (isEmpleadoSession(session)) {
      return mapEmpleadoToProfileView(session.empleado);
    }

    if (isSystemUserSession(session)) {
      return mapSystemUserToProfileView(session.user);
    }

    return null;
  }, [session]);
}
