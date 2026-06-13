import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LaborCertValidationState } from "../types";

interface LaborCertValidationChecksProps {
  state: LaborCertValidationState;
}

function isAdvisoryCheck(
  state: LaborCertValidationState,
  checkId: LaborCertValidationState["checks"][number]["id"],
): boolean {
  return checkId === "brightness" || checkId === "authenticity";
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          <span>{state.progressMessage}</span>
          <span className="ml-auto font-medium text-primary">
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

      {state.phase === "complete" &&
        state.canContinue &&
        Object.keys(state.extractedData).length > 0 && (
          <div className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-xs">
            <p className="font-medium text-foreground">Datos identificados</p>
            <dl className="mt-2 space-y-1 text-muted-foreground">
              {state.extractedData.employeeName && (
                <div>
                  <dt className="inline font-medium text-foreground">
                    Empleado:{" "}
                  </dt>
                  <dd className="inline">{state.extractedData.employeeName}</dd>
                </div>
              )}
              {state.extractedData.companyName && (
                <div>
                  <dt className="inline font-medium text-foreground">
                    Empresa:{" "}
                  </dt>
                  <dd className="inline">{state.extractedData.companyName}</dd>
                </div>
              )}
              {state.extractedData.jobTitle && (
                <div>
                  <dt className="inline font-medium text-foreground">Cargo: </dt>
                  <dd className="inline">{state.extractedData.jobTitle}</dd>
                </div>
              )}
              {state.extractedData.startDate && (
                <div>
                  <dt className="inline font-medium text-foreground">
                    Ingreso:{" "}
                  </dt>
                  <dd className="inline">{state.extractedData.startDate}</dd>
                </div>
              )}
              {state.extractedData.issueDate && (
                <div>
                  <dt className="inline font-medium text-foreground">
                    Expedición:{" "}
                  </dt>
                  <dd className="inline">{state.extractedData.issueDate}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
    </div>
  );
}
