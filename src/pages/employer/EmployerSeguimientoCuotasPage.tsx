import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LoanInstallmentsTable } from "@/features/employer-panel";

export default function EmployerSeguimientoCuotasPage() {
  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={CalendarClock}
        title="Seguimiento de cuotas"
        description="Supervisa adelantos pagados en 2 o 3 cuotas. Solo se muestran solicitudes reales con plan de cuotas, con un máximo de 3 cuotas por adelanto."
      />
      <LoanInstallmentsTable />
    </div>
  );
}
