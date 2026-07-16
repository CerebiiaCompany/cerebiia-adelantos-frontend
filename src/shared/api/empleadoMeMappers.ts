// ⚠️ AGNOSTIC — maps empleado API payloads to session profile

import { normalizeEmpleadoProfile } from "./authMappers";
import type { EmpleadoProfile } from "./types/auth";
import type { EmpleadoDTO } from "./types/empleado";

export function mapEmpleadoDtoToProfile(empleado: EmpleadoDTO): EmpleadoProfile {
  return normalizeEmpleadoProfile({
    id: empleado.id,
    documento: empleado.documento,
    nombre: empleado.nombre,
    salario: empleado.salario,
    banco_nombre: empleado.banco_nombre,
    numero_cuenta: empleado.numero_cuenta,
    tipo_cuenta: empleado.tipo_cuenta,
    fecha_ingreso: empleado.fecha_ingreso,
    email_empleado: empleado.email_empleado,
    celular: empleado.celular,
    estado: empleado.estado,
    empresa_id: empleado.empresa_id,
    empresa_nombre: empleado.empresa_nombre,
    created_at: empleado.created_at,
    updated_at: empleado.updated_at,
  });
}

export function parseApiDecimalAmount(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return undefined;
  return Math.round(amount);
}
