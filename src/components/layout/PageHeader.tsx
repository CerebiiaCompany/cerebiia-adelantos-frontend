import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  icon: LucideIcon;
  className?: string;
  actions?: ReactNode;
  iconContainerClassName?: string;
  iconClassName?: string;
};

export function PageHeader({
  title,
  description,
  icon: Icon,
  className,
  actions,
  iconContainerClassName,
  iconClassName,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            iconContainerClassName ??
              "border border-primary/10 bg-primary/10",
          )}
        >
          <Icon
            className={cn("h-6 w-6", iconClassName ?? "text-primary")}
            strokeWidth={2.25}
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {title}
          </h1>
          {description ? (
            <div className="text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
