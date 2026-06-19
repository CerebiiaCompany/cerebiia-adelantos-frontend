import {
  Banknote,
  Lightbulb,
  LineChart,
  Sparkles,
} from "lucide-react";
import {
  AnimatedCurrency,
  AnimatedPercent,
} from "@/components/ui/animated-number";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdvanceMonthlyChart } from "@/features/advance/ui/AdvanceMonthlyChart";
import { ControlUsageDonutCard } from "@/features/control/ui/ControlUsageDonutCard";
import { useEmployeeControlData } from "@/features/control/model/useEmployeeControlData";

export default function Control() {
  const control = useEmployeeControlData();

  if (!control) return null;

  const {
    usedPercent,
    usedAmount,
    limitAmount,
    nextPaymentNet,
    limitDelta,
    monthlyAdvanceData,
  } = control;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in space-y-6">
      <PageHeader
        icon={LineChart}
        title="Control de uso"
        description="Monitorea tus adelantos y límites"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ControlUsageDonutCard
          percent={usedPercent}
          usedAmount={usedAmount}
          limitAmount={limitAmount}
        />

        <div className="group/control-stat glass-card flex min-h-[240px] flex-col items-center justify-center p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className="control-icon-shine mb-4 inline-flex text-primary control-icon-motion-sparkles">
            <Sparkles className="h-6 w-6" strokeWidth={2.25} />
          </span>
          <div className="flex w-full max-w-[220px] flex-col items-center gap-1">
            <AnimatedCurrency
              value={limitAmount}
              className="font-display text-2xl font-bold text-gradient"
            />
            <p className="text-sm text-muted-foreground">Límite dinámico</p>
            <p className="text-xs text-primary">
              {limitDelta > 0 ? (
                <>
                  +
                  <AnimatedCurrency
                    value={limitDelta}
                    className="inline"
                    duration={800}
                  />{" "}
                  vs mes anterior
                </>
              ) : (
                "Sin variación este mes"
              )}
            </p>
          </div>
        </div>

        <div className="group/control-stat glass-card flex min-h-[240px] flex-col items-center justify-center p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
          <span className="control-icon-shine mb-4 inline-flex text-[hsl(260_70%_50%)] control-icon-motion-banknote">
            <Banknote className="h-6 w-6" strokeWidth={2.25} />
          </span>
          <div className="flex w-full max-w-[220px] flex-col items-center gap-1">
            <AnimatedCurrency
              value={nextPaymentNet}
              className="font-display text-2xl font-bold text-foreground"
            />
            <p className="text-sm text-muted-foreground">Próximo pago neto</p>
            <p className="text-xs text-muted-foreground">Descontando adelantos</p>
          </div>
        </div>
      </div>

      <AdvanceMonthlyChart
        data={monthlyAdvanceData}
        title="Historial de adelantos"
        hint="Uso mensual: adelantado vs cupo disponible"
      />

      <div className="group/control-tip glass-card flex items-start gap-3 border-primary/15 p-4 transition-all duration-300 hover:border-primary/25 hover:shadow-md">
        <span className="control-icon-shine inline-flex shrink-0 text-primary control-icon-motion-tip">
          <Lightbulb className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">Consejo financiero</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {usedAmount === 0 ? (
              <>
                Tu cuenta está limpia. Puedes adelantar hasta el 30% de tu salario
                cuando lo necesites.
              </>
            ) : (
              <>
                Estás usando el{" "}
                <AnimatedPercent
                  value={usedPercent}
                  className="inline font-medium text-foreground"
                  duration={800}
                />{" "}
                de tu límite este mes.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
