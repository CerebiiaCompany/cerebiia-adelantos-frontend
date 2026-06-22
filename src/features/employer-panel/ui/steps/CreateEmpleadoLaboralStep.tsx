import type { Control } from "react-hook-form";
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
import { formatSalaryInput, normalizeSalaryInput } from "@/shared/lib";
import type { CreateEmpleadoFormValues } from "@/shared/validations/empleado.schema";

const inputClassName =
  "h-11 rounded-xl border-border/80 bg-background/80 transition-all duration-300 focus-visible:ring-primary/30";

const selectTriggerClassName =
  "h-11 rounded-xl border-border/80 bg-background/80 text-left transition-all duration-300 focus:ring-primary/30";

interface CreateEmpleadoLaboralStepProps {
  control: Control<CreateEmpleadoFormValues>;
  disabled?: boolean;
}

export function CreateEmpleadoLaboralStep({
  control,
  disabled = false,
}: CreateEmpleadoLaboralStepProps) {
  const { contractTypes, accountTypes, banks, isLoading } =
    useEmpleadoFormCatalogs();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="salario"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salario mensual</FormLabel>
              <FormControl>
                <Input
                  inputMode="decimal"
                  placeholder="1.500.000"
                  className={inputClassName}
                  disabled={disabled}
                  value={formatSalaryInput(field.value)}
                  onChange={(event) => {
                    field.onChange(normalizeSalaryInput(event.target.value));
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tipo_contrato"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de contrato</FormLabel>
              <Select
                modal={false}
                onValueChange={field.onChange}
                value={field.value || undefined}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Selecciona el contrato" />
                  </SelectTrigger>
                </FormControl>
                <FormModalSelectContent>
                  {contractTypes.map((option) => (
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
      </div>

      <FormField
        control={control}
        name="fecha_ingreso"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha de ingreso</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className={inputClassName}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="banco_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banco o plataforma</FormLabel>
              <Select
                modal={false}
                onValueChange={field.onChange}
                value={field.value || undefined}
                disabled={disabled || isLoading}
              >
                <FormControl>
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue
                      placeholder={
                        isLoading ? "Cargando bancos..." : "Selecciona el banco"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <FormModalSelectContent className="max-h-72">
                  {banks.map((option) => (
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

        <FormField
          control={control}
          name="tipo_cuenta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de cuenta</FormLabel>
              <Select
                modal={false}
                onValueChange={field.onChange}
                value={field.value || undefined}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className={selectTriggerClassName}>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                </FormControl>
                <FormModalSelectContent>
                  {accountTypes.map((option) => (
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
      </div>

      <FormField
        control={control}
        name="numero_cuenta"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de cuenta</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="123456789"
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
