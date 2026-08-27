import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useEmployerUnifiedAuditData } from "@/features/employer-panel/model/useEmployerUnifiedAuditData";
import { EmployerUnifiedAuditTable } from "@/features/employer-panel/ui/audit/EmployerUnifiedAuditTable";

export default function EmployerAuditoriasPage() {
  const { records, isLoading, isError, refetch } =
    useEmployerUnifiedAuditData();

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Auditorías"
        description="Historial de eventos, solicitudes de empleados, liberaciones de cuotas y cambios de configuración."
      />

      <EmployerUnifiedAuditTable
        records={records}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />
    </div>
  );
}
