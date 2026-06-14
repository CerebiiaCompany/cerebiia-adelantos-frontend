import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Loader2,
  MapPin,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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
  COLOMBIAN_DEPARTMENTS,
  GENDER_OPTIONS,
  PAYMENT_DAY_DEFAULT,
  PAYMENT_DAY_MAX,
  PAYMENT_DAY_MIN,
  type ColombianCity,
  type ColombianDepartment,
} from "@/shared/constants/colombia";
import { loadColombianMajorCities } from "@/shared/constants/colombian-cities.loader";
import {
  basicInfoSchema,
  type BasicInfoFormValues,
} from "@/shared/validations/register.schema";
import type { CompanyOption } from "@/shared/api/types";
import {
  isRegisterContinueDisabled,
  REGISTER_STEP_FORM_OPTIONS,
} from "@/features/auth/ui/registerFormOptions";

interface RegisterBasicInfoStepProps {
  defaultValues: BasicInfoFormValues;
  companies: CompanyOption[];
  isLoadingCompanies: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (values: BasicInfoFormValues) => void;
}

export function RegisterBasicInfoStep({
  defaultValues,
  companies,
  isLoadingCompanies,
  isSubmitting,
  onBack,
  onSubmit,
}: RegisterBasicInfoStepProps) {
  const form = useForm<BasicInfoFormValues>({
    ...REGISTER_STEP_FORM_OPTIONS,
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      ...defaultValues,
      paymentDay: defaultValues.paymentDay ?? PAYMENT_DAY_DEFAULT,
    },
  });

  const { isValid } = form.formState;
  const isContinueDisabled = isRegisterContinueDisabled(isValid, isSubmitting);

  const [cities, setCities] = useState<ColombianCity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  useEffect(() => {
    loadColombianMajorCities()
      .then(setCities)
      .finally(() => setIsLoadingCities(false));
  }, []);

  const selectedCityId = form.watch("cityId");

  const cityOptions = useMemo(
    () => cities,
    [cities],
  );

  function handleCityChange(cityId: string) {
    const city = cities.find((item) => item.id === cityId);
    if (!city) return;

    form.setValue("cityId", city.id, { shouldValidate: true, shouldDirty: true });
    form.setValue("department", city.department, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function handleDepartmentChange(department: ColombianDepartment) {
    form.setValue("department", department, {
      shouldValidate: true,
      shouldDirty: true,
    });

    const currentCity = cities.find((item) => item.id === selectedCityId);
    if (!currentCity || currentCity.department !== department) {
      form.setValue("cityId", "", { shouldValidate: true, shouldDirty: true });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="firstNames"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-1">
              <FormLabel className="text-foreground/80">
                Nombres completos
              </FormLabel>
              <FormControl>
                <div className="login-field relative rounded-xl">
                  <User className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ej: Juan Carlos"
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
          name="lastNames"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-2">
              <FormLabel className="text-foreground/80">
                Apellidos completos
              </FormLabel>
              <FormControl>
                <div className="login-field relative rounded-xl">
                  <User className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ej: Pérez Gómez"
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
          name="gender"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-3">
              <FormLabel className="text-foreground/80">Género</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="login-field h-11 rounded-xl border-border/80 bg-background/80 text-left transition-all duration-300 focus:ring-primary/30 disabled:opacity-60">
                    <SelectValue placeholder="Selecciona tu género" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/80">
                  {GENDER_OPTIONS.map((option) => (
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
          name="cityId"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-4">
              <FormLabel className="text-foreground/80">Ciudad</FormLabel>
              <Select
                onValueChange={(cityId) => {
                  handleCityChange(cityId);
                  field.onChange(cityId);
                }}
                value={field.value}
                disabled={isSubmitting || isLoadingCities || cityOptions.length === 0}
              >
                <FormControl>
                  <SelectTrigger className="login-field auth-field-trigger h-11 rounded-xl border-border/80 bg-background/80 text-left transition-all duration-300 focus:ring-primary/30 disabled:opacity-60">
                    <SelectValue
                      placeholder={
                        isLoadingCities
                          ? "Cargando ciudades..."
                          : "Selecciona tu ciudad"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60 rounded-xl border-border/80">
                  {cityOptions.map((city) => (
                    <SelectItem
                      key={city.id}
                      value={city.id}
                      className="auth-select-item cursor-pointer rounded-lg"
                    >
                      {city.name}
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
          name="department"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-5">
              <FormLabel className="text-foreground/80">Departamento</FormLabel>
              <Select
                onValueChange={(department) => {
                  handleDepartmentChange(department as ColombianDepartment);
                  field.onChange(department);
                }}
                value={field.value}
                disabled={isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className="login-field auth-field-trigger h-11 rounded-xl border-border/80 bg-background/80 text-left transition-all duration-300 focus:ring-primary/30 disabled:opacity-60">
                    <SelectValue placeholder="Se completa al elegir la ciudad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60 rounded-xl border-border/80">
                  {COLOMBIAN_DEPARTMENTS.map((department) => (
                    <SelectItem
                      key={department}
                      value={department}
                      className="auth-select-item cursor-pointer rounded-lg"
                    >
                      {department}
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
          name="address"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-6">
              <FormLabel className="text-foreground/80">Dirección</FormLabel>
              <FormControl>
                <div className="login-field relative rounded-xl">
                  <MapPin className="field-icon pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Ej: Calle 72 #10-34"
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
          name="companyId"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-7">
              <FormLabel className="text-foreground/80">Empresa</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isSubmitting || isLoadingCompanies}
              >
                <FormControl>
                  <SelectTrigger className="login-field h-11 rounded-xl border-border/80 bg-background/80 text-left transition-all duration-300 focus:ring-primary/30 disabled:opacity-60">
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <SelectValue
                        placeholder={
                          isLoadingCompanies
                            ? "Cargando empresas..."
                            : "Selecciona tu empresa"
                        }
                      />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60 rounded-xl border-border/80">
                  {companies.map((company) => (
                    <SelectItem
                      key={company.id}
                      value={company.id}
                      className="auth-select-item cursor-pointer rounded-lg"
                    >
                      {company.name}
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
          name="paymentDay"
          render={({ field }) => (
            <FormItem className="animate-stagger-up stagger-8">
              <FormLabel className="text-foreground/80">Día de pago</FormLabel>
              <FormControl>
                <div className="rounded-xl border border-border/80 bg-background/50 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>Día del mes</span>
                    </div>
                    <span className="font-display text-xl font-bold text-primary">
                      {field.value}
                    </span>
                  </div>
                  <Slider
                    min={PAYMENT_DAY_MIN}
                    max={PAYMENT_DAY_MAX}
                    step={1}
                    disabled={isSubmitting}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="py-2"
                  />
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>{PAYMENT_DAY_MIN}</span>
                    <span>{PAYMENT_DAY_MAX}</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="animate-stagger-up stagger-9 flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isSubmitting}
            className="auth-secondary-btn h-11 flex-1 rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Button
            type="submit"
            disabled={isContinueDisabled}
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
