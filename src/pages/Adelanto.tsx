import { useState } from "react";
import { Zap, Shield, Clock, CheckCircle2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  AnimatedCurrency,
  AnimatedNumber,
} from "@/components/ui/animated-number";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

const COUNT_DURATION = 450;
const MIN_AMOUNT = 100_000;

function choiceButtonClass(selected: boolean, className?: string) {
  return cn(
    "font-medium transition-all duration-200 ease-out",
    "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
    selected
      ? "bg-gradient-primary text-primary-foreground shadow-sm shadow-primary/20 hover:brightness-110 hover:shadow-primary/30"
      : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary hover:ring-1 hover:ring-primary/20",
    className,
  );
}

function secondaryButtonClass(className?: string) {
  return cn(
    "font-medium transition-all duration-200 ease-out",
    "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
    "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary hover:ring-1 hover:ring-primary/20",
    className,
  );
}

function textLinkButtonClass(className?: string) {
  return cn(
    "transition-all duration-200 ease-out",
    "rounded-lg px-3 py-1.5 hover:bg-primary/10 hover:text-primary",
    className,
  );
}

export default function Adelanto() {
  const [amount, setAmount] = useState(0);
  const [installments, setInstallments] = useState(1);
  const [step, setStep] = useState<"select" | "confirm" | "done">("select");
  const maxAmount = 2400000;
  const fee = Math.round(amount * 0.025);
  const total = amount - fee;
  const installmentValue = Math.round(total / installments);
  const canRequest = amount >= MIN_AMOUNT;

  if (step === "done") {
    return (
      <div className="flex min-h-[60vh] animate-fade-in items-center justify-center">
        <div className="glass-card glow-border max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-2 font-display text-2xl font-bold text-foreground">
            ¡Adelanto aprobado!
          </h2>
          <p className="mb-4 text-muted-foreground">
            <AnimatedCurrency
              value={total}
              className="font-bold text-3xl text-primary"
              duration={800}
            />
            <br />
            se transferirán a tu cuenta en minutos.
          </p>
          <div className="glass-card mb-6 space-y-2 p-4 text-left">
            <SummaryRow label="Monto solicitado" value={amount} />
            <SummaryRow label="Comisión" value={fee} negative />
            <SummaryRow
              label="Cuotas"
              value={installments}
              isCount
            />
            <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
              <span className="text-foreground">Total a recibir</span>
              <AnimatedCurrency
                value={total}
                className="text-primary"
                duration={COUNT_DURATION}
              />
            </div>
            {installments > 1 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Valor por cuota</span>
                <AnimatedCurrency
                  value={installmentValue}
                  duration={COUNT_DURATION}
                />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("select");
              setAmount(0);
            }}
            className={textLinkButtonClass(
              "text-sm text-muted-foreground hover:text-primary",
            )}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
      <PageHeader
        icon={Zap}
        title="Solicitar adelanto"
        description="Selecciona el monto y confirma en un clic"
      />

      <div className="glass-card glow-border p-6">
        <div className="mb-6 text-center">
          <p className="mb-2 text-sm text-muted-foreground">Monto del adelanto</p>
          <AnimatedCurrency
            value={amount}
            className="font-display text-5xl font-bold text-gradient"
            duration={COUNT_DURATION}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Disponible:{" "}
            <AnimatedCurrency
              value={maxAmount}
              className="inline font-medium text-foreground"
              duration={800}
            />
          </p>
        </div>

        <div className="mb-6 px-2">
          <Slider
            value={[amount]}
            onValueChange={(v) => setAmount(v[0])}
            min={0}
            max={maxAmount}
            step={50000}
            className="cursor-pointer"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <AnimatedCurrency
              value={maxAmount}
              className="inline"
              duration={COUNT_DURATION}
            />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[500000, 1000000, 1500000, 2000000].map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={choiceButtonClass(
                amount === a,
                "min-w-0 rounded-lg px-2 py-2.5 text-xs sm:px-3 sm:text-sm",
              )}
            >
              <AnimatedCurrency value={a} duration={COUNT_DURATION} />
            </button>
          ))}
        </div>

        <div className="mb-6">
          <p className="mb-3 text-center text-sm font-semibold text-foreground">
            Número de cuotas
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setInstallments(n)}
                className={choiceButtonClass(
                  installments === n,
                  "rounded-lg py-2 text-sm",
                )}
              >
                {n} {n === 1 ? "cuota" : "cuotas"}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card space-y-3 p-4">
          <h4 className="text-sm font-semibold text-foreground">
            Simulación del adelanto
          </h4>
          <SummaryRow label="Monto solicitado" value={amount} />
          <SummaryRow label="Comisión (2.5%)" value={fee} negative />
          <SummaryRow label="Cuotas" value={installments} isCount />
          <div className="flex justify-between border-t border-border pt-2 text-sm font-bold">
            <span className="text-foreground">Recibirás</span>
            <AnimatedCurrency
              value={total}
              className="text-primary"
              duration={COUNT_DURATION}
            />
          </div>
          {installments > 1 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Valor por cuota</span>
              <AnimatedCurrency
                value={installmentValue}
                duration={COUNT_DURATION}
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: Zap, title: "Instantáneo", desc: "Recibe en minutos" },
          { icon: Shield, title: "Seguro", desc: "Datos encriptados" },
          { icon: Clock, title: "Sin trámites", desc: "1 clic y listo" },
        ].map((f, i) => (
          <div key={i} className="glass-card flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{f.title}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {step === "select" ? (
        <PrimaryActionButton
          type="button"
          onClick={() => setStep("confirm")}
          disabled={!canRequest}
          className={cn(
            "w-full py-4 font-display text-lg font-bold",
            canRequest && "animate-pulse-glow",
          )}
        >
          {canRequest ? (
            <>
              Solicitar{" "}
              <AnimatedCurrency
                value={amount}
                className="inline"
                duration={COUNT_DURATION}
              />
            </>
          ) : (
            "Selecciona un monto"
          )}
        </PrimaryActionButton>
      ) : (
        <div className="glass-card glow-border animate-slide-up p-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            ¿Confirmas tu adelanto de
          </p>
          <AnimatedCurrency
            value={amount}
            className="mb-4 font-display text-3xl font-bold text-gradient"
            duration={COUNT_DURATION}
            suffix="?"
          />
          <p className="mb-4 text-sm text-muted-foreground">
            {installments} {installments === 1 ? "cuota" : "cuotas"} de{" "}
            <AnimatedCurrency
              value={installmentValue}
              className="inline font-medium text-foreground"
              duration={COUNT_DURATION}
            />
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("select")}
              className={secondaryButtonClass("flex-1 rounded-xl py-3")}
            >
              Cancelar
            </button>
            <PrimaryActionButton
              type="button"
              showArrow={false}
              onClick={() => setStep("done")}
              className="flex-1 py-3 font-bold"
            >
              Confirmar ✓
            </PrimaryActionButton>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  negative = false,
  isCount = false,
}: {
  label: string;
  value: number;
  negative?: boolean;
  isCount?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {isCount ? (
        <AnimatedNumber
          value={value}
          className="font-medium text-foreground"
          duration={COUNT_DURATION}
        />
      ) : (
        <AnimatedCurrency
          value={value}
          sign={negative ? "-" : ""}
          className="font-medium text-foreground"
          duration={COUNT_DURATION}
        />
      )}
    </div>
  );
}
