import type { EmpleadoMeDTO } from "@/shared/api/types/adelanto";
import type { ProfileView } from "@/entities/user/model/profileView";
import { formatTipoCuenta } from "@/shared/utils/empleadoDisplayLabels";

export function resolveEmpleadoBankName(
  empleadoMe?: EmpleadoMeDTO | null,
  profile?: ProfileView | null,
): string {
  return (
    empleadoMe?.banco_nombre?.trim() ||
    profile?.bank?.trim() ||
    "—"
  );
}

export function resolveEmpleadoAccountNumber(
  empleadoMe?: EmpleadoMeDTO | null,
  profile?: ProfileView | null,
): string {
  return (
    empleadoMe?.numero_cuenta?.trim() ||
    profile?.accountNumber?.trim() ||
    "—"
  );
}

export function resolveEmpleadoAccountTypeLabel(
  empleadoMe?: EmpleadoMeDTO | null,
  profile?: ProfileView | null,
): string {
  const raw =
    empleadoMe?.tipo_cuenta?.trim() || profile?.accountType?.trim() || "";
  return formatTipoCuenta(raw);
}
