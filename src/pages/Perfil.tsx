import { User, Building2, Mail, Phone, Shield, ChevronRight } from "lucide-react";

export default function Perfil() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-foreground">Perfil</h1>

      {/* User Card */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-display font-bold text-xl">JD</span>
        </div>
        <div>
          <p className="text-lg font-display font-bold text-foreground">Juan Domínguez</p>
          <p className="text-sm text-muted-foreground">Empleado · Desde Ene 2025</p>
          <div className="flex items-center gap-1 mt-1">
            <Shield className="h-3 w-3 text-primary" />
            <span className="text-xs text-primary font-medium">Cuenta verificada</span>
          </div>
        </div>
      </div>

      {/* Info Sections */}
      <div className="glass-card divide-y divide-border">
        <ProfileRow icon={Mail} label="Correo" value="juan@empresa.com" />
        <ProfileRow icon={Phone} label="Teléfono" value="+52 55 1234 5678" />
        <ProfileRow icon={Building2} label="Empresa" value="Tech Solutions S.A." />
        <ProfileRow icon={User} label="Número de empleado" value="EMP-2025-0342" />
      </div>

      {/* Settings */}
      <div className="glass-card divide-y divide-border">
        {["Cambiar contraseña", "Notificaciones", "Privacidad", "Términos y condiciones", "Cerrar sesión"].map((item, i) => (
          <button key={i} className={`w-full flex items-center justify-between p-4 text-sm hover:bg-secondary/50 transition-colors ${
            item === "Cerrar sesión" ? "text-destructive" : "text-foreground"
          }`}>
            <span>{item}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground font-medium">{value}</p>
      </div>
    </div>
  );
}
