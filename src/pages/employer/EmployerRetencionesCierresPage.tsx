import { Receipt } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { PayrollClosureView } from "@/features/employer-panel";

export default function EmployerRetencionesCierresPage() {
  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={Receipt}
        title="Retenciones y cierres"
        description="Consolidación mensual para Recursos Humanos. Total a descontar en nómina y monto de reembolso al proveedor del proyecto."
      />
      <PayrollClosureView />
    </div>
  );
}
