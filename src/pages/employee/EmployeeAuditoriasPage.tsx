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
        description="Historial de cambios y registro de actividad de tu cuenta."
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

