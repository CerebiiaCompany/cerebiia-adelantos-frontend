// ⚠️ AGNOSTIC — profile display mapping from auth session payloads

import type { AuthUser, EmpleadoProfile } from "@/shared/api/types/auth";
import { formatCOP } from "@/shared/lib/currency";
import { formatDate } from "@/shared/lib/dates";

export interface ProfileView {
  initials: string;
  fullName: string;
  roleLabel: string;
  isVerified: boolean;
  actorType: "empleado" | "system_user";
  documentNumber?: string;
  email?: string;
  phone?: string;
  company?: string;
  employeeNumber?: string;
  salary?: string;
  bank?: string;
  accountNumber?: string;
  status?: string;
  memberSince?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatEmployeeRoleLabel(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Empleado";

  const label = date.toLocaleDateString("es-CO", {
    month: "short",
    year: "numeric",
  });

  const formatted = label.charAt(0).toUpperCase() + label.slice(1);
  return `Empleado · Desde ${formatted}`;
}

function formatSalaryLabel(salario: string): string {
  const amount = Number.parseFloat(salario);
  if (Number.isNaN(amount)) return salario;
  return formatCOP(amount);
}

export function mapEmpleadoToProfileView(empleado: EmpleadoProfile): ProfileView {
  return {
    actorType: "empleado",
    initials: getInitials(empleado.nombre),
    fullName: empleado.nombre,
    roleLabel: formatEmployeeRoleLabel(empleado.created_at),
    isVerified: empleado.estado === "activo",
    documentNumber: empleado.documento,
    salary: formatSalaryLabel(empleado.salario),
    bank: empleado.banco,
    accountNumber: empleado.numero_cuenta,
    employeeNumber: empleado.id,
    company: empleado.empresa_id,
    status:
      empleado.estado === "activo" ? "Activo" : "Pre-registrado",
    memberSince: formatDate(empleado.created_at),
  };
}

export function mapSystemUserToProfileView(user: AuthUser): ProfileView {
  const roleLabel =
    user.role === "empresa" ? "Empresa · Administrador" : "Usuario del sistema";

  return {
    actorType: "system_user",
    initials: getInitials(user.full_name),
    fullName: user.full_name,
    roleLabel,
    isVerified: user.is_active,
    email: user.email,
    company: user.full_name,
    memberSince: formatDate(user.created_at),
  };
}
