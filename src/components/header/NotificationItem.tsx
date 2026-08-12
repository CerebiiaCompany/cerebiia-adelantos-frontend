import type { AppNotification } from "@/features/notifications";
import { cn } from "@/lib/utils";

const KIND_ICON_COLORS: Record<string, string> = {
  advance_requested: "text-primary",
  advance_approved: "text-emerald-600",
  advance_paid: "text-primary",
  advance_rejected: "text-destructive",
  payment_evidence: "text-primary",
  payroll_due_3d: "text-primary",
  next_payment_net_updated: "text-primary",
  cupo_80: "text-warning",
  cupo_low: "text-warning",
  cupo_exhausted: "text-destructive",
  achievement_unlocked: "text-primary",
  data_change_audit: "text-[hsl(260_70%_50%)]",
  support_replied: "text-primary",
  config_fee_updated: "text-primary",
  config_advance_percent_updated: "text-primary",
  config_min_amount_updated: "text-primary",
  employee_activated: "text-emerald-600",
  employee_suspended: "text-destructive",
  employer_advance_requested: "text-primary",
  employer_advance_approved: "text-emerald-600",
  employer_advance_rejected: "text-destructive",
  employer_support_message: "text-primary",
  provider_week_debt: "text-warning",
};

function getNotificationIconColor(kind: string): string {
  return KIND_ICON_COLORS[kind] ?? "text-primary";
}

interface NotificationItemProps {
  notification: AppNotification;
  compact?: boolean;
  onClick?: () => void;
}

export function NotificationItem({
  notification,
  compact = false,
  onClick,
}: NotificationItemProps) {
  const Icon = notification.icon;
  const isInteractive = Boolean(onClick);

  const content = (
    <>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          getNotificationIconColor(notification.kind),
          "mt-0.5",
        )}
      >
        <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <p
            className={cn(
              "font-semibold text-foreground",
              compact ? "text-sm" : "text-sm",
            )}
          >
            {notification.title}
          </p>
          {!notification.read && (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-primary"
              aria-hidden="true"
            />
          )}
        </div>
        <p
          className={cn(
            "text-muted-foreground",
            compact ? "mt-0.5 text-xs leading-relaxed" : "mt-0.5 text-xs",
          )}
        >
          {notification.description}
        </p>
        <p
          className={cn(
            "text-muted-foreground/60",
            compact ? "mt-1 text-[11px]" : "mt-1 text-xs",
          )}
        >
          {notification.time}
        </p>
      </div>
    </>
  );

  const className = cn(
    "flex w-full items-start gap-3 transition-colors",
    compact ? "px-4 py-3 hover:bg-secondary/40" : "glass-card p-4",
    !compact && !notification.read && "glow-border",
    compact && !notification.read && "bg-primary/[0.04]",
    isInteractive &&
      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
  );

  if (isInteractive) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
