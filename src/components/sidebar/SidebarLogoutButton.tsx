import { Loader2, LogOut } from "lucide-react";
import { useLogout } from "@/features/auth";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface SidebarLogoutButtonProps {
  collapsed?: boolean;
}

export function SidebarLogoutButton({ collapsed = false }: SidebarLogoutButtonProps) {
  const { mutate: logout, isPending } = useLogout();

  return (
    <SidebarMenuItem className={cn(collapsed && "flex w-full justify-center")}>
      <button
        type="button"
        disabled={isPending}
        title="Cerrar sesión"
        onClick={() => logout()}
        className={cn(
          "relative flex w-full items-center rounded-lg text-destructive transition-colors duration-300 ease-out",
          collapsed
            ? "mx-auto h-9 w-9 shrink-0 justify-center p-0"
            : "gap-3 px-3 py-2",
          "hover:bg-red-400 hover:text-white",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {isPending ? (
          <Loader2
            className="h-[18px] w-[18px] shrink-0 animate-spin text-current"
            aria-hidden="true"
          />
        ) : (
          <LogOut
            className="h-[18px] w-[18px] shrink-0 text-current"
            aria-hidden="true"
          />
        )}
        {!collapsed && (
          <span className="truncate text-sm font-medium tracking-tight text-current">
            {isPending ? "Cerrando sesión..." : "Cerrar sesión"}
          </span>
        )}
      </button>
    </SidebarMenuItem>
  );
}
