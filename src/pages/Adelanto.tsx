import { useState } from "react";
import { Zap, Shield, Clock, CheckCircle2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function Adelanto() {
  const [amount, setAmount] = useState(1000);
  const [step, setStep] = useState<"select" | "confirm" | "done">("select");
  const maxAmount = 2400;
  const fee = Math.round(amount * 0.025);
  const total = amount - fee;

  if (step === "done") {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="glass-card glow-border p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">¡Adelanto aprobado!</h2>
          <p className="text-muted-foreground mb-4">
            <span className="text-primary font-bold text-3xl">${total.toLocaleString()}</span><br />
            se transferirán a tu cuenta en minutos.
          </p>
          <div className="glass-card p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monto solicitado</span>
              <span className="text-foreground font-medium">${amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Comisión</span>
              <span className="text-foreground font-medium">-${fee.toLocaleString()}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
              <span className="text-foreground">Total a recibir</span>
              <span className="text-primary">${total.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={() => setStep("select")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Solicitar adelanto</h1>
        <p className="text-muted-foreground text-sm mt-1">Selecciona el monto y confirma en un clic</p>
      </div>

      {/* Amount Selector */}
      <div className="glass-card glow-border p-6">
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Monto del adelanto</p>
          <p className="text-5xl font-display font-bold text-gradient">${amount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">Disponible: ${maxAmount.toLocaleString()}</p>
        </div>

        <div className="px-2 mb-6">
          <Slider
            value={[amount]}
            onValueChange={(v) => setAmount(v[0])}
            min={100}
            max={maxAmount}
            step={50}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>$100</span>
            <span>${maxAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Quick amounts */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[500, 1000, 1500, 2000].map((a) => (
            <button
              key={a}
              onClick={() => setAmount(a)}
              className={`py-2 rounded-lg text-sm font-medium transition-all ${
                amount === a
                  ? "bg-gradient-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              ${a.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Simulation */}
        <div className="glass-card p-4 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Simulación del adelanto</h4>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monto solicitado</span>
            <span className="text-foreground">${amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Comisión (2.5%)</span>
            <span className="text-foreground">-${fee.toLocaleString()}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between text-sm font-bold">
            <span className="text-foreground">Recibirás</span>
            <span className="text-primary">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Zap, title: "Instantáneo", desc: "Recibe en minutos" },
          { icon: Shield, title: "Seguro", desc: "Datos encriptados" },
          { icon: Clock, title: "Sin trámites", desc: "1 clic y listo" },
        ].map((f, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {step === "select" ? (
        <button
          onClick={() => setStep("confirm")}
          className="w-full py-4 rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold text-lg hover:opacity-90 transition-opacity animate-pulse-glow"
        >
          Solicitar ${amount.toLocaleString()} →
        </button>
      ) : (
        <div className="glass-card glow-border p-6 text-center animate-slide-up">
          <p className="text-sm text-muted-foreground mb-3">¿Confirmas tu adelanto de</p>
          <p className="text-3xl font-display font-bold text-gradient mb-4">${amount.toLocaleString()}?</p>
          <div className="flex gap-3">
            <button onClick={() => setStep("select")} className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors">
              Cancelar
            </button>
            <button onClick={() => setStep("done")} className="flex-1 py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity">
              Confirmar ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
