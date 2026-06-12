import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useLogin } from "../model/useLogin";
import {
  loginSchema,
  type LoginFormValues,
} from "@/shared/validations/auth.schema";

function LoginSkeleton() {
  return (
    <div className="w-full max-w-[420px] animate-pulse space-y-6 p-8 sm:p-10">
      <div className="space-y-3">
        <div className="h-7 w-48 rounded-lg bg-secondary" />
        <div className="h-4 w-full max-w-xs rounded-md bg-secondary/70" />
      </div>
      <div className="space-y-4">
        <div className="h-11 rounded-xl bg-secondary/80" />
        <div className="h-11 rounded-xl bg-secondary/80" />
        <div className="h-4 w-40 rounded-md bg-secondary/60" />
        <div className="h-11 rounded-xl bg-secondary" />
      </div>
    </div>
  );
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { mutate: login, isPending, isError } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setIsReady(true), 450);
    return () => window.clearTimeout(timer);
  }, []);

  function onSubmit(values: LoginFormValues) {
    login(values);
  }

  if (!isReady) {
    return (
      <div className="glass-card glow-border w-full max-w-[420px] overflow-hidden rounded-xl">
        <div className="loading-bar">
          <div className="animate-shimmer h-full w-full" />
        </div>
        <LoginSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-scale-in w-full max-w-[420px]">
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

        <div className="animate-stagger-up mb-8 space-y-2 text-center sm:text-left">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Bienvenido de nuevo
          </h2>
          <p className="text-sm text-muted-foreground">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>

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

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="animate-stagger-up stagger-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-foreground/80">
                      Contraseña
                    </FormLabel>
                    <button
                      type="button"
                      disabled={isPending}
                      className="link-hover text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <FormControl>
                    <div className="login-field relative rounded-xl">
                      <Lock className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isPending}
                        className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 pr-11 transition-all duration-300 focus-visible:ring-primary/30 disabled:opacity-60"
                        {...field}
                      />
                      <button
                        type="button"
                        disabled={isPending}
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

            <div className="animate-stagger-up stagger-3 flex items-center gap-2">
              <Checkbox id="remember" disabled={isPending} />
              <label
                htmlFor="remember"
                className="cursor-pointer text-sm text-muted-foreground transition-colors duration-300 hover:text-foreground"
              >
                Recordarme en este dispositivo
              </label>
            </div>

            {isError && (
              <div
                role="alert"
                className="animate-shake rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                Credenciales incorrectas. Verifica tu email y contraseña.
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
                  Validando credenciales...
                </span>
              ) : (
                <>
                  Ingresar
                  <ArrowRight className="btn-arrow h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>

        <p className="animate-stagger-up stagger-5 mt-8 text-center text-sm text-muted-foreground">
          ¿Necesitas acceso?{" "}
          <span className="font-medium text-gradient transition-opacity duration-300 hover:opacity-80">
            Contacta a tu administrador
          </span>
        </p>

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
              Conectando con el servidor...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
