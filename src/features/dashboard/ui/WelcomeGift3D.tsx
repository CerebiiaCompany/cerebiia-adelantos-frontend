import { cn } from "@/lib/utils";

type WelcomeGift3DProps = {
  className?: string;
};

/**
 * Icono de regalo abierto (render SVG premium, tres cuartos + tapa inclinada).
 */
export function WelcomeGift3D({ className }: WelcomeGift3DProps) {
  return (
    <div
      className={cn(
        "relative flex h-32 w-32 shrink-0 items-center justify-center sm:h-36 sm:w-36",
        className,
      )}
      aria-hidden
    >
      <img
        src="/images/welcome-gift-open.svg"
        alt=""
        className="relative z-10 h-full w-full object-contain animate-[welcome-gift-float_3.2s_ease-in-out_infinite] drop-shadow-[0_10px_16px_rgba(15,23,42,0.16)]"
        draggable={false}
      />
    </div>
  );
}
