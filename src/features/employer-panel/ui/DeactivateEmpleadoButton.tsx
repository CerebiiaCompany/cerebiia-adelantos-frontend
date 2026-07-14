import { useState } from "react";
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
import { ApiError } from "@/shared/api";
import type { EmpleadoDTO } from "@/shared/api/types";
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
  const suspenderMutation = useDeactivateEmpleado();
  const reactivarMutation = useReactivarEmpleado();

  const isInactive = empleado.estado === "inactivo";
  const isPending =
    suspenderMutation.isPending || reactivarMutation.isPending;

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
      } else {
        await suspenderMutation.mutateAsync(empleado);
        toast.success(`${empleado.nombre} fue suspendido correctamente.`);
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
          <AlertDialogDescription>
            {isInactive
              ? "Se levantará la suspensión. Si el empleado ya tenía contraseña volverá a activo; si aún no había activado su cuenta, quedará pre-registrado."
              : "La cuenta pasará a estado inactivo y el empleado no podrá iniciar sesión ni solicitar adelantos hasta que se reactive."}
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
