import type { EmpleadoMeDTO } from "@/shared/api/types/adelanto";
import type { ProfileView } from "@/entities/user/model/profileView";
import { formatTipoCuenta } from "@/shared/utils/empleadoDisplayLabels";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidLike(value: string): boolean {
  return UUID_PATTERN.test(value.trim());
}

export function resolveEmpleadoCompanyName(
  empleadoMe?: EmpleadoMeDTO | null,
  profile?: ProfileView | null,
): string {
  const fromApi =
    empleadoMe?.empresa_nombre?.trim() ||
    empleadoMe?.empresa?.razon_social?.trim() ||
    empleadoMe?.empresa?.nombre?.trim();

  if (fromApi) return fromApi;

  const fromProfile = profile?.company?.trim();
  if (fromProfile && !isUuidLike(fromProfile)) return fromProfile;

  return "—";
}

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
