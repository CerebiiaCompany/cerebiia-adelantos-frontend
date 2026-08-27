import { useEffect, useRef, useState } from "react";
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
import {
  useNotifications,
  type AppNotification,
} from "@/features/notifications";
import { cn } from "@/lib/utils";

export function NotificationPopover() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const {
    unreadNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    notificationsListPath,
  } = useNotifications();

  const prevCountRef = useRef(unreadCount);
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    // Si llegan notificaciones nuevas o se detectan sin leer al cargar
    if (
      unreadCount > prevCountRef.current ||
      (unreadCount > 0 && prevCountRef.current === 0)
    ) {
      setIsRinging(true);
      const timer = setTimeout(() => {
        setIsRinging(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  const handleViewAll = () => {
    setOpen(false);
    if (notificationsListPath) {
      navigate(notificationsListPath);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      return;
    }

    markAllAsRead();
    toast.success("Todas las notificaciones fueron marcadas como leídas");
  };

  const handleNotificationClick = (notification: AppNotification) => {
    markAsRead(notification.id);
    setOpen(false);
    navigate(
      notification.href || notificationsListPath || "/",
    );
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
          <Bell
            className={cn(
              "h-5 w-5 origin-top transition-transform",
              isRinging && "animate-subtle-bell-ring",
              unreadCount > 0 && !isRinging && "animate-subtle-bell-idle",
            )}
            strokeWidth={2}
          />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 items-center justify-center">
              {isRinging && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40 opacity-75" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-primary ring-2 ring-background">
                <span className="sr-only">{unreadCount} notificaciones nuevas</span>
              </span>
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

