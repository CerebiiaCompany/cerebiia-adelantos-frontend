import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfilePopover } from "@/components/header/UserProfilePopover";
import { Outlet, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";

export function AppLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-primary/10 bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger className="rounded-lg text-muted-foreground transition-colors duration-300 hover:bg-primary/5 hover:text-primary" />
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="relative rounded-xl p-2 text-muted-foreground transition-all duration-300 hover:bg-primary/5 hover:text-primary"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gradient-primary ring-2 ring-background" />
              </button>
              <UserProfilePopover />            </div>
          </header>
          <main
            key={location.pathname}
            className="animate-app-page-enter flex-1 overflow-auto p-4 md:p-6"
          >
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
