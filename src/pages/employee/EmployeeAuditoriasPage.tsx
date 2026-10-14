import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  EmployeeUnifiedAuditTable,
  useEmployeeUnifiedAuditData,
} from "@/features/employee-audit";

export default function EmployeeAuditoriasPage() {
  const { records, isLoading, isError, refetch } =
    useEmployeeUnifiedAuditData();

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Auditorías"
        description="Historial de tus solicitudes de adelanto, movimientos de cupo y cambios en tu perfil."
      />

      <EmployeeUnifiedAuditTable
        records={records}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />
    </div>
  );
}

