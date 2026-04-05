import { Bell, Zap, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";

const notifications = [
  { icon: Zap, title: "Adelanto procesado", desc: "Tu adelanto de $500.000 fue transferido exitosamente.", time: "Hace 2 horas", read: false },
  { icon: Calendar, title: "Próximo pago", desc: "Tu nómina de $4.800.000 se depositará el 15 de abril.", time: "Hace 1 día", read: false },
  { icon: AlertTriangle, title: "Límite actualizado", desc: "Tu límite dinámico aumentó a $2.400.000 basado en tu historial.", time: "Hace 3 días", read: true },
  { icon: CheckCircle2, title: "Logro desbloqueado", desc: "¡Felicidades! Obtuviste 'Control total' (+500 pts).", time: "Hace 5 días", read: true },
  { icon: Bell, title: "Recordatorio", desc: "Recuerda revisar tu presupuesto mensual en el asistente.", time: "Hace 1 semana", read: true },
];

export default function Notificaciones() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">Notificaciones</h1>
        <button className="text-xs text-primary hover:underline">Marcar todo como leído</button>
      </div>

      <div className="space-y-2">
        {notifications.map((n, i) => (
          <div key={i} className={`glass-card p-4 flex items-start gap-3 ${!n.read ? "glow-border" : ""}`}>
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <n.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{n.title}</p>
                {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
