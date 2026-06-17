import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { DEMO_EMPLOYEE_PROFILE } from "@/shared/config/demoEmployeeProfile";

interface UserProfileAccountPanelProps {
  onBack: () => void;
}

export function UserProfileAccountPanel({ onBack }: UserProfileAccountPanelProps) {
  const profile = DEMO_EMPLOYEE_PROFILE;

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.04] px-4 py-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Volver al perfil
        </button>
        <h2 className="font-display text-lg font-bold text-slate-900">
          Ver mi cuenta
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Información personal y laboral asociada a tu perfil.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        <ProfileRow icon={Mail} label="Correo" value={profile.email} />
        <ProfileRow icon={Phone} label="Teléfono" value={profile.phone} />
        <ProfileRow icon={Building2} label="Empresa" value={profile.company} />
        <ProfileRow
          icon={User}
          label="Número de empleado"
          value={profile.employeeNumber}
        />
      </div>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
