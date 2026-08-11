import { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdvanceSimulatorCard } from "@/features/advance/ui/AdvanceSimulatorCard";
import { AdvanceFeaturesTimeline } from "@/features/advance/ui/AdvanceFeaturesTimeline";
import { AdvanceWindowBlockedNotice } from "@/features/advance/ui/AdvanceWindowBlockedNotice";
import { AdvanceReceipt } from "@/features/advance/ui/AdvanceReceipt";
import { AdvanceConfirmDialog } from "@/features/advance/ui/AdvanceConfirmDialog";
import { AdvanceDataSupportDialog } from "@/features/advance/ui/AdvanceDataSupportDialog";
import { useAdelantoConfig } from "@/features/advance/model/useAdelantoConfig";
import { useCreateSolicitudAdelanto } from "@/features/advance/model/useCreateSolicitudAdelanto";
import { useEmpleadoMe } from "@/features/advance/model/useEmpleadoMe";
import { useEmployeeDashboard } from "@/features/dashboard";
import { PayrollCalendarDialog } from "@/features/dashboard/ui/PayrollCalendarDialog";
import { PayrollCalendarFab } from "@/features/dashboard/ui/PayrollCalendarFab";
import { useProfileView } from "@/features/auth";
import { ApiError } from "@/shared/api";
import { env } from "@/shared/config/env";
import { getAdvanceAvailabilityInfo, getDaysUntilPayment } from "@/shared/config/payrollCalendar";
import {
  calculateAdvanceTotalFee,
  DEFAULT_TARIFA_FIJA_POR_CUOTA,
} from "@/shared/config/advanceFees";
import {
  resolveEmpleadoAccountNumber,
  resolveEmpleadoAccountTypeLabel,
  resolveEmpleadoBankName,
  resolveEmpleadoCompanyName,
} from "@/features/advance/utils/empleadoBankingDisplay";
import { ADVANCE_MIN_AMOUNT } from "@/entities/advance";
import { cn } from "@/lib/utils";

const COUNT_DURATION = 450;

export default function Adelanto() {
  const [amount, setAmount] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [payrollCalendarOpen, setPayrollCalendarOpen] = useState(false);
  const dashboard = useEmployeeDashboard();
  const profile = useProfileView();
  const { data: empleadoMe } = useEmpleadoMe();
  const { data: adelantoConfig, solicitudActiva } = useAdelantoConfig();
  const { mutate: createSolicitud, isPending: isSubmitting } =
    useCreateSolicitudAdelanto();

  const tarifaFijaPorCuota =
    adelantoConfig?.tarifaFijaPorCuota ?? DEFAULT_TARIFA_FIJA_POR_CUOTA;
  const maxInstallments = adelantoConfig?.numeroMaximoCuotas ?? 3;
  const maxAmount = dashboard?.availableAdvance ?? 0;
  const fee = calculateAdvanceTotalFee(
    tarifaFijaPorCuota,
    installments,
    amount,
  );
  const total = amount - fee;

  useEffect(() => {
    if (installments > maxInstallments) {
      setInstallments(maxInstallments);
    }
  }, [installments, maxInstallments]);
  const installmentValue = Math.round(total / installments);
  const bankName = resolveEmpleadoBankName(empleadoMe, profile);
  const accountTypeLabel = resolveEmpleadoAccountTypeLabel(empleadoMe, profile);
  const accountNumber = resolveEmpleadoAccountNumber(empleadoMe, profile);
  const companyName = resolveEmpleadoCompanyName(empleadoMe, profile);
  const documentNumber =
    empleadoMe?.documento?.trim() || profile?.documentNumber || "—";
  const fullName =
    empleadoMe?.nombre?.trim() || profile?.fullName || "Empleado";
  const advanceAvailability = useMemo(() => getAdvanceAvailabilityInfo(), []);
  const isAdvanceWindowOpen = advanceAvailability.canRequestAdvance;
  const hasAcceptedTerms =
    empleadoMe?.acepto_tratamiento_datos_y_terminos !== false;
  const canRequest =
    isAdvanceWindowOpen &&
    hasAcceptedTerms &&
    !solicitudActiva &&
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
          tarifaFijaPorCuota={tarifaFijaPorCuota}
          installments={installments}
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
        maxInstallments={maxInstallments}
        tarifaFijaPorCuota={tarifaFijaPorCuota}
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
        ) : !hasAcceptedTerms ? (
          "Debes aceptar términos y tratamiento de datos"
        ) : solicitudActiva ? (
          "Tienes una solicitud en curso"
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

      <AdvanceConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        identity={{
          initials: profile?.initials ?? "?",
          fullName,
          company: companyName === "—" ? "Empresa vinculada" : companyName,
          documentNumber,
          bankName,
          accountTypeLabel,
          accountNumber,
        }}
        amount={amount}
        total={total}
        fee={fee}
        installments={installments}
        installmentValue={installmentValue}
        isSubmitting={isSubmitting}
        onReportIncorrectData={() => {
          setConfirmOpen(false);
          setSupportOpen(true);
        }}
        onConfirm={() => {
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
      />

      <AdvanceDataSupportDialog
        open={supportOpen}
        onOpenChange={setSupportOpen}
      />
    </div>
  );
}
