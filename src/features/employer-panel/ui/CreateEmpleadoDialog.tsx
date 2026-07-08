import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { env } from "@/shared/config/env";
import { ApiError } from "@/shared/api";
import {
  CREATE_EMPLEADO_STEP1_FIELDS,
  createEmpleadoSchema,
  isCreateEmpleadoStep1Complete,
  isCreateEmpleadoStep2Complete,
  type CreateEmpleadoFormValues,
} from "@/shared/validations/empleado.schema";
import { cn } from "@/lib/utils";
import { useCreateEmpleado } from "../model/useCreateEmpleado";
import { useEmpleadoDocumentoExists } from "../model/useEmpleadoDocumentoExists";
import {
  BANCOS_QUERY_KEY,
  fetchBancosList,
} from "../model/useBancos";
import { CreateEmpleadoStepIndicator } from "./CreateEmpleadoStepIndicator";
import { CreateEmpleadoLaboralStep } from "./steps/CreateEmpleadoLaboralStep";
import { CreateEmpleadoPersonalStep } from "./steps/CreateEmpleadoPersonalStep";

const DEFAULT_VALUES: CreateEmpleadoFormValues = {
  tipo_documento: "",
  documento: "",
  nombre: "",
  correo: "",
  celular: "",
  salario: "",
  tipo_contrato: "",
  fecha_ingreso: "",
  banco_id: "",
  tipo_cuenta: "",
  numero_cuenta: "",
};

type CreateEmpleadoDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateEmpleadoDialog({
  open,
  onOpenChange,
}: CreateEmpleadoDialogProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const { mutate: createEmpleado, isPending, reset: resetMutation } =
    useCreateEmpleado();

  const form = useForm<CreateEmpleadoFormValues>({
    resolver: zodResolver(createEmpleadoSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const watchedValues = useWatch({ control: form.control });

  const tipoDocumento = watchedValues?.tipo_documento ?? "";
  const documento = watchedValues?.documento ?? "";
  const { exists: documentoExists, isChecking: isCheckingDocumento } =
    useEmpleadoDocumentoExists(tipoDocumento, documento, open);

  useEffect(() => {
    if (!open) return;

    if (documentoExists) {
      form.setError("documento", {
        type: "duplicate",
        message: "Este documento ya existe",
      });
      return;
    }

    if (form.getFieldState("documento").error?.type === "duplicate") {
      void form.trigger("documento");
    }
  }, [documentoExists, form, open]);

  const isStep1Complete = useMemo(
    () =>
      isCreateEmpleadoStep1Complete(watchedValues ?? {}) &&
      !documentoExists &&
      !isCheckingDocumento,
    [watchedValues, documentoExists, isCheckingDocumento],
  );

  const isStep2Complete = useMemo(
    () => isCreateEmpleadoStep2Complete(watchedValues ?? {}),
    [watchedValues],
  );

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      setStep(1);
      resetMutation();
      return;
    }

    if (env.apiUrl) {
      void queryClient.prefetchQuery({
        queryKey: BANCOS_QUERY_KEY,
        queryFn: fetchBancosList,
      });
    }
  }, [open, form, resetMutation, queryClient]);

  async function handleNextStep() {
    const isValid = await form.trigger([...CREATE_EMPLEADO_STEP1_FIELDS]);
    if (!isValid || documentoExists || isCheckingDocumento) return;
    setStep(2);
  }

  function handleSubmit(values: CreateEmpleadoFormValues) {
    createEmpleado(
      {
        ...values,
        salario: Number(values.salario).toFixed(2),
      },
      {
        onSuccess: (empleado) => {
          toast.success(
            `${empleado.nombre} fue registrado. Se enviará la invitación de activación a su correo.`,
          );
          onOpenChange(false);
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : "No pudimos crear el empleado. Inténtalo de nuevo.";
          toast.error(message);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display">Nuevo empleado</DialogTitle>
          <DialogDescription>
            Registra al colaborador en dos pasos. Recibirá una invitación por
            correo para activar su cuenta.
          </DialogDescription>
        </DialogHeader>

        <CreateEmpleadoStepIndicator currentStep={step} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {step === 1 ? (
              <CreateEmpleadoPersonalStep
                control={form.control}
                disabled={isPending}
                isCheckingDocumento={isCheckingDocumento}
              />
            ) : (
              <CreateEmpleadoLaboralStep
                control={form.control}
                disabled={isPending}
              />
            )}

            <DialogFooter className="gap-2 sm:gap-2">
              {step === 2 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isPending}
                  className="rounded-xl"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atrás
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="rounded-xl"
              >
                Cancelar
              </Button>

              {step === 1 ? (
                <PrimaryActionButton
                  type="button"
                  onClick={() => void handleNextStep()}
                  disabled={!isStep1Complete}
                  className={cn(
                    "h-11 rounded-xl px-5 text-sm font-semibold shadow-md transition-all duration-500 ease-out",
                    isStep1Complete &&
                      "shadow-[0_10px_28px_hsl(var(--primary)/0.22)]",
                  )}
                >
                  Siguiente
                </PrimaryActionButton>
              ) : (
                <PrimaryActionButton
                  type="submit"
                  disabled={!isStep2Complete}
                  loading={isPending}
                  loadingText="Guardando..."
                  showArrow={false}
                  className={cn(
                    "h-11 rounded-xl px-5 text-sm font-semibold shadow-md transition-all duration-500 ease-out",
                    isStep2Complete &&
                      "shadow-[0_10px_28px_hsl(var(--primary)/0.22)]",
                  )}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Crear empleado
                </PrimaryActionButton>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateEmpleadoButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="h-11 rounded-xl bg-gradient-primary px-4"
    >
      <UserPlus className="mr-2 h-4 w-4" />
      Nuevo empleado
    </Button>
  );
}
