import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

type EmployerPlaceholderPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function EmployerPlaceholderPage({
  title,
  description,
  icon,
}: EmployerPlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
      <PageHeader icon={icon} title={title} description={description} />
      <div className="glass-card glow-border rounded-xl p-6 text-sm text-muted-foreground">
        Módulo en preparación. La conexión con el backend se habilitará próximamente.
      </div>
    </div>
  );
}
