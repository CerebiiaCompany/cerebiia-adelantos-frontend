import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoanInstallmentsTable } from "@/features/employer-panel";

export default function EmployerSeguimientoCuotasPage() {
  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={CalendarClock}
        title="Seguimiento de cuotas"
        description="Supervisa adelantos reales con plan de 1 a 3 cuotas y su estado de descuento por nómina."
      />
      <LoanInstallmentsTable />
    </div>
  );
}
