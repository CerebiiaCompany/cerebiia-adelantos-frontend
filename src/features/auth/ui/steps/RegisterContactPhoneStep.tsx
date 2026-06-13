import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import {
  contactPhoneSchema,
  sanitizeColombianPhone,
  type ContactPhoneFormValues,
} from "@/shared/validations/register.schema";

interface RegisterContactPhoneStepProps {
  defaultValues: ContactPhoneFormValues;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (values: ContactPhoneFormValues) => void;
}

export function RegisterContactPhoneStep({
  defaultValues,
  isSubmitting,
  onBack,
  onSubmit,
}: RegisterContactPhoneStepProps) {
  const form = useForm<ContactPhoneFormValues>({
    resolver: zodResolver(contactPhoneSchema),
    defaultValues: {
      phone: defaultValues.phone ?? "",
      acceptWalletContract: defaultValues.acceptWalletContract ?? false,
      acceptTemporaryStorage: defaultValues.acceptTemporaryStorage ?? false,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        noValidate
      >
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-1">
              <FormLabel className="text-foreground/80">
                Número celular
              </FormLabel>
              <FormControl>
                <div className="login-field relative rounded-xl">
                  <Phone className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="Ej: 3001234567"
                    autoComplete="tel"
                    inputMode="numeric"
                    disabled={isSubmitting}
                    className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 transition-all duration-300 focus-visible:ring-primary/30 disabled:opacity-60"
                    {...field}
                    onChange={(event) => {
                      field.onChange(
                        sanitizeColombianPhone(event.target.value),
                      );
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptWalletContract"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-2 flex flex-row items-start gap-3 space-y-0 rounded-xl border border-border/60 bg-background/40 p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  disabled={isSubmitting}
                  className="mt-0.5"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer text-sm font-normal leading-relaxed text-foreground">
                  Al ingresar su número celular, usted autoriza que este puede
                  estar asociado a billeteras digitales y acepta las condiciones
                  del contrato, incluyendo las aplicables en caso de
                  incumplimiento.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptTemporaryStorage"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-3 flex flex-row items-start gap-3 space-y-0 rounded-xl border border-border/60 bg-background/40 p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  disabled={isSubmitting}
                  className="mt-0.5"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer text-sm font-normal leading-relaxed text-primary">
                  Acepto que mis datos se guarden temporalmente para retomar mi
                  registro
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="animate-stagger-up stagger-4 flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="h-11 flex-1 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "btn-login h-11 flex-1 rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-md",
              isSubmitting && "animate-pulse-glow",
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Continuar
                <ArrowRight className="btn-arrow ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
