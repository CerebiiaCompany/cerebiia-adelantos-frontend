import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ChevronRight,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { DEMO_EMPLOYEE_PROFILE, PROFILE_MENU_ITEMS } from "@/shared/config/demoEmployeeProfile";
import { ProfileLogoutButton } from "@/components/header/profile/ProfileLogoutButton";

interface UserProfilePanelProps {
  onOpenSettings?: () => void;
}

export function UserProfilePanel({ onOpenSettings }: UserProfilePanelProps) {
  const profile = DEMO_EMPLOYEE_PROFILE;

  return (
    <div className="overflow-hidden">
      <div className="border-b border-border/60 bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary shadow-sm shadow-primary/20 ring-2 ring-primary/15">
            <span className="font-display text-base font-bold text-primary-foreground">
              {profile.initials}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-foreground">
              {profile.fullName}
            </p>
            <p className="text-xs text-muted-foreground">{profile.roleLabel}</p>
            <div className="mt-1 flex items-center gap-1">
              <Shield className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">
                Cuenta verificada
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        <ProfileRow icon={Mail} label="Correo" value={profile.email} />
        <ProfileRow icon={Phone} label="Teléfono" value={profile.phone} />
        <ProfileRow icon={Building2} label="Empresa" value={profile.company} />
        <ProfileRow
          icon={User}
          label="Número de empleado"
          value={profile.employeeNumber}
        />
      </div>

      <div className="divide-y divide-border/60 border-t border-border/60">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary/50"
        >
          <span>Configuración</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        {PROFILE_MENU_ITEMS.map((item) => (
          <button
            key={item}
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-secondary/50"
          >
            <span>{item}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <ProfileLogoutButton />
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
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
