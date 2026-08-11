import { useMemo, useRef, useState } from "react";
import { Check, ImagePlus, Palette, Trash2, X } from "lucide-react";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  DEFAULT_EXCEL_BRANDING,
  EXCEL_COLOR_PRESETS,
  EXCEL_LOGO_MAX_BYTES,
  argbToCssHex,
  buildPaletteFromHeaderColor,
  colorsToPalette,
  paletteToColors,
  loadExcelBrandingPreferences,
  saveExcelBrandingPreferences,
  type ExcelBrandTarget,
  type ExcelBrandingPreferences,
  type ExcelColorPalette,
} from "@/shared/lib/excelBranding";
import { EXCEL_DOCUMENT_TITLES } from "@/shared/lib/excelBrandBanner";

function ExcelPreview({
  palette,
  logoDataUrl,
  title,
}: {
  palette: ExcelColorPalette;
  logoDataUrl: string | null;
  title: string;
}) {
  const headerBg = argbToCssHex(palette.headerBg);
  const headerFg = argbToCssHex(palette.headerFg);
  const accent = argbToCssHex(palette.accent);
  const altRow = argbToCssHex(palette.altRowBg);
  const footerBg = argbToCssHex(palette.footerBg);
  const text = argbToCssHex(palette.text);
  const border = argbToCssHex(palette.border);

  const headers = ["Documento", "Empleado", "Monto cuota", "Total"];
  const sampleRows = [
    ["1005026054", "Ana Pérez", "$100.000", "$100.000"],
    ["1005026055", "Luis Gómez", "$150.000", "$150.000"],
  ];

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <div
        className="overflow-hidden rounded-lg border bg-white shadow-sm"
        style={{ borderColor: border }}
      >
        <div
          className="grid grid-cols-[3.75rem_1fr] items-stretch border-b"
          style={{
            borderColor: accent,
            backgroundColor: footerBg,
            borderBottomWidth: 2,
            minHeight: 58,
          }}
        >
          <div
            className="flex items-center justify-center border-r p-1"
            style={{ borderColor: border, backgroundColor: footerBg }}
          >
            {logoDataUrl ? (
              <img
                src={logoDataUrl}
                alt="Logo empresa"
                className="h-full w-full object-fill"
              />
            ) : (
              <div
                className="flex h-full min-h-11 w-full items-center justify-center text-[10px] font-medium"
                style={{ backgroundColor: headerBg, color: headerFg }}
              >
                Logo
              </div>
            )}
          </div>
          <p
            className="flex items-center justify-center px-2 text-center text-sm font-semibold tracking-tight"
            style={{ color: argbToCssHex(palette.primaryDark) }}
          >
            {title}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-left text-[11px]">
            <thead>
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="px-2 py-1.5 font-semibold"
                    style={{
                      backgroundColor: headerBg,
                      color: headerFg,
                      borderBottom: `2px solid ${accent}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleRows.map((row, index) => (
                <tr
                  key={row[0]}
                  style={{
                    backgroundColor: index % 2 === 1 ? altRow : "#FFFFFF",
                    color: text,
                  }}
                >
                  {row.map((cell) => (
                    <td
                      key={`${row[0]}-${cell}`}
                      className="border px-2 py-1"
                      style={{ borderColor: border }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              <tr style={{ backgroundColor: footerBg, color: text }}>
                <td
                  colSpan={3}
                  className="border px-2 py-1.5 font-semibold"
                  style={{ borderColor: border }}
                >
                  TOTAL A DESCONTAR
                </td>
                <td
                  className="border px-2 py-1.5 font-semibold"
                  style={{ borderColor: border }}
                >
                  $250.000
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function CustomizeExcelsButton() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ExcelBrandingPreferences>(() =>
    loadExcelBrandingPreferences(),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const palette = useMemo(
    () =>
      colorsToPalette(draft.colors, {
        id: draft.presetId,
        label:
          draft.presetId === "custom"
            ? "Personalizado"
            : EXCEL_COLOR_PRESETS.find((p) => p.id === draft.presetId)?.label ??
              "Personalizado",
      }),
    [draft.colors, draft.presetId],
  );

  const headerCss = argbToCssHex(draft.colors.headerBg);
  const accentCss = argbToCssHex(draft.colors.accent);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDraft(loadExcelBrandingPreferences());
    }
    setOpen(next);
  };

  const applyPreset = (preset: ExcelColorPalette) => {
    setDraft((prev) => ({
      ...prev,
      presetId: preset.id,
      colors: paletteToColors(preset),
    }));
  };

  const applyCustomHeader = (hex: string) => {
    const next = buildPaletteFromHeaderColor(hex, accentCss);
    setDraft((prev) => ({
      ...prev,
      presetId: "custom",
      colors: paletteToColors(next),
    }));
  };

  const applyCustomAccent = (hex: string) => {
    const next = buildPaletteFromHeaderColor(headerCss, hex);
    setDraft((prev) => ({
      ...prev,
      presetId: "custom",
      colors: paletteToColors(next),
    }));
  };

  const handleLogoChange = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/png") && !file.type.startsWith("image/jpeg")) {
      toast.error("Usa un logo PNG o JPG.");
      return;
    }
    if (file.size > EXCEL_LOGO_MAX_BYTES) {
      toast.error("El logo no debe superar ~400 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) {
        toast.error("No se pudo leer el logo.");
        return;
      }
      setDraft((prev) => ({
        ...prev,
        logoDataUrl: result,
        logoFileName: file.name,
      }));
    };
    reader.onerror = () => toast.error("No se pudo leer el logo.");
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveExcelBrandingPreferences(draft);
    toast.success("Estilo de Excels guardado. Se aplicará en las próximas descargas.");
    setOpen(false);
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_EXCEL_BRANDING });
    toast.message("Borrador restaurado al estilo Cerebiia. Guarda para aplicar.");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-2 rounded-xl border-border/80"
        >
          <Palette className="h-4 w-4" />
          Personalizar Excels
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalizar Excels</DialogTitle>
          <DialogDescription>
            Solo cambia colores de encabezado y logo. No modifica datos ni la
            lógica de la plantilla de nómina ni de la liquidación al suspender.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <section className="space-y-3">
            <Label className="text-sm font-medium">Color libre (paleta completa)</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-xl border border-border p-3">
                <input
                  type="color"
                  value={headerCss}
                  onChange={(event) => applyCustomHeader(event.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-0"
                  aria-label="Color de encabezados"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    Encabezados
                  </span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {headerCss.toUpperCase()}
                  </span>
                </span>
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-border p-3">
                <input
                  type="color"
                  value={accentCss}
                  onChange={(event) => applyCustomAccent(event.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border border-border bg-transparent p-0"
                  aria-label="Color de acento"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    Acento / borde
                  </span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {accentCss.toUpperCase()}
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <Label className="text-sm font-medium">Atajos rápidos</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {EXCEL_COLOR_PRESETS.map((preset) => {
                const selected =
                  draft.presetId === preset.id &&
                  draft.colors.headerBg === preset.headerBg;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border hover:bg-secondary/40",
                    )}
                  >
                    <span
                      className="mt-0.5 h-8 w-8 shrink-0 rounded-md border shadow-sm"
                      style={{
                        backgroundColor: argbToCssHex(preset.headerBg),
                        borderColor: argbToCssHex(preset.accent),
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        {preset.label}
                        {selected ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : null}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {preset.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="text-sm font-medium">Aplicar a</Label>
            <RadioGroup
              value={draft.applyTo}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  applyTo: value as ExcelBrandTarget,
                }))
              }
              className="gap-2"
            >
              {(
                [
                  {
                    value: "nomina" as const,
                    label: "Solo plantilla de nómina",
                  },
                  {
                    value: "liquidacion" as const,
                    label: "Solo liquidación al suspender",
                  },
                  {
                    value: "todos" as const,
                    label: "Todos los Excels exportables de este módulo",
                  },
                ] as const
              ).map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary/40"
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`excel-target-${option.value}`}
                  />
                  {option.label}
                </label>
              ))}
            </RadioGroup>
            {draft.applyTo === "todos" ? (
              <p className="text-xs text-muted-foreground">
                Incluye plantilla de nómina, liquidación al suspender, historial
                de movimientos y retenciones de nómina. Solo colores y logo; no
                cambia datos ni lógica.
              </p>
            ) : null}
          </section>

          <section className="space-y-3">
            <Label className="text-sm font-medium">Logo de la empresa</Label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(event) =>
                  handleLogoChange(event.target.files?.[0] ?? null)
                }
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
                {draft.logoDataUrl ? "Cambiar logo" : "Anexar logo"}
              </Button>
              {draft.logoDataUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-destructive"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      logoDataUrl: null,
                      logoFileName: null,
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                  Quitar
                </Button>
              ) : null}
              {draft.logoFileName ? (
                <span className="truncate text-xs text-muted-foreground">
                  {draft.logoFileName}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  PNG o JPG · máx. ~400 KB · queda dentro de la celda A1
                </span>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="text-sm font-medium">Vista previa</Label>
            <div className="grid gap-4 lg:grid-cols-2">
              {(draft.applyTo === "nomina" || draft.applyTo === "todos") && (
                <ExcelPreview
                  palette={palette}
                  logoDataUrl={draft.logoDataUrl}
                  title={EXCEL_DOCUMENT_TITLES.nomina}
                />
              )}
              {(draft.applyTo === "liquidacion" ||
                draft.applyTo === "todos") && (
                <ExcelPreview
                  palette={palette}
                  logoDataUrl={draft.logoDataUrl}
                  title={EXCEL_DOCUMENT_TITLES.liquidacion}
                />
              )}
              {draft.applyTo === "todos" && (
                <>
                  <ExcelPreview
                    palette={palette}
                    logoDataUrl={draft.logoDataUrl}
                    title={EXCEL_DOCUMENT_TITLES.movimientos}
                  />
                  <ExcelPreview
                    palette={palette}
                    logoDataUrl={draft.logoDataUrl}
                    title={EXCEL_DOCUMENT_TITLES.retenciones}
                  />
                </>
              )}
            </div>
          </section>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="ghost" onClick={handleReset}>
            Restaurar Cerebiia
          </Button>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            <X className="mr-1.5 h-4 w-4" />
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave}>
            Guardar estilo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
