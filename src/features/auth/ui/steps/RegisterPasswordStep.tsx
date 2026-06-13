import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Info,
  Loader2,
  Lock,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  getPasswordRequirementChecks,
  passwordSchema,
  type PasswordFormValues,
} from "@/shared/validations/register.schema";

interface RegisterPasswordStepProps {
  isExistingUser: boolean;
  isSubmitting: boolean;
  onBack?: () => void;
  onSubmit: (values: PasswordFormValues) => void;
}

const PASSWORD_REQUIREMENTS = [
  {
    id: "hasUppercase",
    label: "1 Mayúscula",
  },
  {
    id: "hasLowercase",
    label: "1 Minúscula",
  },
  {
    id: "hasNumber",
    label: "1 Número",
  },
  {
    id: "hasMinLength",
    label: "Mínimo 8 caracteres",
  },
] as const;

export function RegisterPasswordStep({
  isExistingUser,
  isSubmitting,
  onBack,
  onSubmit,
}: RegisterPasswordStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const passwordValue = form.watch("password");
  const requirementChecks = getPasswordRequirementChecks(passwordValue ?? "");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-1">
              <FormLabel className="text-foreground/80">
                Nueva contraseña
              </FormLabel>
              <FormControl>
                <div className="login-field relative rounded-xl">
                  <Lock className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Crea tu contraseña"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 pr-11 transition-all duration-300 focus-visible:ring-primary/30 disabled:opacity-60"
                    {...field}
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-all duration-300 hover:scale-110 hover:text-foreground disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="animate-stagger-up stagger-2 rounded-xl border border-border/80 bg-muted/10 px-4 py-3">
          <p className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Requisitos de contraseña
          </p>
          <ul className="space-y-2">
            {PASSWORD_REQUIREMENTS.map((requirement) => {
              const passed = requirementChecks[requirement.id];

              return (
                <li
                  key={requirement.id}
                  className={cn(
                    "flex items-center justify-start gap-2 text-sm transition-colors",
                    passed ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {passed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 opacity-50" />
                  )}
                  <span>{requirement.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-3">
              <FormLabel className="text-foreground/80">
                Confirmar contraseña
              </FormLabel>
              <FormControl>
                <div className="login-field relative rounded-xl">
                  <Lock className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repite tu contraseña"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 pr-11 transition-all duration-300 focus-visible:ring-primary/30 disabled:opacity-60"
                    {...field}
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground transition-all duration-300 hover:scale-110 hover:text-foreground disabled:opacity-50"
                    aria-label={
                      showConfirm
                        ? "Ocultar confirmación"
                        : "Mostrar confirmación"
                    }
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="animate-stagger-up stagger-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              <span className="font-semibold">Importante:</span> Conserva tu
              contraseña en un lugar seguro. La necesitarás para acceder a la
              plataforma en tus próximos ingresos.
            </span>
          </p>
        </div>

        <div className="animate-stagger-up stagger-5 flex gap-3 pt-2">
          {onBack && (
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
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "btn-login h-11 rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-md",
              onBack ? "flex-1" : "w-full",
              isSubmitting && "animate-pulse-glow",
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando cuenta...
              </span>
            ) : (
              <>
                {isExistingUser ? "Activar cuenta" : "Registrarse"}
                <ArrowRight className="btn-arrow ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
