import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
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
import { rememberedCredentialsStorage } from "../model/rememberedCredentialsStorage";
import {
  loginSchema,
  type LoginFormValues,
} from "@/shared/validations/auth.schema";
import { ROUTES } from "@/shared/config/routes";
import { ApiError } from "@/shared/api";

const LOGIN_BOOTSTRAP_MS = 450;

type LoginType = LoginFormValues["loginType"];

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

function getDefaultValues(loginType: LoginType): LoginFormValues {
  if (loginType === "empresa") {
    return {
      loginType: "empresa",
      email: "",
      password: "",
      rememberMe: false,
    };
  }

  return {
    loginType: "empleado",
    documento: "",
    password: "",
    rememberMe: false,
  };
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loginType, setLoginType] = useState<LoginType>("empleado");
  const { mutate: login, isPending, error } = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: getDefaultValues("empleado"),
  });

  useEffect(() => {
    let cancelled = false;

    async function bootstrapForm() {
      const [savedCredentials] = await Promise.all([
        rememberedCredentialsStorage.load(),
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, LOGIN_BOOTSTRAP_MS);
        }),
      ]);

      if (cancelled) return;

      if (savedCredentials) {
        setLoginType(savedCredentials.loginType);
        if (savedCredentials.loginType === "empresa") {
          form.reset({
            loginType: "empresa",
            email: savedCredentials.identifier,
            password: savedCredentials.password,
            rememberMe: true,
          });
        } else {
          form.reset({
            loginType: "empleado",
            documento: savedCredentials.identifier,
            password: savedCredentials.password,
            rememberMe: true,
          });
        }
      }

      setIsReady(true);
    }

    void bootstrapForm();

    return () => {
      cancelled = true;
    };
  }, [form]);

  function handleLoginTypeChange(nextType: LoginType) {
    setLoginType(nextType);
    form.reset(getDefaultValues(nextType));
    form.setValue("loginType", nextType, { shouldValidate: true });
  }

  function onSubmit(values: LoginFormValues) {
    login({
      ...values,
      loginType,
    });
  }

  if (!isReady) {
    return (
      <div className="glass-card glow-border mx-auto w-full max-w-[420px] overflow-hidden rounded-xl">
        <div className="loading-bar">
          <div className="animate-shimmer h-full w-full" />
        </div>
        <LoginSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-scale-in mx-auto w-full max-w-[420px]">
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

        <div className="animate-stagger-up mb-6 space-y-2 text-left">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Bienvenido de nuevo
          </h2>
          <p className="text-sm text-muted-foreground">
            {loginType === "empleado"
              ? "Ingresa con tu documento y contraseña"
              : "Ingresa con el correo de tu empresa"}
          </p>
        </div>

        <div className="animate-stagger-up mb-6 grid grid-cols-2 gap-2 rounded-xl border border-border/80 bg-muted/30 p-1">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleLoginTypeChange("empleado")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-all",
              loginType === "empleado"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Soy empleado
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleLoginTypeChange("empresa")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-all",
              loginType === "empresa"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Soy empresa
          </button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <FormField
              control={form.control}
              name="loginType"
              render={({ field }) => (
                <input type="hidden" {...field} value={loginType} />
              )}
            />

            {loginType === "empleado" ? (
              <FormField
                control={form.control}
                name="documento"
                render={({ field }) => (
                  <FormItem className="animate-stagger-up stagger-1">
                    <FormLabel className="text-foreground/80">
                      Número de documento
                    </FormLabel>
                    <FormControl>
                      <div className="login-field relative rounded-xl">
                        <User className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="12345678"
                          type="text"
                          inputMode="numeric"
                          autoComplete="username"
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
            ) : (
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
                          placeholder="correo@empresa.com"
                          type="email"
                          inputMode="email"
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
            )}

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="animate-stagger-up stagger-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-foreground/80">
                      Contraseña
                    </FormLabel>
                    {loginType === "empresa" ? (
                      <Link
                        to={ROUTES.forgotPassword}
                        className="link-hover text-xs font-medium text-primary hover:text-primary/80"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    ) : null}
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

            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="animate-stagger-up stagger-3 flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      id="remember"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormLabel
                    htmlFor="remember"
                    className="cursor-pointer text-sm font-normal text-muted-foreground transition-colors duration-300 hover:text-foreground"
                  >
                    Recordarme en este dispositivo
                  </FormLabel>
                </FormItem>
              )}
            />

            {error && (
              <div
                role="alert"
                className="animate-shake rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {error instanceof ApiError
                  ? error.message
                  : "Credenciales incorrectas. Verifica tus datos e intenta de nuevo."}
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

        {loginType === "empleado" ? (
          <div className="animate-stagger-up stagger-5 mt-8 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-muted-foreground">¿Primera vez aquí?</p>
            <Button
              variant="outline"
              asChild
              disabled={isPending}
              className="auth-outline-btn h-9 rounded-xl px-6 font-medium transition-all duration-300"
            >
              <Link to={`${ROUTES.register}?activar=1`}>Activa tu cuenta</Link>
            </Button>
          </div>
        ) : (
          <div className="animate-stagger-up stagger-5 mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Acceso exclusivo para cuentas de empresa
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
              Conectando con el servidor...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
