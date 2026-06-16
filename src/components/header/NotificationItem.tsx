import type { DemoNotification } from "@/shared/config/demoNotifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: DemoNotification;
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
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
          compact ? "mt-0.5 h-8 w-8" : "mt-0.5 h-9 w-9",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
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
    isInteractive && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={className}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
