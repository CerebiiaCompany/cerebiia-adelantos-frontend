import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdvancePaymentEvidenceDialog } from "@/features/advance/ui/AdvancePaymentEvidenceDialog";
import {
  type CompanyAdvanceStatus,
  type RegisteredCompanyAdvance,
} from "@/entities/employer-audit";
import { formatCOP, formatDate } from "@/shared/lib";
import { AuditStatusBadge } from "./AuditStatusBadge";

type PayrollEmployeeAdvancesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  employeeDocument: string;
  monthLabel: string;
  advances: RegisteredCompanyAdvance[];
};

function getStatusLabel(status: CompanyAdvanceStatus): string {
  if (status === "procesado") return "Pagado";
  if (status === "en_curso") return "En curso";
  return "Rechazado";
}

function getStatusTone(
  status: CompanyAdvanceStatus,
): "success" | "warning" | "danger" | "neutral" {
  if (status === "procesado") return "success";
  if (status === "en_curso") return "warning";
  if (status === "rechazado") return "danger";
  return "neutral";
}

function installmentValueOf(advance: RegisteredCompanyAdvance): number {
  if (advance.installments <= 1) return advance.advancedAmount;
  return Math.round(advance.advancedAmount / advance.installments);
}

export function PayrollEmployeeAdvancesDialog({
  open,
  onOpenChange,
  employeeName,
  employeeDocument,
  monthLabel,
  advances,
}: PayrollEmployeeAdvancesDialogProps) {
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              Detalle de adelantos
            </DialogTitle>
            <DialogDescription>
              {employeeName} · {employeeDocument} — nómina de {monthLabel}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto rounded-xl border border-border/80">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left">
                  <th className="px-3 py-3 font-semibold text-muted-foreground">
                    Nombre
                  </th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">
                    Valor solicitado
                  </th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">
                    Cantidad de cuotas
                  </th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">
                    Comisión
                  </th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">
                    Valor a pagar por cuota
                  </th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">
                    Estado
                  </th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">
                    Fecha de realización
                  </th>
                  <th className="px-3 py-3 font-semibold text-muted-foreground">
                    Evidencia de pago
                  </th>
                </tr>
              </thead>
              <tbody>
                {advances.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-8 text-center text-muted-foreground"
                    >
                      No hay adelantos para este empleado en el período.
                    </td>
                  </tr>
                ) : (
                  advances.map((advance) => (
                    <tr
                      key={advance.id}
                      className="border-b border-border/70 last:border-0"
                    >
                      <td className="px-3 py-3 font-medium text-foreground">
                        {advance.employeeName}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-foreground">
                        {formatCOP(advance.advancedAmount)}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-foreground">
                        {advance.installments}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">
                        {formatCOP(advance.feeAmount)}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-foreground">
                        {formatCOP(installmentValueOf(advance))}
                      </td>
                      <td className="px-3 py-3">
                        <AuditStatusBadge
                          label={getStatusLabel(advance.status)}
                          tone={getStatusTone(advance.status)}
                        />
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {formatDate(advance.requestedAt)}
                      </td>
                      <td className="px-3 py-3">
                        {advance.paymentEvidenceUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setEvidenceUrl(advance.paymentEvidenceUrl)
                            }
                            className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                          >
                            Ver evidencia
                          </button>
                        ) : (
                          <span className="text-sm text-muted-foreground/60">
                            No disponible
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      <AdvancePaymentEvidenceDialog
        open={Boolean(evidenceUrl)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setEvidenceUrl(null);
        }}
        evidenceUrl={evidenceUrl}
      />
    </>
  );
}
