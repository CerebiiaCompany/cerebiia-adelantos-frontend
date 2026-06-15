import { NotificationItem } from "@/components/header/NotificationItem";
import { DEMO_NOTIFICATIONS } from "@/shared/config/demoNotifications";

export default function Notificaciones() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Notificaciones
        </h1>
        <button
          type="button"
          className="text-xs text-primary hover:underline"
        >
          Marcar todo como leído
        </button>
      </div>

      <div className="space-y-2">
        {DEMO_NOTIFICATIONS.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
