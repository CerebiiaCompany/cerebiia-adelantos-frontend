import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Info,
  Loader2,
  Mail,
  ShieldCheck,
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
import { ROUTES } from "@/shared/config/routes";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/shared/validations/auth.schema";
import { useForgotPassword } from "../model/useForgotPassword";

function ForgotPasswordSkeleton() {
  return (
    <div className="w-full max-w-[420px] animate-pulse space-y-6 p-8 sm:p-10">
      <div className="space-y-3">
        <div className="h-7 w-56 rounded-lg bg-secondary" />
        <div className="h-4 w-full max-w-xs rounded-md bg-secondary/70" />
      </div>
      <div className="space-y-4">
        <div className="h-11 rounded-xl bg-secondary/80" />
        <div className="h-16 rounded-xl bg-secondary/60" />
        <div className="h-11 rounded-xl bg-secondary" />
      </div>
    </div>
  );
}

export function ForgotPasswordForm() {
  const [isReady, setIsReady] = useState(false);
  const { mutate: requestReset, isPending, isSuccess, isError, reset } =
    useForgotPassword();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  function onSubmit(values: ForgotPasswordFormValues) {
    requestReset({ email: values.email });
  }

  function handleTryAnotherEmail() {
    reset();
    form.reset();
  }

  if (!isReady) {
    return (
      <div className="glass-card glow-border w-full max-w-[420px] overflow-hidden rounded-xl lg:mx-auto">
        <div className="loading-bar">
          <div className="animate-shimmer h-full w-full" />
        </div>
        <ForgotPasswordSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-scale-in w-full max-w-[420px] lg:mx-auto">
      <div
        className={cn(
          "login-card glass-card glow-border relative overflow-hidden p-8 sm:p-10",
          isPending && "pointer-events-none opacity-90",
        )}
      >
        {isPending && (
          <div className="loading-bar" aria-hidden="true">
            <div className="animate-shimmer h-full w-full" />
          </div>
        )}

        <div className="animate-stagger-up mb-8 space-y-2 text-left">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Recuperación de contraseña
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Ingresa el correo electrónico con el que creaste tu cuenta. Te
            enviaremos instrucciones para restablecer tu contraseña de forma
            segura.
          </p>
        </div>

        {isSuccess ? (
          <div key="success" className="auth-view-enter space-y-5">
            <div
              role="status"
              className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-2 ring-primary/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-display text-sm font-semibold text-foreground">
                    Solicitud enviada correctamente
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Si el correo está registrado en AdeCerebiia, recibirás un
                    enlace para restablecer tu contraseña en los próximos
                    minutos. Revisa tu bandeja de entrada y la carpeta de spam.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleTryAnotherEmail}
              className="h-11 w-full rounded-xl font-medium"
            >
              Enviar a otro correo
            </Button>

            <Button
              type="button"
              asChild
              className="btn-login h-11 w-full rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-md"
            >
              <Link to={ROUTES.login}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </Button>
          </div>
        ) : (
          <div key="form" className="auth-view-enter">
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
                          placeholder="tu@empresa.com"
                          type="email"
                          autoComplete="email"
                          disabled={isPending}
                          className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 transition-all duration-300 focus-visible:ring-primary/30 disabled:opacity-60"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="animate-stagger-up stagger-2 rounded-xl border border-border/80 bg-muted/20 px-4 py-3.5">
                <p className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Por seguridad, solo enviaremos instrucciones si el correo
                    está asociado a una cuenta activa en la plataforma.
                  </span>
                </p>
              </div>

              <div className="animate-stagger-up stagger-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3.5">
                <p className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>
                    El enlace de restablecimiento tendrá vigencia limitada. Si
                    no solicitaste este cambio, puedes ignorar el mensaje.
                  </span>
                </p>
              </div>

              {isError && (
                <div
                  role="alert"
                  className="animate-shake rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  No pudimos procesar tu solicitud en este momento. Intenta
                  nuevamente en unos minutos.
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className={cn(
                  "btn-login animate-stagger-up stagger-4 h-11 w-full rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-md",
                  isPending && "animate-pulse-glow",
                )}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando instrucciones...
                  </span>
                ) : (
                  <>
                    Restablecer contraseña
                    <ArrowRight className="btn-arrow h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
          </div>
        )}

        {!isSuccess && (
          <div className="animate-stagger-up stagger-5 mt-8">
            <Button
              variant="ghost"
              asChild
              disabled={isPending}
              className="h-10 w-full rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <Link to={ROUTES.login}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </Button>
          </div>
        )}

        {isPending && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/20 backdrop-blur-[1px]"
            aria-hidden="true"
          >
            <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-sm font-medium text-muted-foreground shadow-lg ring-1 ring-border/50">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Procesando solicitud...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
