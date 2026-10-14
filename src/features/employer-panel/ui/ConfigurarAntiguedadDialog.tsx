import { useEffect, useState } from "react";
import { Clock, Info, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormModalSelectContent } from "./FormModalSelectContent";
import {
  useEmpresaPoliticaConfig,
  useUpdateEmpresaPoliticaConfig,
} from "../model/useEmpresaPoliticaConfig";

type TimeUnit = "dias" | "semanas" | "meses";

export function ConfigurarAntiguedadDialog() {
  const [open, setOpen] = useState(false);
  const { data: config, isLoading: isConfigLoading } =
    useEmpresaPoliticaConfig();
  const { mutate: updateConfig, isPending } = useUpdateEmpresaPoliticaConfig();

  const [value, setValue] = useState<number>(0);
  const [unit, setUnit] = useState<TimeUnit>("dias");

  // Al abrir el modal o cargar la configuración, inicializar estado local
  useEffect(() => {
    if (!open) return;

    const currentDias = config?.antiguedad_minima_dias ?? 0;
    if (currentDias > 0 && currentDias % 30 === 0) {
      setUnit("meses");
      setValue(Math.round(currentDias / 30));
    } else if (currentDias > 0 && currentDias % 7 === 0) {
      setUnit("semanas");
      setValue(Math.round(currentDias / 7));
    } else {
      setUnit("dias");
      setValue(currentDias);
    }
  }, [open, config?.antiguedad_minima_dias]);

  const handleUnitChange = (newUnit: TimeUnit) => {
    if (newUnit === unit) return;

    // Convertir el valor actual a días base
    const currentDays =
      unit === "meses"
        ? value * 30
        : unit === "semanas"
          ? value * 7
          : value;

    // Convertir de días base a la nueva unidad
    let converted = currentDays;
    if (newUnit === "meses") {
      converted = Math.max(0, Math.round(currentDays / 30));
    } else if (newUnit === "semanas") {
      converted = Math.max(0, Math.round(currentDays / 7));
    } else {
      converted = Math.max(0, currentDays);
    }

    setValue(converted);
    setUnit(newUnit);
  };

  const calculatedDays =
    unit === "meses"
      ? Math.max(0, Math.round(value * 30))
      : unit === "semanas"
        ? Math.max(0, Math.round(value * 7))
        : Math.max(0, Math.round(value));

  const handleSave = () => {
    updateConfig(
      { antiguedad_minima_dias: calculatedDays },
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-11 gap-2 rounded-xl border-border/80 bg-background/80 px-4 font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span>Configurar Antigüedad</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Clock className="h-5 w-5 text-primary" />
            Configuración de Antigüedad Mínima
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Define el tiempo mínimo laborado requerido para que un empleado pueda solicitar su primer adelanto de nómina.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="antiguedad-valor" className="text-sm font-semibold">
                Tiempo mínimo laborado
              </Label>
              <Input
                id="antiguedad-valor"
                type="number"
                min={0}
                step={1}
                value={Number.isNaN(value) ? "" : value}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setValue(Number.isNaN(val) ? 0 : Math.max(0, val));
                }}
                disabled={isConfigLoading || isPending}
                placeholder="Ej. 90"
                className="h-11 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="antiguedad-unidad" className="text-sm font-semibold">
                Unidad
              </Label>
              <Select
                value={unit}
                onValueChange={(val) => handleUnitChange(val as TimeUnit)}
                disabled={isConfigLoading || isPending}
              >
                <SelectTrigger id="antiguedad-unidad" className="h-11 rounded-lg">
                  <SelectValue placeholder="Unidad" />
                </SelectTrigger>
                <FormModalSelectContent>
                  <SelectItem value="dias">Días</SelectItem>
                  <SelectItem value="semanas">Semanas</SelectItem>
                  <SelectItem value="meses">Meses</SelectItem>
                </FormModalSelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">
                Regla aplicada:{" "}
                <span className="font-bold text-primary">
                  {calculatedDays === 0
                    ? "Sin restricción de antigüedad (0 días)"
                    : `${calculatedDays} día${calculatedDays === 1 ? "" : "s"} de antigüedad requeridos`}
                </span>
              </p>
              <p>
                {unit === "meses" && value > 0 ? (
                  <span>
                    Calculado como {value} mes{value === 1 ? "" : "es"} × 30 días = {calculatedDays} días.{" "}
                  </span>
                ) : unit === "semanas" && value > 0 ? (
                  <span>
                    Calculado como {value} semana{value === 1 ? "" : "s"} × 7 días = {calculatedDays} días.{" "}
                  </span>
                ) : null}
                Los empleados cuya fecha de ingreso no cumpla esta antigüedad verán el servicio restringido informándoles cuántos días les faltan.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending || isConfigLoading}
            className="gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
