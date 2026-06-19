import { Building2, ClipboardList, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/features/auth";
import { isSystemUserSession } from "@/shared/api";
import { useTimeBasedGreeting } from "@/hooks/useTimeBasedGreeting";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";

const STATS = [
  {
    label: "Empleados activos",
    value: 128,
    icon: Users,
    accent: "text-primary",
  },
  {
    label: "Solicitudes pendientes",
    value: 7,
    icon: ClipboardList,
    accent: "text-amber-600",
  },
  {
    label: "Empresas vinculadas",
    value: 1,
    icon: Building2,
    accent: "text-emerald-600",
  },
] as const;

export default function EmployerPanelPage() {
  const { session } = useAuth();
  const displayName =
    session && isSystemUserSession(session)
      ? session.user.full_name
      : "Administrador";
  const greeting = useTimeBasedGreeting(displayName);

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={Building2}
        title={greeting.title}
        description="Gestiona adelantos, empleados y solicitudes de tu empresa"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="glass-card glow-border rounded-xl p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <stat.icon className={cn("h-4 w-4", stat.accent)} strokeWidth={2.25} />
            </div>
            <AnimatedNumber
              value={stat.value}
              className="font-display text-3xl font-bold text-foreground"
            />
          </div>
        ))}
      </div>

      <div className="glass-card glow-border rounded-xl p-6">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Resumen operativo
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Bienvenido al panel de empresa. Desde aquí podrás revisar solicitudes de
          adelanto, administrar empleados y consultar el estado de tu organización.
          Los módulos de solicitudes, empleados y empresa estarán conectados al
          backend en la siguiente fase.
        </p>
      </div>
    </div>
  );
}
