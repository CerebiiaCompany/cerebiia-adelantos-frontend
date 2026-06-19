import { ChevronRight, Shield } from "lucide-react";
import { PROFILE_MENU_ITEMS } from "@/shared/config/demoEmployeeProfile";
import { ProfileLogoutButton } from "@/components/header/profile/ProfileLogoutButton";
import { useProfileView } from "@/features/auth";

interface UserProfilePanelProps {
  onOpenAccount?: () => void;
  onOpenSettings?: () => void;
}

export function UserProfilePanel({
  onOpenAccount,
  onOpenSettings,
}: UserProfilePanelProps) {
  const profile = useProfileView();

  if (!profile) return null;

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.04] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-primary shadow-sm shadow-primary/20 ring-2 ring-primary/15">
            <span className="font-display text-base font-bold text-primary-foreground">
              {profile.initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-bold text-slate-900">
              {profile.fullName}
            </p>
            <p className="text-xs text-slate-500">{profile.roleLabel}</p>
            {profile.isVerified ? (
              <div className="mt-1 flex items-center gap-1">
                <Shield className="h-3 w-3 text-primary" aria-hidden />
                <span className="text-xs font-medium text-primary">
                  Cuenta verificada
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100 border-b border-slate-100">
        <ProfileMenuItem label="Ver mi cuenta" onClick={onOpenAccount} />
        <ProfileMenuItem label="Configuración" onClick={onOpenSettings} />
        {PROFILE_MENU_ITEMS.map((item) => (
          <ProfileMenuItem key={item} label={item} />
        ))}
      </div>

      <ProfileLogoutButton />
    </div>
  );
}

function ProfileMenuItem({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full min-w-0 items-center justify-between px-4 py-3 text-left text-sm text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <span>{label}</span>
      <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
    </button>
  );
}
