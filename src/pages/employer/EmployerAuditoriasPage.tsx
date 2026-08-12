import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  AuditoriaCambiosTable,
  useAuditoriaCambiosEmpresa,
} from "@/features/auditoria-cambios";

const PAGE_SIZE = 20;

export default function EmployerAuditoriasPage() {
  const [page, setPage] = useState(1);
  const query = useAuditoriaCambiosEmpresa({ page, page_size: PAGE_SIZE });

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Auditorías"
        description="Historial de cambios en los datos de tus empleados."
      />
      <AuditoriaCambiosTable
        records={query.data?.results ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        showEmployeeColumn
        trackUnread
        emptyMessage="Todavía no hay cambios de datos registrados para tu empresa."
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={query.data?.count ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}
