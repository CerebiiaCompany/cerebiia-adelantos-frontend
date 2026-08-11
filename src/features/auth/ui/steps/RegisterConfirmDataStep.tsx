import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  IdCard,
  Loader2,
  Pencil,
  Phone,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  FormMessage,
} from "@/components/ui/form";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";
import { TIPO_CUENTA_OPTIONS } from "@/shared/validations/empleado.schema";
import {
  activationConfirmSchema,
  DOCUMENT_TYPE_OPTIONS,
  getDocumentMaxLength,
  sanitizeDocumentNumber,
  type ActivationConfirmFormValues,
  type DocumentType,
} from "@/shared/validations/register.schema";
import { cn } from "@/lib/utils";
import {
  isRegisterContinueDisabled,
  REGISTER_STEP_FORM_OPTIONS,
} from "@/features/auth/ui/registerFormOptions";

type EditableField =
  | "nombres"
  | "apellidos"
  | "documentType"
  | "documentNumber"
  | "phone"
  | "accountType"
  | "bankId"
  | "accountNumber";

interface RegisterConfirmDataStepProps {
  defaultValues: ActivationConfirmFormValues;
  /** Nombre legible del banco precargado (evitar mostrar el UUID). */
  initialBankName?: string;
  isSubmitting?: boolean;
  onBack: () => void;
  onSubmit: (values: ActivationConfirmFormValues) => void;
}

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim(),
  );
}

function displayAccountType(value: string): string {
  return (
    TIPO_CUENTA_OPTIONS.find((option) => option.value === value)?.label ?? value
  );
}

function displayDocumentType(value: DocumentType): string {
  return (
    DOCUMENT_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function RegisterConfirmDataStep({
  defaultValues,
  initialBankName = "",
  isSubmitting = false,
  onBack,
  onSubmit,
}: RegisterConfirmDataStepProps) {
  const [editingField, setEditingField] = useState<EditableField | null>(null);

  const bancosQuery = useQuery({
    queryKey: ["auth", "activation-bancos"],
    queryFn: () => empleadosEndpoints.listBancos(),
    enabled: Boolean(env.apiUrl),
    staleTime: 10 * 60_000,
  });

  const form = useForm<ActivationConfirmFormValues>({
    ...REGISTER_STEP_FORM_OPTIONS,
    resolver: zodResolver(activationConfirmSchema),
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const bancos = bancosQuery.data ?? [];
  const bankNameById = useMemo(() => {
    const map = new Map<string, string>();
    bancos.forEach((banco) => map.set(banco.id, banco.nombre));
    if (defaultValues.bankId && initialBankName) {
      map.set(defaultValues.bankId, initialBankName);
    }
    return map;
  }, [bancos, defaultValues.bankId, initialBankName]);

  const watched = form.watch();

  const bankDisplayName = useMemo(() => {
    const resolved = bankNameById.get(watched.bankId);
    if (resolved) return resolved;
    if (!watched.bankId) return "—";
    if (bancosQuery.isLoading) return "Cargando banco...";
    if (looksLikeUuid(watched.bankId)) return "Banco no disponible";
    return watched.bankId;
  }, [bankNameById, watched.bankId, bancosQuery.isLoading]);

  const closeEdit = () => setEditingField(null);

  const renderEditableRow = (
    field: EditableField,
    label: string,
  icon: ReactNode,
  displayValue: string,
  editor: ReactNode,
  ) => {
    const isEditing = editingField === field;

    return (
      <div
        className={cn(
          "rounded-xl border px-3 py-3 transition-colors",
          isEditing
            ? "border-primary/40 bg-primary/[0.03]"
            : "border-border/70 bg-background/70",
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wide">
              {label}
            </span>
          </div>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-success"
                onClick={closeEdit}
                aria-label={`Confirmar ${label}`}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => {
                  form.resetField(field);
                  closeEdit();
                }}
                aria-label={`Cancelar edición de ${label}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => setEditingField(field)}
              aria-label={`Editar ${label}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isEditing ? (
          editor
        ) : (
          <p className="pl-9 text-sm font-medium text-foreground">
            {displayValue || "—"}
          </p>
        )}
      </div>
    );
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          setEditingField(null);
          onSubmit(values);
        })}
        className="space-y-4"
      >
        <p className="text-sm text-muted-foreground">
          Confirma que tus datos sean correctos. Usa el lápiz para corregir
          cualquier campo antes de continuar.
        </p>

        {renderEditableRow(
          "nombres",
          "Nombres",
          <User className="h-3.5 w-3.5" />,
          watched.nombres,
          <FormField
            control={form.control}
            name="nombres"
            render={({ field }) => (
              <FormItem className="pl-9">
                <FormControl>
                  <Input
                    {...field}
                    autoFocus
                    className="h-10 rounded-xl"
                    placeholder="Tus nombres"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />,
        )}

        {renderEditableRow(
          "apellidos",
          "Apellidos",
          <User className="h-3.5 w-3.5" />,
          watched.apellidos,
          <FormField
            control={form.control}
            name="apellidos"
            render={({ field }) => (
              <FormItem className="pl-9">
                <FormControl>
                  <Input
                    {...field}
                    autoFocus
                    className="h-10 rounded-xl"
                    placeholder="Tus apellidos"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />,
        )}

        {renderEditableRow(
          "documentType",
          "Tipo de documento",
          <IdCard className="h-3.5 w-3.5" />,
          displayDocumentType(watched.documentType),
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem className="pl-9">
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    const nextType = value as DocumentType;
                    const sanitized = sanitizeDocumentNumber(
                      nextType,
                      form.getValues("documentNumber"),
                    );
                    form.setValue("documentNumber", sanitized, {
                      shouldValidate: true,
                    });
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="Tipo de documento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DOCUMENT_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />,
        )}

        {renderEditableRow(
          "documentNumber",
          "Número de documento",
          <IdCard className="h-3.5 w-3.5" />,
          watched.documentNumber,
          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem className="pl-9">
                <FormControl>
                  <Input
                    {...field}
                    autoFocus
                    className="h-10 rounded-xl font-mono"
                    maxLength={getDocumentMaxLength(
                      form.getValues("documentType"),
                    )}
                    onChange={(event) => {
                      field.onChange(
                        sanitizeDocumentNumber(
                          form.getValues("documentType"),
                          event.target.value,
                        ),
                      );
                    }}
                    placeholder="Número de documento"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />,
        )}

        {renderEditableRow(
          "phone",
          "Número de teléfono",
          <Phone className="h-3.5 w-3.5" />,
          watched.phone,
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="pl-9">
                <FormControl>
                  <Input
                    {...field}
                    autoFocus
                    inputMode="numeric"
                    className="h-10 rounded-xl"
                    maxLength={10}
                    placeholder="3001234567"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />,
        )}

        {renderEditableRow(
          "accountType",
          "Tipo de cuenta",
          <CreditCard className="h-3.5 w-3.5" />,
          displayAccountType(watched.accountType),
          <FormField
            control={form.control}
            name="accountType"
            render={({ field }) => (
              <FormItem className="pl-9">
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue placeholder="Tipo de cuenta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPO_CUENTA_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />,
        )}

        {renderEditableRow(
          "bankId",
          "Banco",
          <Building2 className="h-3.5 w-3.5" />,
          bankDisplayName,
          <FormField
            control={form.control}
            name="bankId"
            render={({ field }) => (
              <FormItem className="pl-9">
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={bancosQuery.isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 rounded-xl">
                      <SelectValue
                        placeholder={
                          bancosQuery.isLoading
                            ? "Cargando bancos..."
                            : "Selecciona el banco"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bancos.map((banco) => (
                      <SelectItem key={banco.id} value={banco.id}>
                        {banco.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />,
        )}

        {renderEditableRow(
          "accountNumber",
          "Cuenta bancaria",
          <CreditCard className="h-3.5 w-3.5" />,
          watched.accountNumber,
          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem className="pl-9">
                <FormControl>
                  <Input
                    {...field}
                    autoFocus
                    className="h-10 rounded-xl font-mono"
                    placeholder="Número de cuenta"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />,
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 flex-1 rounded-xl"
            onClick={onBack}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <Button
            type="submit"
            className="h-11 flex-1 rounded-xl"
            disabled={isRegisterContinueDisabled(
              form.formState.isValid,
              isSubmitting,
              Boolean(editingField) || bancosQuery.isLoading,
            )}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="mr-2 h-4 w-4" />
            )}
            Continuar
          </Button>
        </div>
      </form>
    </Form>
  );
}
