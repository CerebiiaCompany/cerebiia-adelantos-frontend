import { MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MisSoportesTable } from "@/features/soporte";

export default function EmployeeSoportesPage() {
  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
      <PageHeader
        icon={MessageCircle}
        title="Mi soporte"
        description="Consulta los reportes que enviaste sobre datos incorrectos y si tu empresa ya respondió."
      />
      <MisSoportesTable />
    </div>
  );
}
