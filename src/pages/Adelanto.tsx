import { useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdvanceSimulatorCard } from "@/features/advance/ui/AdvanceSimulatorCard";
import { AdvanceFeaturesTimeline } from "@/features/advance/ui/AdvanceFeaturesTimeline";
import { AdvanceWindowBlockedNotice } from "@/features/advance/ui/AdvanceWindowBlockedNotice";
import { AdvanceReceipt } from "@/features/advance/ui/AdvanceReceipt";
import { useCreateSolicitudAdelanto } from "@/features/advance/model/useCreateSolicitudAdelanto";
import { useEmpleadoMe } from "@/features/advance/model/useEmpleadoMe";
import { useEmployeeDashboard } from "@/features/dashboard";
import { PayrollCalendarDialog } from "@/features/dashboard/ui/PayrollCalendarDialog";
import { PayrollCalendarFab } from "@/features/dashboard/ui/PayrollCalendarFab";
import { useProfileView } from "@/features/auth";
import { ApiError } from "@/shared/api";
import { env } from "@/shared/config/env";
import { getAdvanceAvailabilityInfo, getDaysUntilPayment } from "@/shared/config/payrollCalendar";
import { calculateAdvanceTransactionFee } from "@/shared/config/advanceFees";
import {
  resolveEmpleadoAccountNumber,
  resolveEmpleadoAccountTypeLabel,
  resolveEmpleadoBankName,
} from "@/features/advance/utils/empleadoBankingDisplay";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ADVANCE_MIN_AMOUNT } from "@/entities/advance";
import { cn } from "@/lib/utils";

const COUNT_DURATION = 450;

function secondaryButtonClass(className?: string) {
  return cn(
    "font-medium transition-all duration-200 ease-out",
    "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
    "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary hover:ring-1 hover:ring-primary/20",
    className,
  );
}

export default function Adelanto() {
  const [amount, setAmount] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [payrollCalendarOpen, setPayrollCalendarOpen] = useState(false);
  const dashboard = useEmployeeDashboard();
  const profile = useProfileView();
  const { data: empleadoMe } = useEmpleadoMe();
  const { mutate: createSolicitud, isPending: isSubmitting } =
    useCreateSolicitudAdelanto();

  const maxAmount = useMemo(() => {
    if (dashboard?.availableAdvance !== undefined) {
      return dashboard.availableAdvance;
    }

    if (empleadoMe?.monto_maximo_adelanto) {
      const parsed = Number.parseFloat(empleadoMe.monto_maximo_adelanto);
      if (!Number.isNaN(parsed)) return parsed;
    }

    return 0;
  }, [dashboard?.availableAdvance, empleadoMe?.monto_maximo_adelanto]);
  const fee = calculateAdvanceTransactionFee(amount);
  const total = amount - fee;
  const installmentValue = Math.round(total / installments);
  const bankName = resolveEmpleadoBankName(empleadoMe, profile);
  const accountTypeLabel = resolveEmpleadoAccountTypeLabel(empleadoMe, profile);
  const accountNumber = resolveEmpleadoAccountNumber(empleadoMe, profile);
  const employeeNumber = empleadoMe?.empleado_id ?? profile?.employeeNumber ?? "—";
  const advanceAvailability = useMemo(() => getAdvanceAvailabilityInfo(), []);
  const isAdvanceWindowOpen = advanceAvailability.canRequestAdvance;
  const canRequest =
    isAdvanceWindowOpen &&
    maxAmount >= ADVANCE_MIN_AMOUNT &&
    amount >= ADVANCE_MIN_AMOUNT &&
    amount <= maxAmount;
  const daysUntilPayment = useMemo(() => getDaysUntilPayment(), []);

  if (showReceipt) {
    return (
      <div className="mx-auto max-w-2xl py-2">
        <AdvanceReceipt
          amount={amount}
          transactionFeeAmount={fee}
          onBack={() => {
            setShowReceipt(false);
            setAmount(0);
          }}
        />
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <PageHeader
        icon={Zap}
        title="Solicitar adelanto"
        description="Selecciona el monto y confirma en un clic"
      />

      <PayrollCalendarFab
        onClick={() => setPayrollCalendarOpen(true)}
        daysUntilPayment={daysUntilPayment}
      />

      <PayrollCalendarDialog
        open={payrollCalendarOpen}
        onOpenChange={setPayrollCalendarOpen}
      />

      {!isAdvanceWindowOpen ? (
        <AdvanceWindowBlockedNotice
          onOpenCalendar={() => setPayrollCalendarOpen(true)}
        />
      ) : null}

      <AdvanceSimulatorCard
        amount={amount}
        onAmountChange={setAmount}
        installments={installments}
        onInstallmentsChange={setInstallments}
        maxAmount={maxAmount}
        minAmount={ADVANCE_MIN_AMOUNT}
        fee={fee}
        total={total}
        installmentValue={installmentValue}
        disabled={!isAdvanceWindowOpen}
      />

      <div
        className={cn(
          "transition-opacity duration-300",
          !isAdvanceWindowOpen && "pointer-events-none opacity-50",
        )}
      >
        <AdvanceFeaturesTimeline />
      </div>
      <PrimaryActionButton
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={!canRequest}
        className={cn(
          "w-full py-4 font-display text-lg font-bold",
          canRequest && "animate-pulse-glow",
        )}
      >
        {!isAdvanceWindowOpen ? (
          "No puedes adelantar hoy"
        ) : canRequest ? (
          <>
            Solicitar{" "}
            <AnimatedCurrency
              value={amount}
              className="inline"
              duration={COUNT_DURATION}
            />
          </>
        ) : (
          "Selecciona un monto"
        )}
      </PrimaryActionButton>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="glow-border max-w-md border-primary/15 bg-white/95 p-0 shadow-lg backdrop-blur-xl sm:rounded-2xl [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
          <div className="p-6">
            <DialogTitle className="sr-only">Confirmar adelanto</DialogTitle>
            <p className="mb-1 text-center font-display text-lg font-semibold text-foreground">
              Confirmar adelanto
            </p>
            <DialogDescription className="mb-4 text-center text-sm text-muted-foreground">
              ¿Deseas confirmar este adelanto a nombre de?
            </DialogDescription>

            <div className="mb-5 rounded-xl border border-primary/10 bg-primary/[0.04] p-4 text-left">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-sm font-bold text-primary-foreground shadow-sm">
                  {profile?.initials ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-display font-semibold text-foreground">
                    {profile?.fullName ?? "Empleado"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.company ?? "Empresa vinculada"}
                  </p>
                </div>
              </div>
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Identificación</dt>
                  <dd className="font-medium text-foreground">
                    {profile?.documentNumber ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Banco</dt>
                  <dd className="text-right font-medium text-foreground">
                    {bankName}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Tipo de cuenta</dt>
                  <dd className="text-right font-medium text-foreground">
                    {accountTypeLabel}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">No. cuenta</dt>
                  <dd className="font-mono text-xs font-medium text-foreground">
                    {accountNumber}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">No. empleado</dt>
                  <dd className="font-mono text-xs font-medium text-foreground">
                    {employeeNumber}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mb-5 text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                Monto a solicitar
              </p>
              <AnimatedCurrency
                value={amount}
                className="font-display text-3xl font-bold text-gradient"
                duration={COUNT_DURATION}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {installments} {installments === 1 ? "cuota" : "cuotas"} de{" "}
                <AnimatedCurrency
                  value={installmentValue}
                  className="inline font-medium text-foreground"
                  duration={COUNT_DURATION}
                />
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
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
                onClick={() => {
                  if (!env.apiUrl) {
                    toast.error(
                      "La solicitud de adelanto requiere conexión con el servidor.",
                    );
                    return;
                  }

                  createSolicitud(
                    { amount, numeroCuotas: installments },
                    {
                      onSuccess: () => {
                        setConfirmOpen(false);
                        setShowReceipt(true);
                      },
                      onError: (error) => {
                        const message =
                          error instanceof ApiError
                            ? error.message
                            : "No pudimos enviar la solicitud. Inténtalo de nuevo.";
                        toast.error(message);
                      },
                    },
                  );
                }}
                className="flex-1 py-3 font-bold"
              >
                Confirmar ✓
              </PrimaryActionButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
