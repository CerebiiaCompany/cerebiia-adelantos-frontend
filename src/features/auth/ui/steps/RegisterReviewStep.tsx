import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  IdCard,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { GENDER_OPTIONS } from "@/shared/constants/colombia";
import {
  DOCUMENT_TYPE_OPTIONS,
  reviewStepSchema,
  sanitizeColombianPhone,
  type DocumentType,
  type ReviewStepFormValues,
} from "@/shared/validations/register.schema";
import type { CompanyOption, UserProfileData } from "@/shared/api/types";

interface RegisterReviewStepProps {
  documentType: DocumentType;
  documentNumber: string;
  profile: UserProfileData;
  companies: CompanyOption[];
  isLoadingCompanies: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (values: ReviewStepFormValues) => void;
}

interface ReviewSectionProps {
  title: string;
  icon: ReactNode;
  locked?: boolean;
  children: ReactNode;
  className?: string;
}

function ReviewSection({
  title,
  icon,
  locked = false,
  children,
  className,
}: ReviewSectionProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border/80 bg-background/60 p-4",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-display text-sm font-semibold text-foreground">
          {title}
        </h3>
        {locked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:ml-auto">
            <Lock className="h-3 w-3" />
            No editable
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function ReadOnlyValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export function RegisterReviewStep({
  documentType,
  documentNumber,
  profile,
  companies,
  isLoadingCompanies,
  isSubmitting,
  onBack,
  onSubmit,
}: RegisterReviewStepProps) {
  const documentTypeLabel =
    DOCUMENT_TYPE_OPTIONS.find((option) => option.value === documentType)
      ?.label ?? documentType;

  const form = useForm<ReviewStepFormValues>({
    resolver: zodResolver(reviewStepSchema),
    defaultValues: {
      firstNames: profile.firstNames,
      lastNames: profile.lastNames,
      gender: profile.gender,
      address: profile.address,
      companyId: profile.companyId,
      email: profile.email,
      phone: profile.phone,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <ReviewSection
          title="Documento de identidad"
          icon={<IdCard className="h-4 w-4" />}
          locked
          className="animate-stagger-up stagger-1"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadOnlyValue label="Tipo de documento" value={documentTypeLabel} />
            <ReadOnlyValue label="Número de documento" value={documentNumber} />
          </div>
        </ReviewSection>

        <ReviewSection
          title="Datos personales"
          icon={<User className="h-4 w-4" />}
          className="animate-stagger-up stagger-2"
        >
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstNames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Nombres</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombres completos"
                        disabled={isSubmitting}
                        className="h-11 rounded-xl border-border/80 bg-background/80 transition-all duration-300 focus-visible:ring-primary/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastNames"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">
                      Apellidos
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Apellidos completos"
                        disabled={isSubmitting}
                        className="h-11 rounded-xl border-border/80 bg-background/80 transition-all duration-300 focus-visible:ring-primary/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Género</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl border-border/80 bg-background/80 text-left focus:ring-primary/30">
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">Dirección</FormLabel>
                  <FormControl>
                    <div className="login-field relative rounded-xl">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Ej: Calle 72 #10-34"
                        disabled={isSubmitting}
                        className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 transition-all duration-300 focus-visible:ring-primary/30"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <ReadOnlyValue
                label="Ciudad"
                value={`${profile.cityName}, ${profile.department}`}
              />
              <ReadOnlyValue
                label="Día de pago"
                value={`Día ${profile.paymentDay} de cada mes`}
              />
            </div>
          </div>
        </ReviewSection>

        <ReviewSection
          title="Contacto"
          icon={<Mail className="h-4 w-4" />}
          className="animate-stagger-up stagger-3"
        >
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">
                    Correo electrónico
                  </FormLabel>
                  <FormControl>
                    <div className="login-field relative rounded-xl">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="tu@empresa.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 transition-all duration-300 focus-visible:ring-primary/30"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/80">
                    Número celular
                  </FormLabel>
                  <FormControl>
                    <div className="login-field relative rounded-xl">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="Ej: 3001234567"
                        autoComplete="tel"
                        inputMode="numeric"
                        disabled={isSubmitting}
                        className="h-11 rounded-xl border-border/80 bg-background/80 pl-10 transition-all duration-300 focus-visible:ring-primary/30"
                        {...field}
                        onChange={(event) => {
                          field.onChange(
                            sanitizeColombianPhone(event.target.value),
                          );
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </ReviewSection>

        <ReviewSection
          title="Empresa"
          icon={<Building2 className="h-4 w-4" />}
          className="animate-stagger-up stagger-4"
        >
          <FormField
            control={form.control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground/80">Empresa</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isSubmitting || isLoadingCompanies}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 rounded-xl border-border/80 bg-background/80 text-left focus:ring-primary/30">
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
        </ReviewSection>

        <div className="animate-stagger-up stagger-5 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-left">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
            <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              Verifica que tus datos sean correctos. El tipo y número de
              documento no pueden modificarse en este paso.
            </span>
          </p>
        </div>

        <div className="animate-stagger-up stagger-6 flex gap-3 pt-2">
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
            disabled={isSubmitting}
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
