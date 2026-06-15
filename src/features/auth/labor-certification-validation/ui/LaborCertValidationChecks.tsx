import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LaborCertValidationState } from "../types";
import { LaborCertVerificationLoader } from "./LaborCertVerificationLoader";

interface LaborCertValidationChecksProps {
  state: LaborCertValidationState;
}

function isAdvisoryCheck(
  state: LaborCertValidationState,
  checkId: LaborCertValidationState["checks"][number]["id"],
): boolean {
  return checkId === "brightness" || checkId === "resolution" || checkId === "authenticity";
}

export function LaborCertValidationChecks({
  state,
}: LaborCertValidationChecksProps) {
  if (state.phase === "idle") {
    return null;
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-3">
      {state.phase === "analyzing" && (
        <div
          className="flex items-center gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/[0.06] via-primary/[0.03] to-accent/[0.04] px-3 py-2.5"
          role="status"
          aria-live="polite"
          aria-label={state.progressMessage}
        >
          <LaborCertVerificationLoader />
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

      {state.phase === "complete" && state.status && (
        <div
          className={cn(
            "rounded-lg px-3 py-2 text-xs",
            state.status === "approved" &&
              "border border-primary/20 bg-primary/5 text-primary",
            state.status === "review" &&
              "border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-300",
            state.status === "rejected" &&
              "border border-destructive/20 bg-destructive/5 text-destructive",
          )}
        >
          <p className="font-medium">{state.progressMessage}</p>
          {state.reason && (
            <p className="mt-1 leading-relaxed opacity-90">{state.reason}</p>
          )}
          {state.confidence > 0 && (
            <p className="mt-1 text-[11px] opacity-80">
              Confianza: {Math.round(state.confidence * 100)}%
            </p>
          )}
        </div>
      )}

      {state.phase === "complete" &&
        state.requiresManualReview &&
        state.canContinue && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Puedes continuar con tu registro. Tu certificación será revisada
              manualmente por el equipo.
            </p>
          </div>
        )}

      {state.checks.length > 0 && (
        <ul className="space-y-1.5">
          {state.checks.map((check) => {
            const isAdvisory =
              !check.passed && isAdvisoryCheck(state, check.id);
            const isWarning =
              check.tone === "warning" ||
              (check.passed && check.tone === "warning");

            return (
              <li
                key={check.id}
                className={cn(
                  "flex items-start gap-2 text-xs",
                  check.passed && !isWarning
                    ? "text-foreground"
                    : isWarning || isAdvisory
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-destructive",
                )}
              >
                {check.passed && !isWarning ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                ) : isWarning || isAdvisory ? (
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
