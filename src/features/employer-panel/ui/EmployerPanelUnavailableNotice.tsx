import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployerPanelUnavailableNoticeProps {
  message: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  layout?: "centered" | "inline";
}

export function EmployerPanelUnavailableNotice({
  message,
  description,
  onRetry,
  retryLabel = "Reintentar",
  className,
  layout = "centered",
}: EmployerPanelUnavailableNoticeProps) {
  if (layout === "inline") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/[0.06] px-4 py-3 text-sm",
          className,
        )}
      >
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="font-medium text-foreground">{message}</p>
          {description ? (
            <p className="mt-1 text-muted-foreground">{description}</p>
          ) : null}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              {retryLabel}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-primary/15 bg-primary/[0.06] px-4 py-8 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10">
        <Info className="h-6 w-6 text-primary" />
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      {description ? (
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
