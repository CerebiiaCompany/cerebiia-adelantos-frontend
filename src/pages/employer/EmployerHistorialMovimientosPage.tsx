import { BookOpen } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MovementsLedgerTable } from "@/features/employer-panel";

export default function EmployerHistorialMovimientosPage() {
  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={BookOpen}
        title="Historial de movimientos"
        description="Libro contable de auditoría financiera. Consulta cada desembolso realizado por el proveedor y exporta reportes para tu equipo contable."
      />
      <MovementsLedgerTable />
    </div>
  );
}
