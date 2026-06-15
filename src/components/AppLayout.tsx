import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppAnimatedBackground } from "@/components/AppAnimatedBackground";
import { NotificationPopover } from "@/components/header/NotificationPopover";
import { UserProfilePopover } from "@/components/header/UserProfilePopover";
import { Outlet, useLocation } from "react-router-dom";

export function AppLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <AppAnimatedBackground />
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-primary/10 bg-background/75 px-4 backdrop-blur-md">
            <SidebarTrigger className="rounded-lg text-muted-foreground transition-colors duration-300 hover:bg-primary/5 hover:text-primary" />
            <div className="flex items-center gap-3">
              <NotificationPopover />
              <UserProfilePopover />
            </div>
          </header>
          <main
            key={location.pathname}
            className="animate-app-page-enter relative z-10 flex-1 overflow-auto p-4 md:p-6"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
