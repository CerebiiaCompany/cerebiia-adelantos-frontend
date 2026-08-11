import { useEffect, useState } from "react";
import { Ban, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ApiError, empleadosEndpoints } from "@/shared/api";
import type { CarteraPendienteEmpleadoDTO, EmpleadoDTO } from "@/shared/api/types";
import { downloadEmpleadoCarteraReport, formatCOP, resolveTotalADescontar } from "@/shared/lib";
import {
  useDeactivateEmpleado,
  useReactivarEmpleado,
} from "../model/useDeactivateEmpleado";

type DeactivateEmpleadoButtonProps = {
  empleado: EmpleadoDTO;
};

export function DeactivateEmpleadoButton({
  empleado,
}: DeactivateEmpleadoButtonProps) {
  const [open, setOpen] = useState(false);
  const [cartera, setCartera] = useState<CarteraPendienteEmpleadoDTO | null>(
    null,
  );
  const [carteraLoading, setCarteraLoading] = useState(false);
  const [carteraError, setCarteraError] = useState(false);

  const suspenderMutation = useDeactivateEmpleado();
  const reactivarMutation = useReactivarEmpleado();

  const isInactive = empleado.estado === "inactivo";
  const isPending =
    suspenderMutation.isPending || reactivarMutation.isPending;

  useEffect(() => {
    if (!open || isInactive) {
      setCartera(null);
      setCarteraError(false);
      setCarteraLoading(false);
      return;
    }

    let cancelled = false;
    setCarteraLoading(true);
    setCarteraError(false);
    setCartera(null);

    void empleadosEndpoints
      .carteraPendiente(empleado.id)
      .then((data) => {
        if (!cancelled) setCartera(data);
      })
      .catch(() => {
        if (!cancelled) setCarteraError(true);
      })
      .finally(() => {
        if (!cancelled) setCarteraLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, isInactive, empleado.id]);

  const handleConfirm = async () => {
    try {
      if (isInactive) {
        const result = await reactivarMutation.mutateAsync(empleado);
        const estadoLabel =
          result.estado === "pre_registrado"
            ? "pre-registrado (pendiente de activación)"
            : "activo";
        toast.success(
          `${empleado.nombre} fue reactivado correctamente (${estadoLabel}).`,
        );
        setOpen(false);
        return;
      }

      await suspenderMutation.mutateAsync(empleado);

      let carteraForReport = cartera;
      if (!carteraForReport) {
        try {
          carteraForReport = await empleadosEndpoints.carteraPendiente(
            empleado.id,
          );
        } catch {
          carteraForReport = null;
        }
      }

      if (carteraForReport) {
        try {
          await downloadEmpleadoCarteraReport(carteraForReport);
          toast.success(
            `${empleado.nombre} fue suspendido. Se descargó el documento de cartera.`,
          );
        } catch {
          toast.success(`${empleado.nombre} fue suspendido correctamente.`);
          toast.warning(
            "No se pudo generar el Excel de cartera. Puedes reintentar consultando la cartera del empleado.",
          );
        }
      } else {
        toast.success(`${empleado.nombre} fue suspendido correctamente.`);
        toast.warning(
          "La suspensión se aplicó, pero no se pudo obtener la cartera pendiente.",
        );
      }

      setOpen(false);
    } catch (error) {
      const fallback = isInactive
        ? "No se pudo reactivar al empleado. Intenta de nuevo."
        : "No se pudo suspender al empleado. Intenta de nuevo.";
      const message = error instanceof ApiError ? error.message : fallback;
      toast.error(message);
    }
  };

  const totalADescontar = cartera
    ? resolveTotalADescontar(cartera.totales)
    : 0;
  const cantidadCuotas = cartera?.totales.cantidad_cuotas ?? 0;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={
            isInactive
              ? "h-8 gap-1.5 rounded-lg px-2 text-xs font-medium text-primary hover:bg-primary/5"
              : "h-8 gap-1.5 rounded-lg px-2 text-xs font-medium text-destructive hover:bg-destructive/5 hover:text-destructive"
          }
          disabled={isPending}
        >
          {isInactive ? (
            <>
              <RotateCcw className="h-3.5 w-3.5" />
              Reactivar
            </>
          ) : (
            <>
              <Ban className="h-3.5 w-3.5" />
              Suspender
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isInactive
              ? `¿Reactivar a ${empleado.nombre}?`
              : `¿Suspender a ${empleado.nombre}?`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">
              {isInactive ? (
                <p>
                  Se levantará la suspensión. Si el empleado ya tenía contraseña
                  volverá a activo; si aún no había activado su cuenta, quedará
                  pre-registrado.
                </p>
              ) : (
                <>
                  <p>
                    La cuenta pasará a estado inactivo y el empleado no podrá
                    iniciar sesión ni solicitar adelantos hasta que se reactive.
                    Al confirmar se descargará un Excel con la cartera a
                    descontar en nómina.
                  </p>
                  {carteraLoading ? (
                    <p className="flex items-center gap-2 text-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Consultando cartera pendiente…
                    </p>
                  ) : carteraError ? (
                    <p className="text-warning">
                      No se pudo precargar la cartera. Igual puedes suspender; se
                      intentará generar el documento al confirmar.
                    </p>
                  ) : cartera ? (
                    <p className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-foreground">
                      {cantidadCuotas === 0
                        ? "Sin deuda pendiente · cartera saneada."
                        : `${cantidadCuotas} cuota${cantidadCuotas === 1 ? "" : "s"} pendiente${cantidadCuotas === 1 ? "" : "s"} · ${formatCOP(totalADescontar)} a descontar.`}
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={
              isInactive
                ? undefined
                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            }
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isInactive ? "Reactivando..." : "Suspendiendo..."}
              </>
            ) : isInactive ? (
              "Sí, reactivar"
            ) : (
              "Sí, suspender"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
