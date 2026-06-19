import { AppAnimatedBackground } from "@/components/AppAnimatedBackground";
import { UserProfilePopover } from "@/components/header/UserProfilePopover";
import { Outlet, useLocation } from "react-router-dom";

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <AppAnimatedBackground />
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-primary/10 bg-shell/95 px-4 backdrop-blur-md">
        <div className="font-display text-sm font-semibold text-foreground">
          AdeCerebiia · Admin
        </div>
        <UserProfilePopover />
      </header>
      <main
        key={location.pathname}
        className="animate-app-page-enter relative z-10 overflow-auto p-4 md:p-6"
      >
        <Outlet />
      </main>
    </div>
  );
}
