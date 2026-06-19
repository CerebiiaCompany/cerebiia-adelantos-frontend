import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/shared/api";
import {
  createEmpleadoSchema,
  type CreateEmpleadoFormValues,
} from "@/shared/validations/empleado.schema";
import { useCreateEmpleado } from "../model/useCreateEmpleado";

const DEFAULT_VALUES: CreateEmpleadoFormValues = {
  documento: "",
  nombre: "",
  salario: "",
  banco: "",
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
  const { mutate: createEmpleado, isPending, reset: resetMutation } =
    useCreateEmpleado();

  const form = useForm<CreateEmpleadoFormValues>({
    resolver: zodResolver(createEmpleadoSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) {
      form.reset(DEFAULT_VALUES);
      resetMutation();
    }
  }, [open, form, resetMutation]);

  function handleSubmit(values: CreateEmpleadoFormValues) {
    createEmpleado(
      {
        ...values,
        salario: Number(values.salario).toFixed(2),
      },
      {
        onSuccess: (empleado) => {
          toast.success(`${empleado.nombre} fue registrado como pre-registrado.`);
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
            El empleado quedará en estado pre-registrado hasta que active su
            cuenta con su documento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Documento</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        placeholder="12345678"
                        className="h-11 rounded-xl"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Juan Pérez"
                        className="h-11 rounded-xl"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="salario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salario mensual</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      inputMode="decimal"
                      placeholder="1500000.00"
                      className="h-11 rounded-xl"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="banco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Bancolombia"
                        className="h-11 rounded-xl"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_cuenta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de cuenta</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123456789"
                        className="h-11 rounded-xl"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-gradient-primary"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear empleado
                  </>
                )}
              </Button>
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
