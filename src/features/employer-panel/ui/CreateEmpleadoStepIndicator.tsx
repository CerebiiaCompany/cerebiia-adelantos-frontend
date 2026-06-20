import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Datos de contacto" },
  { id: 2, label: "Información laboral" },
] as const;

interface CreateEmpleadoStepIndicatorProps {
  currentStep: 1 | 2;
}

export function CreateEmpleadoStepIndicator({
  currentStep,
}: CreateEmpleadoStepIndicatorProps) {
  const currentIndex = currentStep - 1;
  const progress = (currentStep / STEPS.length) * 100;
  const trackProgress =
    STEPS.length > 1 ? (currentIndex / (STEPS.length - 1)) * 100 : 100;
  const currentLabel = STEPS[currentIndex]?.label ?? "";

  return (
    <div
      className="mb-5 text-center"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={STEPS.length}
      aria-label={`Paso ${currentStep} de ${STEPS.length}: ${currentLabel}`}
    >
      <p className="text-xs font-medium text-muted-foreground">
        Paso {currentStep} de {STEPS.length}
      </p>
      <p className="mt-1 font-display text-sm font-semibold text-foreground">
        {currentLabel}
      </p>

      <div className="mx-auto mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mx-auto mt-4 w-full max-w-[220px] px-1">
        <div className="relative flex items-center justify-between">
          <div
            className="absolute left-2 right-2 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border"
            aria-hidden="true"
          />
          <div
            className="absolute left-2 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-primary transition-all duration-500 ease-out"
            style={{
              width: `calc((100% - 1rem) * ${trackProgress / 100})`,
            }}
            aria-hidden="true"
          />

          {STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.id} className="relative z-10" title={step.label}>
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full transition-all duration-300",
                    isCompleted &&
                      "h-2.5 w-2.5 bg-primary text-primary-foreground",
                    isCurrent &&
                      "h-3 w-3 bg-gradient-primary ring-4 ring-primary/20",
                    !isCompleted &&
                      !isCurrent &&
                      "h-2 w-2 border-2 border-border bg-background",
                  )}
                >
                  {isCompleted && (
                    <Check className="h-2 w-2 stroke-[3]" aria-hidden="true" />
                  )}
                  {isCurrent && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/90" />
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
