import { useMemo } from "react";
import { Building2, ClipboardList, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth";
import {
  EmployerPanelUnavailableNotice,
  useEmpleadosList,
} from "@/features/employer-panel";
import { isSystemUserSession } from "@/shared/api";
import { useTimeBasedGreeting } from "@/hooks/useTimeBasedGreeting";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";

export default function EmployerPanelPage() {
  const { session } = useAuth();
  const {
    data: empleados,
    isLoading: isLoadingEmpleados,
    isError: isEmpleadosError,
  } = useEmpleadosList();

  const empleadosActivos = useMemo(    () => empleados?.filter((empleado) => empleado.estado === "activo").length ?? 0,
    [empleados],
  );

  const stats = [
    {
      label: "Empleados activos",
      value: empleadosActivos,
      icon: Users,
      accent: "text-primary",
      isLoading: isLoadingEmpleados,
      hasError: isEmpleadosError,
    },
    {
      label: "Solicitudes pendientes",
      value: 7,
      icon: ClipboardList,
      accent: "text-amber-600",
      isLoading: false,
      hasError: false,
    },
    {
      label: "Empresas vinculadas",
      value: 1,
      icon: Building2,
      accent: "text-emerald-600",
      isLoading: false,
      hasError: false,
    },
  ] as const;

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
        {stats.map((stat) => (
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
            {stat.isLoading ? (
              <Skeleton className="h-9 w-16 rounded-lg" />
            ) : stat.hasError ? (
              <p className="font-display text-3xl font-bold text-muted-foreground">
                —
              </p>
            ) : (
              <AnimatedNumber
                value={stat.value}
                className="font-display text-3xl font-bold text-foreground"
              />
            )}
          </div>
        ))}
      </div>

      {isEmpleadosError ? (
        <EmployerPanelUnavailableNotice
          layout="inline"
          message="Información de empleados no disponible temporalmente."
          description="Algunos indicadores del panel pueden mostrarse incompletos. Intenta de nuevo más tarde."
        />
      ) : null}

      <div className="glass-card glow-border rounded-xl p-6">        <h2 className="font-display text-lg font-semibold text-foreground">
          Resumen operativo
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Bienvenido al panel de empresa. Desde aquí puedes auditar adelantos,
          supervisar cuotas de préstamos, consultar el libro contable y generar
          los reportes de retención para nómina. El listado de empleados ya está
          conectado al backend desde{" "}
          <span className="font-medium text-foreground">Mis empleados</span>.
        </p>
      </div>
    </div>
  );
}
