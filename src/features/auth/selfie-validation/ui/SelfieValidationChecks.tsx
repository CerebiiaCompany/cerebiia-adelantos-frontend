import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelfieValidationState } from "../types";

interface SelfieValidationChecksProps {
  state: SelfieValidationState;
}

export function SelfieValidationChecks({ state }: SelfieValidationChecksProps) {
  if (state.phase === "idle" || state.phase === "camera") {
    return null;
  }

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/10 px-3 py-3">
      {(state.phase === "validating" || state.phase === "initializing") && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>{state.progressMessage}</span>
          <span className="ml-auto font-medium text-primary">
            {Math.round(state.progress * 100)}%
          </span>
        </div>
      )}

      {state.phase === "complete" && state.progressMessage && (
        <p
          className={cn(
            "text-xs font-medium",
            state.isValid ? "text-primary" : "text-destructive",
          )}
        >
          {state.progressMessage}
        </p>
      )}

      {state.checks.length > 0 && (
        <ul className="space-y-1.5">
          {state.checks.map((check) => {
            const isWarning =
              check.tone === "warning" || (!check.passed && check.id === "liveness");

            return (
              <li
                key={check.id}
                className={cn(
                  "flex items-start gap-2 text-xs",
                  check.passed && !isWarning
                    ? "text-foreground"
                    : isWarning
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-destructive",
                )}
              >
                {check.passed && !isWarning ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                ) : isWarning ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <div>
                  <span>{check.label}</span>
                  {check.message && (
                    <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                      {check.message}
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
