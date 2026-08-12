import { MessageCircle, Volume2, Waves } from "lucide-react";
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
      aria-label="Muestra de sonidos de notificación"
      className="glass-card glow-border rounded-xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Volume2 className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              Sonidos de alerta
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escucha una muestra de cada tono. El de soporte avisa mensajes;
              el general es más suave para el resto de novedades.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={previewSupportSound}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <MessageCircle className="h-4 w-4" />
              Probar soporte
            </button>
            <button
              type="button"
              onClick={previewGeneralSound}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Waves className="h-4 w-4 text-muted-foreground" />
              Probar general
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
