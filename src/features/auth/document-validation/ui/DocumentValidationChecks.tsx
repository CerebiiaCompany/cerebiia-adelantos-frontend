import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SideValidationState, ValidationCheckItem } from "../types";

interface DocumentValidationChecksProps {
  state: SideValidationState;
}

function isAdvisoryCheck(check: ValidationCheckItem): boolean {
  return check.id === "brightness";
}

export function DocumentValidationChecks({ state }: DocumentValidationChecksProps) {
  if (state.status === "idle") {
    return null;
  }

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/10 px-3 py-3">
      {state.status === "analyzing" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>{state.progressMessage}</span>
          <span className="ml-auto font-medium text-primary">
            {Math.round(state.progress * 100)}%
          </span>
        </div>
      )}

      {state.checks.length > 0 && (
        <ul className="space-y-1.5">
          {state.checks.map((check) => {
            const isAdvisory = !check.passed && isAdvisoryCheck(check);

            return (
              <li
                key={check.id}
                className={cn(
                  "flex items-start gap-2 text-xs",
                  check.passed
                    ? "text-foreground"
                    : isAdvisory
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-destructive",
                )}
              >
                {check.passed ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                ) : isAdvisory ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <div>
                  <span>{check.label}</span>
                  {!check.passed && check.message && (
                    <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                      {isAdvisory
                        ? `${check.message} (puedes continuar)`
                        : check.message}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
