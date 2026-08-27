import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AppAnimatedBackground } from "@/components/AppAnimatedBackground";
import { NotificationPopover } from "@/components/header/NotificationPopover";
import { UserProfilePopover } from "@/components/header/UserProfilePopover";
import { WhatsAppSupportFab } from "@/components/WhatsAppSupportFab";
import { EMPLOYER_SIDEBAR_ITEMS } from "@/components/sidebar/employerSidebarNavConfig";
import { Outlet, useLocation } from "react-router-dom";
import { useExcelBranding } from "@/features/employer-panel";

export function EmployerLayout() {
  const location = useLocation();
  // Hidrata personalización de Excels desde BD al entrar al panel empresa.
  useExcelBranding();

  return (
    <SidebarProvider className="h-svh max-h-svh overflow-hidden">
      <AppSidebar
        brandSubtitle="Panel empresa"
        navItems={EMPLOYER_SIDEBAR_ITEMS}
        sectionLabel="Principal"
      />
      <SidebarInset className="relative min-w-0 h-svh max-h-svh flex flex-col overflow-hidden bg-background">
        <AppAnimatedBackground />
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-primary/10 bg-shell/95 px-4 backdrop-blur-md">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
            <NotificationPopover />
            <UserProfilePopover />
          </div>
        </header>
        <div
          className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-4 py-5 sm:p-6 md:p-10 w-full min-w-0"
        >
          <Outlet />
        </div>
        <WhatsAppSupportFab />
      </SidebarInset>
    </SidebarProvider>
  );
}
