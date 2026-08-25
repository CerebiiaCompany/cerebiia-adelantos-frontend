import { BellRing, MessageCircle, Volume2 } from "lucide-react";
import {
  playGeneralNotificationSound,
  playSupportNotificationSound,
  unlockNotificationSound,
} from "@/shared/lib/notificationSound";

function previewSupportSound() {
  unlockNotificationSound();
  playSupportNotificationSound();
}

function previewGeneralSound() {
  unlockNotificationSound();
  playGeneralNotificationSound();
}

export function NotificationSoundPreview() {
  return (
    <section
      aria-label="Probar sonidos de notificación"
      className="glass-card glow-border rounded-xl p-4 transition-all"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
            <Volume2 className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Probar alertas de sonido
            </h2>
            <p className="text-xs text-muted-foreground">
              Mismos tonos en tiempo real configurados para el sistema.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={previewGeneralSound}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/20 active:scale-95"
          >
            <BellRing className="h-4 w-4" />
            Probar alerta general
          </button>
          <button
            type="button"
            onClick={previewSupportSound}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/60 px-3.5 py-2 text-xs font-medium text-foreground transition-all duration-200 hover:bg-secondary active:scale-95"
          >
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            Probar soporte
          </button>
        </div>
      </div>
    </section>
  );
}

