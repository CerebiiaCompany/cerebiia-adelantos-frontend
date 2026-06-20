import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdvanceMonitoringTable } from "@/features/employer-panel";

export default function EmployerMonitoreoAdelantosPage() {
  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Monitoreo de adelantos"
        description="Auditoría de adelantos reales solicitados por tu plantilla. Verifica el cumplimiento del tope del 30% del salario y la comisión del 2.5%."
      />
      <AdvanceMonitoringTable />
    </div>
  );
}
