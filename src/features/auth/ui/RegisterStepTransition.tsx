import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RegisterStepDirection = "forward" | "back";

interface RegisterStepTransitionProps {
  stepKey: string;
  direction: RegisterStepDirection;
  children: ReactNode;
  className?: string;
}

export function RegisterStepTransition({
  stepKey,
  direction,
  children,
  className,
}: RegisterStepTransitionProps) {
  return (
    <div
      key={stepKey}
      className={cn(
        direction === "forward"
          ? "auth-step-enter-forward"
          : "auth-step-enter-back",
        className,
      )}
    >
      {children}
    </div>
  );
}
