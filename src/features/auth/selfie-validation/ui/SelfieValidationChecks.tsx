import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelfieValidationState } from "../types";
import { SelfieVerificationLoader } from "./SelfieVerificationLoader";

interface SelfieValidationChecksProps {
  state: SelfieValidationState;
}

export function SelfieValidationChecks({ state }: SelfieValidationChecksProps) {
  if (state.phase === "idle" || state.phase === "camera") {
    return null;
  }

  const isLoading =
    state.phase === "validating" || state.phase === "initializing";

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/10 px-3 py-3">
      {isLoading && (
        <div
          className="flex items-center gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/[0.06] via-primary/[0.03] to-accent/[0.04] px-3 py-2.5"
          role="status"
          aria-live="polite"
          aria-label={state.progressMessage}
        >
          <SelfieVerificationLoader />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium leading-snug text-foreground">
              {state.progressMessage}
            </p>
            <div
              className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-primary/10"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-accent transition-[width] duration-500 ease-out"
                style={{
                  width: `${Math.max(8, Math.round(state.progress * 100))}%`,
                }}
              />
            </div>
          </div>
          <span className="shrink-0 text-xs font-bold tabular-nums text-primary">
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
