import { Loader2, LogOut } from "lucide-react";
import { useLogout } from "@/features/auth";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarLogoutButtonProps {
  collapsed?: boolean;
}

export function SidebarLogoutButton({ collapsed = false }: SidebarLogoutButtonProps) {
  const { mutate: logout, isPending } = useLogout();

  return (
    <SidebarMenuItem className={cn(collapsed && "flex w-full justify-center")}>
      <SidebarMenuButton
        asChild
        tooltip="Cerrar sesión"
        className={cn(
          "sidebar-menu-link h-auto p-0 hover:bg-transparent data-[active=true]:bg-transparent",
          collapsed && "sidebar-menu-link--collapsed",
        )}
      >
        <button
          type="button"
          disabled={isPending}
          onClick={() => logout()}
          className={cn(
            "group relative flex items-center overflow-visible rounded-lg transition-colors duration-300 ease-out",
            collapsed
              ? "mx-auto h-9 w-9 shrink-0 justify-center p-0 hover:bg-transparent"
              : "w-full gap-2.5 px-2 py-1.5 hover:bg-destructive/[0.06]",
            "text-destructive/90 hover:text-destructive disabled:opacity-60",
          )}
        >
          <span
            className={cn(
              "relative flex shrink-0 items-center justify-center rounded-[10px] transition-[background-color,box-shadow] duration-300 ease-out",
              collapsed ? "aspect-square h-9 w-9" : "h-8 w-8",
              "bg-destructive/[0.08] text-destructive/80 group-hover:bg-destructive/12 group-hover:text-destructive",
            )}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="h-4 w-4" aria-hidden="true" />
            )}
          </span>
          {!collapsed && (
            <span className="truncate text-sm tracking-tight">
              {isPending ? "Cerrando sesión..." : "Cerrar sesión"}
            </span>
          )}
        </button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
