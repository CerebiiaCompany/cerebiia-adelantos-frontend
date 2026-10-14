import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdvanceDataSupportDialog, MisSoportesTable } from "@/features/soporte";

export default function EmployeeSoportesPage() {
  const [supportOpen, setSupportOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
      <PageHeader
        icon={MessageCircle}
        title="Mi soporte"
        description="Consulta los reportes que enviaste sobre datos incorrectos y si tu empresa ya respondió."
      />

      <MisSoportesTable onCreateReporte={() => setSupportOpen(true)} />

      <AdvanceDataSupportDialog
        open={supportOpen}
        onOpenChange={setSupportOpen}
        title="¿Tienes algún dato incorrecto?"
        description="Indica qué dato está incorrecto y describe el problema. Tu empresa recibirá el reporte para coordinar la corrección."
      />
    </div>
  );
}
