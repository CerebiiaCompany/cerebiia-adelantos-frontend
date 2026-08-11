import { useState } from "react";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  AuditoriaCambiosTable,
  useAuditoriaCambiosMe,
} from "@/features/auditoria-cambios";

const PAGE_SIZE = 20;

export default function EmployeeAuditoriasPage() {
  const [page, setPage] = useState(1);
  const query = useAuditoriaCambiosMe({ page, page_size: PAGE_SIZE });

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
      <PageHeader
        icon={ClipboardList}
        title="Auditorías"
        description="Consulta el historial de cambios en tus datos personales y bancarios."
      />
      <AuditoriaCambiosTable
        records={query.data?.results ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        onRetry={() => query.refetch()}
        emptyMessage="Todavía no hay modificaciones registradas en tu perfil."
        page={page}
        pageSize={PAGE_SIZE}
        totalCount={query.data?.count ?? 0}
        onPageChange={setPage}
      />
    </div>
  );
}
