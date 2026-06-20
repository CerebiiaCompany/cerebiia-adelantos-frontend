import { useState } from "react";
import { Loader2, UserX } from "lucide-react";
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
import { ApiError } from "@/shared/api";
import type { EmpleadoDTO } from "@/shared/api/types";
import { cn } from "@/lib/utils";
import { useDeactivateEmpleado } from "../model/useDeactivateEmpleado";

type DeactivateEmpleadoButtonProps = {
  empleado: EmpleadoDTO;
};

export function DeactivateEmpleadoButton({
  empleado,
}: DeactivateEmpleadoButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useDeactivateEmpleado();

  if (empleado.estado === "inactivo") {
    return (
      <span className="text-xs text-muted-foreground">Sin acciones</span>
    );
  }

  const handleConfirm = () => {
    mutate(empleado, {
      onSuccess: () => {
        setOpen(false);
        toast.success(`${empleado.nombre} fue desactivado correctamente.`);
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : "No pudimos desactivar al empleado. Inténtalo de nuevo.";
        toast.error(message);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors",
            "hover:border-destructive/30 hover:bg-destructive/10",
          )}
        >
          <UserX className="h-3.5 w-3.5" strokeWidth={2.25} />
          Desactivar
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="glow-border border-primary/15 bg-white/95 backdrop-blur-xl sm:rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">
            ¿Desactivar empleado?
          </AlertDialogTitle>
          <AlertDialogDescription>
            El empleado{" "}
            <span className="font-medium text-foreground">{empleado.nombre}</span>{" "}
            no podrá solicitar adelantos ni ingresar a la plataforma mientras
            esté inactivo. Podrás reactivarlo cuando el backend lo habilite.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handleConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Desactivando...
              </>
            ) : (
              "Confirmar desactivación"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
