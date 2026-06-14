import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, IdCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DOCUMENT_TYPE_OPTIONS,
  sanitizeDocumentNumber,
  verifyDocumentSchema,
  type DocumentType,
  type VerifyDocumentFormValues,
} from "@/shared/validations/register.schema";

const documentPlaceholders: Record<DocumentType, string> = {
  CC: "Ej: 1234567890",
  PASSPORT: "Ej: AB123456",
  CE: "Ej: 1234567890",
  PPT: "Ej: 123456789012345",
};

export type DocumentVerificationStatus = "idle" | "verified-new" | "verified-existing";

interface RegisterDocumentStepProps {
  defaultValues: VerifyDocumentFormValues;
  verificationStatus: DocumentVerificationStatus;
  isVerifying: boolean;
  onVerify: (values: VerifyDocumentFormValues) => void;
  onProceedNewUser: () => void;
}

export function RegisterDocumentStep({
  defaultValues,
  verificationStatus,
  isVerifying,
  onVerify,
  onProceedNewUser,
}: RegisterDocumentStepProps) {
  const form = useForm<VerifyDocumentFormValues>({
    resolver: zodResolver(verifyDocumentSchema),
    defaultValues: {
      ...defaultValues,
      acceptMandatorySensitiveTreatment:
        defaultValues.acceptMandatorySensitiveTreatment ?? false,
      acceptAccessoryTreatment:
        defaultValues.acceptAccessoryTreatment ?? false,
    },
  });

  const documentType = form.watch("documentType");
  const hasMandatoryConsent = form.watch("acceptMandatorySensitiveTreatment");
  const isVerifiedNew = verificationStatus === "verified-new";
  const isDocumentLocked = verificationStatus !== "idle";
  const showVerifiedSuccess = isVerifiedNew && hasMandatoryConsent;
  const canSubmit = hasMandatoryConsent && !isVerifying;

  useEffect(() => {
    if (!documentType || isDocumentLocked) return;

    const current = form.getValues("documentNumber");
    const sanitized = sanitizeDocumentNumber(documentType, current);
    if (sanitized !== current) {
      form.setValue("documentNumber", sanitized, { shouldValidate: true });
    }
  }, [documentType, form, isDocumentLocked]);

  function handleSubmit(values: VerifyDocumentFormValues) {
    if (!values.acceptMandatorySensitiveTreatment) {
      void form.trigger("acceptMandatorySensitiveTreatment");
      return;
    }

    if (isVerifiedNew) {
      onProceedNewUser();
      return;
    }

    onVerify(values);
  }

  const buttonLabel = isVerifiedNew
    ? "Registrarse"
    : "Verificar";

  const loadingLabel = isVerifiedNew
    ? "Preparando registro..."
    : "Verificando documento...";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5"
        noValidate
      >
        <FormField
          control={form.control}
          name="documentType"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-1">
              <FormLabel className="text-foreground/80">
                Tipo de documento
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.trigger("documentNumber");
                }}
                value={field.value}
                disabled={isVerifying || isDocumentLocked}
              >
                <FormControl>
                  <SelectTrigger className="login-field h-11 rounded-xl border-border/80 bg-background/80 text-left transition-all duration-300 focus:ring-primary/30 disabled:opacity-60">
                    <SelectValue placeholder="Selecciona tu documento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/80">
                  {DOCUMENT_TYPE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="auth-select-item cursor-pointer rounded-lg"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentNumber"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-2">
              <FormLabel className="text-foreground/80">
                Número de documento
              </FormLabel>
              <FormControl>
                <div className="login-field relative rounded-xl">
                  <IdCard className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={
                      documentType
                        ? documentPlaceholders[documentType]
                        : "Selecciona primero el tipo de documento"
                    }
                    disabled={isVerifying || !documentType || isDocumentLocked}
                    inputMode={
                      documentType === "PASSPORT" ? "text" : "numeric"
                    }
                    className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 transition-all duration-300 focus-visible:ring-primary/30 disabled:opacity-60"
                    {...field}
                    onChange={(event) => {
                      const value = documentType
                        ? sanitizeDocumentNumber(
                            documentType,
                            event.target.value,
                          )
                        : event.target.value;
                      field.onChange(value);
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
          name="acceptMandatorySensitiveTreatment"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-3 flex flex-row items-start gap-3 space-y-0 rounded-xl border border-border/60 bg-background/40 p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  disabled={isVerifying}
                  className="mt-0.5"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer text-sm font-normal leading-relaxed text-foreground">
                  Autorizo el tratamiento de mis datos para finalidades
                  obligatorias y sensibles.{" "}
                  <a
                    href="#"
                    className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                    onClick={(event) => event.preventDefault()}
                  >
                    Ver términos y condiciones y política de tratamiento de
                    datos.
                  </a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="acceptAccessoryTreatment"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-4 flex flex-row items-start gap-3 space-y-0 rounded-xl border border-border/60 bg-background/40 p-4">
              <FormControl>
                <Checkbox
                  checked={field.value ?? false}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  disabled={isVerifying}
                  className="mt-0.5"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer text-sm font-normal leading-relaxed text-foreground">
                  Autorizo el tratamiento de mis datos para finalidades
                  accesorias.{" "}
                  <a
                    href="#"
                    className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
                    onClick={(event) => event.preventDefault()}
                  >
                    Ver detalle de finalidades accesorias.
                  </a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {showVerifiedSuccess && (
          <div
            role="status"
            className="animate-stagger-up stagger-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground"
          >
            Documento verificado. No encontramos una cuenta asociada. Completa
            tus datos para registrarte.
          </div>
        )}

        <Button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "btn-login animate-stagger-up stagger-6 h-11 w-full rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-md",
            isVerifying && "animate-pulse-glow",
            !canSubmit && "opacity-60",
          )}
        >
          {isVerifying ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingLabel}
            </span>
          ) : (
            <>
              {buttonLabel}
              <ArrowRight className="btn-arrow h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
