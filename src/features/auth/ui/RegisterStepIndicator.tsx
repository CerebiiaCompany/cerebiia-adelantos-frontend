import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
  const currentIndex = getStepIndex(steps, currentStep);

  return (
    <div className="animate-stagger-up mb-6">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.id} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                    isCompleted &&
                      "bg-primary text-primary-foreground shadow-sm",
                    isCurrent &&
                      "bg-gradient-primary text-primary-foreground shadow-md ring-2 ring-primary/20",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-secondary text-muted-foreground",
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium sm:inline",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px w-4 sm:w-8",
                    index < currentIndex ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
