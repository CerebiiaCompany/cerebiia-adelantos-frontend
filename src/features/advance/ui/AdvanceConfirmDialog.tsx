import { MessageCircleWarning, ShieldCheck } from "lucide-react";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  buildInstallmentCutoffDates,
  formatDate,
  formatIsoDateLocal,
} from "@/shared/lib";

const COUNT_DURATION = 450;

function secondaryButtonClass(className?: string) {
  return cn(
    "font-medium transition-all duration-200 ease-out",
    "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
    "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary hover:ring-1 hover:ring-primary/20",
    className,
  );
}

export interface AdvanceConfirmIdentityData {
  initials: string;
  fullName: string;
  company: string;
  documentNumber: string;
  bankName: string;
  accountTypeLabel: string;
  accountNumber: string;
}

export interface AdvanceConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  identity: AdvanceConfirmIdentityData;
  amount: number;
  total: number;
  fee: number;
  installments: number;
  installmentValue: number;
  isSubmitting: boolean;
  onConfirm: () => void;
  onReportIncorrectData: () => void;
}

export function AdvanceConfirmDialog({
  open,
  onOpenChange,
  identity,
  amount,
  total,
  fee,
  installments,
  installmentValue,
  isSubmitting,
  onConfirm,
  onReportIncorrectData,
}: AdvanceConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glow-border max-h-[92vh] max-w-lg overflow-y-auto border-primary/15 bg-white/95 p-0 shadow-lg backdrop-blur-xl sm:rounded-2xl [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
        <div className="p-6">
          <DialogTitle className="sr-only">Rectificar datos del adelanto</DialogTitle>
          <div className="mb-4 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" aria-hidden />
            </div>
            <p className="font-display text-lg font-semibold text-foreground">
              Rectifica tus datos
            </p>
            <DialogDescription className="mt-1 text-sm text-muted-foreground">
              Verifica que la información sea correcta. Aquí solo puedes
              confirmarla; no es posible editarla.
            </DialogDescription>
          </div>

          <div className="mb-5 rounded-xl border border-primary/10 bg-primary/[0.04] p-4 text-left">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-sm font-bold text-primary-foreground shadow-sm">
                {identity.initials || "?"}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display font-semibold text-foreground">
                  {identity.fullName}
                </p>
                <p className="text-xs text-muted-foreground">{identity.company}</p>
              </div>
            </div>

            <dl className="grid gap-3 text-sm">
              <ConfirmRow label="Nombres completos" value={identity.fullName} />
              <ConfirmRow
                label="Número de documento"
                value={identity.documentNumber}
              />
              <ConfirmRow label="Banco" value={identity.bankName} />
              <ConfirmRow
                label="Tipo de cuenta"
                value={identity.accountTypeLabel}
              />
              <ConfirmRow
                label="Cuenta bancaria"
                value={identity.accountNumber}
                mono
              />
            </dl>
          </div>

          <div className="mb-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-3 text-center">
                <p className="mb-1 text-xs text-muted-foreground">
                  Monto a solicitar
                </p>
                <AnimatedCurrency
                  value={amount}
                  className="font-display text-lg font-semibold text-foreground"
                  duration={COUNT_DURATION}
                />
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/[0.04] px-3 py-3 text-center">
                <p className="mb-1 text-xs text-muted-foreground">A recibir</p>
                <AnimatedCurrency
                  value={total}
                  className="font-display text-lg font-bold text-gradient"
                  duration={COUNT_DURATION}
                />
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Comisión{" "}
              {fee === 0 ? (
                <span className="font-medium text-emerald-600">Gratis</span>
              ) : (
                <AnimatedCurrency
                  value={fee}
                  className="inline font-medium text-foreground"
                  duration={COUNT_DURATION}
                />
              )}
            </p>

            <dl className="rounded-xl border border-border/60 px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted-foreground">
                  {installments === 1 ? "Cuota" : "Cuotas"}
                </dt>
                <dd className="font-medium text-foreground">
                  {installments} ×{" "}
                  <AnimatedCurrency
                    value={installmentValue}
                    className="inline"
                    duration={COUNT_DURATION}
                  />
                </dd>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 border-t border-border/50 pt-2">
                <dt className="text-muted-foreground">Primer corte</dt>
                <dd className="text-right font-medium text-foreground">
                  {formatDate(
                    formatIsoDateLocal(
                      buildInstallmentCutoffDates(new Date(), installments)[0],
                    ),
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <button
            type="button"
            onClick={onReportIncorrectData}
            className="mb-4 flex w-full items-start gap-3 rounded-xl border border-warning/25 bg-warning/5 px-3.5 py-3 text-left transition-colors hover:bg-warning/10"
          >
            <MessageCircleWarning
              className="mt-0.5 h-4 w-4 shrink-0 text-warning"
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                ¿Algún dato está mal?
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Enviar mensaje a soporte con evidencias para que tu empresa lo
                corrija.
              </span>
            </span>
          </button>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className={secondaryButtonClass("flex-1 rounded-xl py-3")}
            >
              Cancelar
            </button>
            <PrimaryActionButton
              type="button"
              showArrow={false}
              loading={isSubmitting}
              loadingText="Enviando..."
              disabled={isSubmitting}
              onClick={onConfirm}
              className="flex-1 py-3 font-bold"
            >
              Confirmar ✓
            </PrimaryActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "max-w-[60%] text-right font-medium text-foreground",
          mono && "font-mono text-xs",
        )}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
