import { AppAnimatedBackground } from "@/components/AppAnimatedBackground";
import { NotificationPopover } from "@/components/header/NotificationPopover";
import { UserProfilePopover } from "@/components/header/UserProfilePopover";
import { Outlet, useLocation } from "react-router-dom";

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="relative h-svh max-h-svh flex flex-col overflow-hidden bg-background">
      <AppAnimatedBackground />
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-primary/10 bg-shell/95 px-4 backdrop-blur-md">
        <div className="font-display text-sm font-semibold text-foreground">
          AdeCerebiia · Admin
        </div>
        <div className="flex items-center gap-3">
          <NotificationPopover />
          <UserProfilePopover />
        </div>
      </header>
      <main
        className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:p-6 md:p-10 w-full min-w-0"
      >
        <Outlet />
      </main>
    </div>
  );
}
