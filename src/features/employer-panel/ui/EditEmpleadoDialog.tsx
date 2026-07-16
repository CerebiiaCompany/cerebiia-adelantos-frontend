import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
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
import { ApiError, mapEmpleadoDtoToFormValues } from "@/shared/api";
import type { EmpleadoDTO } from "@/shared/api/types";
import {
  CREATE_EMPLEADO_STEP1_FIELDS,
  createEmpleadoSchema,
  isCreateEmpleadoStep1Complete,
  isCreateEmpleadoStep2Complete,
  type CreateEmpleadoFormValues,
} from "@/shared/validations/empleado.schema";
import { cn } from "@/lib/utils";
import { useUpdateEmpleado } from "../model/useUpdateEmpleado";
import { useEmpleadoDocumentoExists } from "../model/useEmpleadoDocumentoExists";
import {
  BANCOS_QUERY_KEY,
  fetchBancosList,
} from "../model/useBancos";
import { CreateEmpleadoStepIndicator } from "./CreateEmpleadoStepIndicator";
import { CreateEmpleadoLaboralStep } from "./steps/CreateEmpleadoLaboralStep";
import { CreateEmpleadoPersonalStep } from "./steps/CreateEmpleadoPersonalStep";

type EditEmpleadoDialogProps = {
  empleado: EmpleadoDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditEmpleadoDialog({
  empleado,
  open,
  onOpenChange,
}: EditEmpleadoDialogProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const { mutate: updateEmpleado, isPending, reset: resetMutation } =
    useUpdateEmpleado();

  const defaultValues = useMemo(
    () => (empleado ? mapEmpleadoDtoToFormValues(empleado) : null),
    [empleado],
  );

  const form = useForm<CreateEmpleadoFormValues>({
    resolver: zodResolver(createEmpleadoSchema),
    defaultValues: defaultValues ?? undefined,
    mode: "onChange",
  });

  const watchedValues = useWatch({ control: form.control });
  const tipoDocumento = watchedValues?.tipo_documento ?? "";
  const documento = watchedValues?.documento ?? "";
  const documentoChanged =
    Boolean(empleado) &&
    documento.trim() !== (empleado?.documento ?? "").trim();

  const { exists: documentoExists, isChecking: isCheckingDocumento } =
    useEmpleadoDocumentoExists(
      tipoDocumento,
      documento,
      open && documentoChanged,
    );

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
    if (!open || !defaultValues) {
      setStep(1);
      resetMutation();
      return;
    }

    form.reset(defaultValues);
    setStep(1);

    if (env.apiUrl) {
      void queryClient.prefetchQuery({
        queryKey: BANCOS_QUERY_KEY,
        queryFn: fetchBancosList,
      });
    }
  }, [open, defaultValues, form, resetMutation, queryClient]);

  async function handleNextStep() {
    const isValid = await form.trigger([...CREATE_EMPLEADO_STEP1_FIELDS]);
    if (!isValid || documentoExists || isCheckingDocumento) return;
    // Diferir el cambio de paso para que el click no “aterrice” en Guardar (submit).
    window.setTimeout(() => setStep(2), 0);
  }

  function handleSubmit(values: CreateEmpleadoFormValues) {
    if (!empleado) return;

    updateEmpleado(
      {
        empleadoId: empleado.id,
        values: {
          ...values,
          salario: Number(values.salario).toFixed(2),
        },
      },
      {
        onSuccess: (updated) => {
          toast.success(`${updated.nombre} fue actualizado correctamente.`);
          onOpenChange(false);
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : "No pudimos actualizar el empleado. Inténtalo de nuevo.";
          toast.error(message);
        },
      },
    );
  }

  function handleSaveClick() {
    void form.handleSubmit(handleSubmit)();
  }

  if (!empleado || !defaultValues) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-display">Editar empleado</DialogTitle>
          <DialogDescription>
            Actualiza los datos de {empleado.nombre}. Todos los campos son
            requeridos por el backend.
          </DialogDescription>
        </DialogHeader>

        <CreateEmpleadoStepIndicator currentStep={step} />

        <Form {...form}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
            }}
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
                  type="button"
                  onClick={handleSaveClick}
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
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </PrimaryActionButton>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
