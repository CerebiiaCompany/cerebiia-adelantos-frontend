import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SideValidationState, ValidationCheckItem } from "../types";
import { DocumentVerificationLoader } from "./DocumentVerificationLoader";

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
        <div
          className="flex items-center gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/[0.06] via-primary/[0.03] to-accent/[0.04] px-3 py-2.5"
          role="status"
          aria-live="polite"
          aria-label={state.progressMessage}
        >
          <DocumentVerificationLoader />
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
                style={{ width: `${Math.max(8, Math.round(state.progress * 100))}%` }}
              />
            </div>
          </div>
          <span className="shrink-0 text-xs font-bold tabular-nums text-primary">
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
