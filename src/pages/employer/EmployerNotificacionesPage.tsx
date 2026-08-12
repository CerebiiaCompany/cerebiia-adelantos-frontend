import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NotificationItem } from "@/components/header/NotificationItem";
import { PageHeader } from "@/components/layout/PageHeader";
import { useNotifications, NotificationSoundPreview } from "@/features/notifications";
import { ROUTES } from "@/shared/config/routes";
import { Bell } from "lucide-react";

export default function EmployerNotificacionesPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      return;
    }

    markAllAsRead();
    toast.success("Todas las notificaciones fueron marcadas como leídas");
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <PageHeader
        icon={Bell}
        title="Notificaciones"
        description={
          unreadCount > 0 ? `${unreadCount} sin leer` : "Todas al día"
        }
        actions={
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex w-full items-center justify-center rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground sm:w-auto sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-xs sm:hover:bg-transparent sm:hover:underline disabled:sm:no-underline"
          >
            Marcar todo como leído
          </button>
        }
      />
      <NotificationSoundPreview />
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="glass-card glow-border rounded-xl px-4 py-10 text-center">
            <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-foreground">Sin notificaciones</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Te avisaremos aquí sobre activaciones, adelantos, soporte y
              cierres de nómina.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={() => {
                markAsRead(notification.id);
                navigate(
                  notification.href || ROUTES.employer.notificaciones,
                );
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
