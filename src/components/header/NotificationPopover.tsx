import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationPanel } from "@/components/header/NotificationPanel";
import {
  HEADER_POPOVER_COLLISION_PADDING,
  headerPopoverContentClass,
} from "@/components/header/headerPopoverStyles";
import { useNotifications } from "@/features/notifications";
import { ROUTES } from "@/shared/config/routes";

export function NotificationPopover() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { unreadNotifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const handleViewAll = () => {
    setOpen(false);
    navigate(ROUTES.employee.notificaciones);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      return;
    }

    markAllAsRead();
    toast.success("Todas las notificaciones fueron marcadas como leídas");
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    setOpen(false);
    navigate(ROUTES.employee.notificaciones);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={
            unreadCount > 0
              ? `Notificaciones, ${unreadCount} sin leer`
              : "Notificaciones"
          }
          className="relative rounded-xl p-2 text-muted-foreground transition-all duration-300 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=open]:bg-primary/5 data-[state=open]:text-primary"
        >
          <Bell className="h-5 w-5" strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-gradient-primary ring-2 ring-background">
              <span className="sr-only">{unreadCount} notificaciones nuevas</span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={10}
        collisionPadding={HEADER_POPOVER_COLLISION_PADDING}
        className={headerPopoverContentClass()}
      >
        <NotificationPanel
          unreadNotifications={unreadNotifications}
          unreadCount={unreadCount}
          onNotificationClick={handleNotificationClick}
          onMarkAllAsRead={handleMarkAllAsRead}
          onViewAll={handleViewAll}
        />
      </PopoverContent>
    </Popover>
  );
}
