import type { Control } from "react-hook-form";
import { useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmpleadoFormCatalogs } from "@/features/employer-panel/model/useEmpleadoFormCatalogs";
import { FormModalSelectContent } from "@/features/employer-panel/ui/FormModalSelectContent";
import {
  sanitizeDocumentNumber,
  type DocumentType,
} from "@/shared/validations/register.schema";
import type { CreateEmpleadoFormValues } from "@/shared/validations/empleado.schema";

const inputClassName =
  "h-11 rounded-xl border-border/80 bg-background/80 transition-all duration-300 focus-visible:ring-primary/30";

const selectTriggerClassName =
  "h-11 rounded-xl border-border/80 bg-background/80 text-left transition-all duration-300 focus:ring-primary/30";

const documentPlaceholders: Record<DocumentType, string> = {
  CC: "Ej: 1234567890",
  PASSPORT: "Ej: AB123456",
  CE: "Ej: 1234567890",
  PPT: "Ej: 123456789012345",
};

interface CreateEmpleadoPersonalStepProps {
  control: Control<CreateEmpleadoFormValues>;
  disabled?: boolean;
}

export function CreateEmpleadoPersonalStep({
  control,
  disabled = false,
}: CreateEmpleadoPersonalStepProps) {
  const { documentTypes } = useEmpleadoFormCatalogs();
  const tipoDocumento = useWatch({
    control,
    name: "tipo_documento",
  }) as DocumentType | "";

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="tipo_documento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de documento</FormLabel>
            <Select
              modal={false}
              onValueChange={field.onChange}
              value={field.value || undefined}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className={selectTriggerClassName}>
                  <SelectValue placeholder="Selecciona tu documento" />
                </SelectTrigger>
              </FormControl>
              <FormModalSelectContent>
                {documentTypes.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer rounded-lg"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </FormModalSelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="documento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de documento</FormLabel>
              <FormControl>
                <Input
                  placeholder={
                    tipoDocumento
                      ? documentPlaceholders[tipoDocumento]
                      : "Selecciona primero el tipo"
                  }
                  inputMode={tipoDocumento === "PASSPORT" ? "text" : "numeric"}
                  className={inputClassName}
                  disabled={disabled || !tipoDocumento}
                  value={field.value}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  onChange={(event) => {
                    const value = tipoDocumento
                      ? sanitizeDocumentNumber(tipoDocumento, event.target.value)
                      : event.target.value;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Juan Pérez"
                  className={inputClassName}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="correo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correo electrónico</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                autoComplete="email"
                placeholder="empleado@correo.com"
                className={inputClassName}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="celular"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de celular</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="3001234567"
                className={inputClassName}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
