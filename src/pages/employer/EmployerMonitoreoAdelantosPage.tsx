import { ClipboardCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  AdvanceMonitoringTable,
  useEmployerConfig,
} from "@/features/employer-panel";
import { formatCOP } from "@/shared/lib";

export default function EmployerMonitoreoAdelantosPage() {
  const { data: adelantoConfig } = useEmployerConfig();
  const tarifaLabel = adelantoConfig
    ? formatCOP(adelantoConfig.tarifaFijaPorCuota)
    : null;
  const topeLabel = adelantoConfig
    ? `${adelantoConfig.porcentajeMaximoAdelanto}%`
    : "30%";

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6">
      <PageHeader
        icon={ClipboardCheck}
        title="Monitoreo de adelantos"
        description={
          tarifaLabel
            ? `Auditoría de adelantos reales solicitados por tu plantilla. Verifica el cumplimiento del tope del ${topeLabel} del salario y la comisión fija de ${tarifaLabel} por cuota.`
            : `Auditoría de adelantos reales solicitados por tu plantilla. Verifica el cumplimiento del tope del ${topeLabel} del salario y la comisión fija configurada por el administrador.`
        }
      />
      <AdvanceMonitoringTable />
    </div>
  );
}
