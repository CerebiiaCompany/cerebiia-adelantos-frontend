import { MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ReportesDatosIncorrectosTable } from "@/features/employer-panel";

export default function EmployerSoportesPage() {
  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={MessageCircle}
        title="Soportes"
        description="Mensajes de empleados que reportan datos incorrectos. Revisa evidencias y responde para coordinar la corrección."
      />
      <ReportesDatosIncorrectosTable />
    </div>
  );
}
