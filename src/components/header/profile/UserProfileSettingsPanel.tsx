import { useState } from "react";
import { ArrowLeft, ChevronDown, KeyRound, UserRound } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChangePasswordForm } from "@/components/header/profile/ChangePasswordForm";
import { UpdateProfileDataForm } from "@/components/header/profile/UpdateProfileDataForm";
import { ProfileLogoutButton } from "@/components/header/profile/ProfileLogoutButton";
import { DEMO_EMPLOYEE_PROFILE } from "@/shared/config/demoEmployeeProfile";
import { sanitizeColombianPhone } from "@/shared/validations/register.schema";

type SettingsSection = "update-data" | "change-password" | null;

interface UserProfileSettingsPanelProps {
  onBack: () => void;
}

const SETTINGS_SECTIONS = [
  {
    id: "update-data" as const,
    label: "Actualizar datos",
    description: "Correo y teléfono de contacto",
    icon: UserRound,
  },
  {
    id: "change-password" as const,
    label: "Cambiar contraseña",
    description: "Actualiza tu clave de acceso",
    icon: KeyRound,
  },
];

export function UserProfileSettingsPanel({
  onBack,
}: UserProfileSettingsPanelProps) {
  const [openSection, setOpenSection] = useState<SettingsSection>(null);
  const profile = DEMO_EMPLOYEE_PROFILE;

  const handleSectionChange = (section: Exclude<SettingsSection, null>) => (
    open: boolean,
  ) => {
    setOpenSection(open ? section : null);
  };

  return (
    <div className="flex max-h-[min(85vh,640px)] flex-col overflow-hidden">
      <div className="border-b border-border/60 bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.04] px-4 py-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al perfil
        </button>
        <h2 className="font-display text-lg font-bold text-foreground">
          Configuración
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Administra tu información personal y seguridad de la cuenta.
        </p>
      </div>

      <div className="overflow-y-auto">
        {SETTINGS_SECTIONS.map((section) => {
          const isOpen = openSection === section.id;
          const Icon = section.icon;

          return (
            <Collapsible
              key={section.id}
              open={isOpen}
              onOpenChange={handleSectionChange(section.id)}
            >
              <CollapsibleTrigger className="flex w-full items-center gap-3 border-b border-border/60 px-4 py-3.5 text-left transition-colors hover:bg-secondary/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {section.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden="true"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="overflow-hidden border-b border-border/60 bg-primary/[0.02] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                {section.id === "update-data" ? (
                  <UpdateProfileDataForm
                    defaultValues={{
                      email: profile.email,
                      phone: sanitizeColombianPhone(profile.phone),
                    }}
                    onSuccess={() => setOpenSection(null)}
                  />
                ) : (
                  <ChangePasswordForm onSuccess={() => setOpenSection(null)} />
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      <ProfileLogoutButton />
    </div>
  );
}
