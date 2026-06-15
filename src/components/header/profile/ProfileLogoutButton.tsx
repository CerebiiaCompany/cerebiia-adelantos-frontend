import { Loader2, LogOut } from "lucide-react";
import { useLogout } from "@/features/auth";
import { cn } from "@/lib/utils";

interface ProfileLogoutButtonProps {
  className?: string;
}

export function ProfileLogoutButton({ className }: ProfileLogoutButtonProps) {
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className={cn("border-t border-border/60 bg-background p-2.5 sm:p-3", className)}>
      <button
        type="button"
        disabled={isPending}
        onClick={() => logout()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/[0.06] px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut className="h-4 w-4" aria-hidden="true" />
        )}
        {isPending ? "Cerrando sesión..." : "Cerrar sesión"}
      </button>
    </div>
  );
}
