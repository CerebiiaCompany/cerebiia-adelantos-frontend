import { Bell } from "lucide-react";
import { NotificationItem } from "@/components/header/NotificationItem";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import type { DemoNotification } from "@/shared/config/demoNotifications";

interface NotificationPanelProps {
  unreadNotifications: DemoNotification[];
  unreadCount: number;
  onNotificationClick: (id: string) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
}

export function NotificationPanel({
  unreadNotifications,
  unreadCount,
  onNotificationClick,
  onMarkAllAsRead,
  onViewAll,
}: NotificationPanelProps) {
  return (
    <div className="flex max-h-[min(85vh,520px)] flex-col overflow-hidden">
      <div className="border-b border-border/60 bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.04] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-sm shadow-primary/20">
              <Bell className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">
                Notificaciones
              </h2>
              <p className="text-xs text-muted-foreground">
                {unreadNotifications.length > 0 ? (
                  <>
                    <AnimatedNumber
                      value={unreadNotifications.length}
                      className="inline font-medium text-foreground"
                      duration={800}
                    />{" "}
                    nueva{unreadNotifications.length === 1 ? "" : "s"} sin leer
                  </>
                ) : (
                  "Estás al día con tus avisos"
                )}
              </p>
            </div>
          </div>
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="shrink-0 text-[11px] font-medium text-primary hover:underline"
            >
              Marcar todo leído
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {unreadNotifications.length > 0 ? (
          <div className="divide-y divide-border/60">
            {unreadNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                compact
                onClick={() => onNotificationClick(notification.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No tienes notificaciones nuevas
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Te avisaremos aquí cuando haya novedades importantes.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border/60 bg-background p-3">
        <Button
          type="button"
          variant="outline"
          onClick={onViewAll}
          className="h-10 w-full rounded-xl border-primary/20 text-sm font-medium text-primary hover:bg-primary/5 hover:text-primary"
        >
          Ver todas las notificaciones
        </Button>
      </div>
    </div>
  );
}
