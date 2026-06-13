import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Mail } from "lucide-react";
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
  contactEmailSchema,
  type ContactEmailFormValues,
} from "@/shared/validations/register.schema";

interface RegisterContactEmailStepProps {
  defaultValues: ContactEmailFormValues;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (values: ContactEmailFormValues) => void;
}

export function RegisterContactEmailStep({
  defaultValues,
  isSubmitting,
  onBack,
  onSubmit,
}: RegisterContactEmailStepProps) {
  const form = useForm<ContactEmailFormValues>({
    resolver: zodResolver(contactEmailSchema),
    defaultValues: {
      email: defaultValues.email ?? "",
      acceptDataPolicy: defaultValues.acceptDataPolicy ?? false,
      acceptRecords: defaultValues.acceptRecords ?? false,
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
          name="email"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-1">
              <FormLabel className="text-foreground/80">
                Correo electrónico
              </FormLabel>
              <FormControl>
                <div className="login-field relative rounded-xl">
                  <Mail className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="tu@empresa.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 transition-all duration-300 focus-visible:ring-primary/30 disabled:opacity-60"
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
          name="acceptDataPolicy"
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
                  Acepto la{" "}
                  <span className="font-medium text-primary">
                    política de tratamiento de datos personales
                  </span>{" "}
                  y autorizo el uso de mi información conforme a la normativa
                  vigente en Colombia.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptRecords"
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
                <FormLabel className="cursor-pointer text-sm font-normal leading-relaxed text-foreground">
                  Autorizo el{" "}
                  <span className="font-medium text-primary">
                    tratamiento de registros
                  </span>{" "}
                  asociados a mi proceso de registro y vinculación con la
                  plataforma.
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
