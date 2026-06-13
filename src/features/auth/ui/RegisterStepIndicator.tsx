import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type RegisterFlowType = "new" | "existing";

export type RegisterStepId =
  | "document"
  | "basic-info"
  | "contact-email"
  | "contact-phone"
  | "identity-upload"
  | "review"
  | "selfie-validation"
  | "labor-certification"
  | "password";

interface StepConfig {
  id: RegisterStepId;
  label: string;
}

const NEW_USER_STEPS: StepConfig[] = [
  { id: "document", label: "Verificación" },
  { id: "basic-info", label: "Datos" },
  { id: "contact-email", label: "Correo" },
  { id: "contact-phone", label: "Celular" },
  { id: "identity-upload", label: "Documento" },
  { id: "review", label: "Revisión" },
  { id: "selfie-validation", label: "Selfie" },
  { id: "labor-certification", label: "Laboral" },
  { id: "password", label: "Contraseña" },
];

const EXISTING_USER_STEPS: StepConfig[] = [
  { id: "document", label: "Verificación" },
  { id: "contact-email", label: "Correo" },
  { id: "contact-phone", label: "Celular" },
  { id: "identity-upload", label: "Documento" },
  { id: "review", label: "Revisión" },
  { id: "selfie-validation", label: "Selfie" },
  { id: "labor-certification", label: "Laboral" },
  { id: "password", label: "Contraseña" },
];

interface RegisterStepIndicatorProps {
  flowType: RegisterFlowType;
  currentStep: RegisterStepId;
}

function getStepIndex(steps: StepConfig[], current: RegisterStepId) {
  return steps.findIndex((step) => step.id === current);
}

export function RegisterStepIndicator({
  flowType,
  currentStep,
}: RegisterStepIndicatorProps) {
  const steps =
    flowType === "existing" ? EXISTING_USER_STEPS : NEW_USER_STEPS;
  const currentIndex = Math.max(0, getStepIndex(steps, currentStep));
  const progress = ((currentIndex + 1) / steps.length) * 100;
  const trackProgress =
    steps.length > 1 ? (currentIndex / (steps.length - 1)) * 100 : 100;
  const currentLabel = steps[currentIndex]?.label ?? "";

  return (
    <div
      key={currentStep}
      className="auth-step-indicator-pulse mb-6 text-center"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Paso ${currentIndex + 1} de ${steps.length}: ${currentLabel}`}
    >
      <p className="text-xs font-medium text-muted-foreground">
        Paso {currentIndex + 1} de {steps.length}
      </p>
      <p className="mt-1 font-display text-sm font-semibold text-foreground">
        {currentLabel}
      </p>

      <div className="mx-auto mt-3 h-1.5 w-full max-w-[320px] overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-primary transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto mt-4 w-full max-w-[320px] px-1">
        <div className="relative flex items-center justify-between">
          <div
            className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border"
            aria-hidden="true"
          />
          <div
            className="absolute left-2 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-primary transition-all duration-700 ease-out"
            style={{
              width: `calc((100% - 1rem) * ${trackProgress / 100})`,
            }}
            aria-hidden="true"
          />

          {steps.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={step.id}
                className="relative z-10"
                title={step.label}
              >
                <div
                  className={cn(
                    "auth-step-dot flex items-center justify-center rounded-full transition-all duration-500 ease-out",
                    isCompleted &&
                      "auth-step-dot-completed h-2.5 w-2.5 bg-primary text-primary-foreground sm:h-3 sm:w-3",
                    isCurrent &&
                      "auth-step-dot-current h-3 w-3 bg-gradient-primary ring-[3px] ring-primary/20 sm:h-3.5 sm:w-3.5 sm:ring-4",
                    !isCompleted &&
                      !isCurrent &&
                      "h-2 w-2 border-2 border-border bg-background sm:h-2.5 sm:w-2.5",
                  )}
                >
                  {isCompleted && (
                    <Check
                      className="h-2 w-2 stroke-[3] sm:h-2.5 sm:w-2.5"
                      aria-hidden="true"
                    />
                  )}
                  {isCurrent && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/90 sm:h-2 sm:w-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
