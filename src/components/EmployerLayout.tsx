import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppAnimatedBackground } from "@/components/AppAnimatedBackground";
import { NotificationPopover } from "@/components/header/NotificationPopover";
import { UserProfilePopover } from "@/components/header/UserProfilePopover";
import { EMPLOYER_SIDEBAR_ITEMS } from "@/components/sidebar/employerSidebarNavConfig";
import { Outlet, useLocation } from "react-router-dom";

export function EmployerLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <AppSidebar
        brandSubtitle="Panel empresa"
        navItems={EMPLOYER_SIDEBAR_ITEMS}
        sectionLabel="Gestión"
      />
      <SidebarInset className="relative min-w-0 overflow-hidden bg-background">
        <AppAnimatedBackground />
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-primary/10 bg-shell/95 px-4 backdrop-blur-md">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
            <NotificationPopover />
            <UserProfilePopover />
          </div>
        </header>
        <div
          key={location.pathname}
          className="animate-app-page-enter relative z-10 flex-1 overflow-auto p-4 md:p-6"
        >
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
