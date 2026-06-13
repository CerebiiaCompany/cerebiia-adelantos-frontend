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

  const currentIndex = getStepIndex(steps, currentStep);

  const progress = ((currentIndex + 1) / steps.length) * 100;

  const currentLabel = steps[currentIndex]?.label ?? "";



  return (

    <div className="animate-stagger-up mb-6">

      <div className="mx-auto max-w-full text-center">

        <p className="text-xs font-medium text-muted-foreground">

          Paso {currentIndex + 1} de {steps.length}

        </p>

        <p className="mt-1 font-display text-sm font-semibold text-foreground">

          {currentLabel}

        </p>

        <div className="mx-auto mt-3 h-1.5 w-full max-w-[280px] overflow-hidden rounded-full bg-secondary">

          <div

            className="h-full rounded-full bg-gradient-primary transition-all duration-500 ease-out"

            style={{ width: `${progress}%` }}

          />

        </div>

      </div>



      <div

        className="mt-4 flex items-center justify-center gap-1.5"

        aria-hidden="true"

      >

        {steps.map((step, index) => {

          const isCompleted = index < currentIndex;

          const isCurrent = index === currentIndex;



          return (

            <div

              key={step.id}

              className={cn(

                "flex h-2 w-2 rounded-full transition-all duration-300",

                isCompleted && "bg-primary",

                isCurrent && "h-2.5 w-2.5 bg-gradient-primary ring-2 ring-primary/25",

                !isCompleted && !isCurrent && "bg-border",

              )}

              title={step.label}

            >

              {isCompleted && (

                <span className="sr-only">{step.label} completado</span>

              )}

            </div>

          );

        })}

      </div>



      <p className="sr-only">

        Paso {currentIndex + 1}: {currentLabel}.{" "}

        {currentIndex > 0 && (

          <>

            Paso anterior completado: {steps[currentIndex - 1]?.label}.{" "}

          </>

        )}

      </p>

    </div>

  );

}

