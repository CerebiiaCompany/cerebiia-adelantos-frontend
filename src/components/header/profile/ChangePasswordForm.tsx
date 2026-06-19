import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { ProfilePasswordInput } from "@/components/header/profile/ProfilePasswordInput";
import { useChangePassword } from "@/features/auth/model/useChangePassword";
import { useAuth } from "@/features/auth";
import { isEmpleadoSession, isSystemUserSession } from "@/shared/api";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/shared/validations/auth.schema";
import { getPasswordRequirementChecks } from "@/shared/validations/register.schema";

const PASSWORD_REQUIREMENTS = [
  { id: "hasUppercase", label: "1 Mayúscula" },
  { id: "hasLowercase", label: "1 Minúscula" },
  { id: "hasNumber", label: "1 Número" },
  { id: "hasMinLength", label: "Mínimo 8 caracteres" },
] as const;

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const { session } = useAuth();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: changePassword, isPending, reset } = useChangePassword();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPasswordValue = form.watch("newPassword");
  const { isValid } = form.formState;
  const requirementChecks = getPasswordRequirementChecks(newPasswordValue ?? "");

  const handleSubmit = (values: ChangePasswordFormValues) => {
    const identifier =
      session && isSystemUserSession(session)
        ? session.user.email
        : session && isEmpleadoSession(session)
          ? session.empleado.documento
          : "";

    const loginType =
      session && isSystemUserSession(session) ? "empresa" : "empleado";

    changePassword(
      {
        loginType,
        identifier,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Tu contraseña se actualizó correctamente.");
          form.reset();
          reset();
          setShowCurrent(false);
          setShowNew(false);
          setShowConfirm(false);
          onSuccess?.();
        },
        onError: () => {
          toast.error(
            "No pudimos actualizar tu contraseña. Verifica tu contraseña actual e inténtalo de nuevo.",
          );
        },
      },
    );
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
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-foreground/80">
                Contraseña actual
              </FormLabel>
              <FormControl>
                <ProfilePasswordInput
                  {...field}
                  show={showCurrent}
                  onToggleShow={() => setShowCurrent((prev) => !prev)}
                  placeholder="Tu contraseña actual"
                  autoComplete="current-password"
                  disabled={isPending}
                  toggleLabel={
                    showCurrent
                      ? "Ocultar contraseña actual"
                      : "Mostrar contraseña actual"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-foreground/80">
                Nueva contraseña
              </FormLabel>
              <FormControl>
                <ProfilePasswordInput
                  {...field}
                  show={showNew}
                  onToggleShow={() => setShowNew((prev) => !prev)}
                  placeholder="Crea una contraseña segura"
                  autoComplete="new-password"
                  disabled={isPending}
                  toggleLabel={
                    showNew
                      ? "Ocultar nueva contraseña"
                      : "Mostrar nueva contraseña"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-xl border border-border/70 bg-muted/10 px-3 py-2.5">
          <p className="mb-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Requisitos
          </p>
          <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            {PASSWORD_REQUIREMENTS.map((requirement) => {
              const passed = requirementChecks[requirement.id];

              return (
                <li
                  key={requirement.id}
                  className={cn(
                    "flex items-center gap-1.5 text-[11px] transition-colors",
                    passed ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {passed ? (
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                  ) : (
                    <Circle className="h-3 w-3 shrink-0 opacity-50" />
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
            <FormItem>
              <FormLabel className="text-xs text-foreground/80">
                Confirmar nueva contraseña
              </FormLabel>
              <FormControl>
                <ProfilePasswordInput
                  {...field}
                  show={showConfirm}
                  onToggleShow={() => setShowConfirm((prev) => !prev)}
                  placeholder="Repite tu nueva contraseña"
                  autoComplete="new-password"
                  disabled={isPending}
                  toggleLabel={
                    showConfirm
                      ? "Ocultar confirmación"
                      : "Mostrar confirmación"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PrimaryActionButton
          type="submit"
          disabled={!isValid}
          loading={isPending}
          loadingText="Guardando..."
          showArrow={false}
          className="h-10 w-full text-sm"
        >
          Actualizar contraseña
        </PrimaryActionButton>
      </form>
    </Form>
  );
}
