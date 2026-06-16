import { NotificationItem } from "@/components/header/NotificationItem";
import { PageHeader } from "@/components/layout/PageHeader";
import { useNotifications } from "@/features/notifications";
import { Bell } from "lucide-react";

export default function Notificaciones() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

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
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="text-xs text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
          >
            Marcar todo como leído
          </button>
        }
      />
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
