import { Shield } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuth } from "@/features/auth";

export default function AdminPanelPage() {
  const { session } = useAuth();

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
      <PageHeader
        icon={Shield}
        title="Panel administrador"
        description={`Sesión de ${session?.user.full_name ?? "administrador"}`}
      />
      <div className="glass-card glow-border rounded-xl p-6 text-sm text-muted-foreground">
        Panel de super administrador. Los módulos administrativos se conectarán al
        backend en una fase posterior.
      </div>
    </div>
  );
}
