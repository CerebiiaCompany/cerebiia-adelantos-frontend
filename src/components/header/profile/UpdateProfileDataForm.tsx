import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdateProfileData } from "@/features/auth/model/useUpdateProfileData";
import {
  updateProfileDataSchema,
  type UpdateProfileDataFormValues,
} from "@/shared/validations/auth.schema";
import { sanitizeColombianPhone } from "@/shared/validations/register.schema";

interface UpdateProfileDataFormProps {
  defaultValues: UpdateProfileDataFormValues;
  onSuccess?: () => void;
}

export function UpdateProfileDataForm({
  defaultValues,
  onSuccess,
}: UpdateProfileDataFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfileData();

  const form = useForm<UpdateProfileDataFormValues>({
    resolver: zodResolver(updateProfileDataSchema),
    defaultValues,
    mode: "onChange",
  });

  const { isValid } = form.formState;

  const handleSubmit = (values: UpdateProfileDataFormValues) => {
    updateProfile(values, {
      onSuccess: (response) => {
        toast.success(response.message);
        onSuccess?.();
      },
      onError: () => {
        toast.error("No pudimos actualizar tus datos. Inténtalo de nuevo.");
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-3 px-3 pb-4 pt-1 sm:px-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-foreground/80">
                Correo electrónico
              </FormLabel>
              <FormControl>
                <div className="relative rounded-xl">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="tu@empresa.com"
                    autoComplete="email"
                    disabled={isPending}
                    className="h-10 rounded-xl border-border/80 bg-background/80 pl-10 text-sm transition-all duration-300 focus-visible:ring-primary/30 disabled:opacity-60"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-foreground/80">
                Teléfono celular
              </FormLabel>
              <FormControl>
                <div className="relative rounded-xl">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="3001234567"
                    autoComplete="tel"
                    disabled={isPending}
                    className="h-10 rounded-xl border-border/80 bg-background/80 pl-10 text-sm transition-all duration-300 focus-visible:ring-primary/30 disabled:opacity-60"
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(sanitizeColombianPhone(event.target.value))
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Empresa y número de empleado no se pueden modificar desde aquí.
        </p>

        <Button
          type="submit"
          disabled={!isValid || isPending}
          className="h-10 w-full rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground shadow-sm"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </span>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </form>
    </Form>
  );
}
