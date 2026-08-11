import { useMemo, useRef, useState } from "react";
import { FileUp, Paperclip, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
import { useCreateReporteDatoIncorrecto } from "@/features/advance/model/useCreateReporteDatoIncorrecto";
import { ApiError } from "@/shared/api";
import type { CampoReporteDatoIncorrecto } from "@/shared/api/types/empleado";
import { cn } from "@/lib/utils";

const FIELD_OPTIONS: Array<{
  id: CampoReporteDatoIncorrecto;
  label: string;
}> = [
  { id: "nombre", label: "Nombres completos" },
  { id: "documento", label: "Número de documento" },
  { id: "banco", label: "Banco" },
  { id: "tipo_cuenta", label: "Tipo de cuenta" },
  { id: "numero_cuenta", label: "Cuenta bancaria" },
];

const MAX_FILES = 5;
const MAX_FILE_MB = 8;
const ACCEPTED =
  "image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf";

export interface AdvanceDataSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: () => void;
}

export function AdvanceDataSupportDialog({
  open,
  onOpenChange,
  onSubmitted,
}: AdvanceDataSupportDialogProps) {
  const [selectedFields, setSelectedFields] = useState<
    CampoReporteDatoIncorrecto[]
  >([]);
  const [mensaje, setMensaje] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: createReporte, isPending } = useCreateReporteDatoIncorrecto();

  const canSubmit = useMemo(
    () =>
      selectedFields.length > 0 &&
      mensaje.trim().length >= 10 &&
      files.length > 0 &&
      !isPending,
    [selectedFields, mensaje, files, isPending],
  );

  const reset = () => {
    setSelectedFields([]);
    setMensaje("");
    setFiles([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const toggleField = (field: CampoReporteDatoIncorrecto, checked: boolean) => {
    setSelectedFields((prev) =>
      checked ? [...prev, field] : prev.filter((item) => item !== field),
    );
  };

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_FILES) {
        toast.error(`Máximo ${MAX_FILES} evidencias.`);
        break;
      }
      if (file.size > MAX_FILE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" supera ${MAX_FILE_MB} MB.`);
        continue;
      }
      next.push(file);
    }
    setFiles(next);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    createReporte(
      {
        campos_reportados: selectedFields,
        mensaje: mensaje.trim(),
        evidencias: files,
      },
      {
        onSuccess: () => {
          toast.success(
            "Mensaje enviado a soporte. Tu empresa podrá corregir los datos.",
          );
          reset();
          onOpenChange(false);
          onSubmitted?.();
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : "No pudimos enviar el mensaje. Inténtalo de nuevo.";
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto border-primary/15 bg-shell p-0 shadow-lg sm:rounded-2xl">
        <DialogHeader className="border-b border-primary/10 px-6 py-4 text-left">
          <DialogTitle className="font-display text-lg">
            Enviar mensaje a soporte
          </DialogTitle>
          <DialogDescription>
            Indica qué dato está incorrecto, describe el problema y anexa
            evidencias. Tu empresa recibirá el reporte para corregirlo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Datos incorrectos</Label>
            <div className="grid gap-2">
              {FIELD_OPTIONS.map((option) => {
                const checked = selectedFields.includes(option.id);
                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                      checked
                        ? "border-primary/30 bg-primary/[0.06]"
                        : "border-border/60 hover:bg-muted/40",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) =>
                        toggleField(option.id, value === true)
                      }
                    />
                    <span className="text-foreground">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="soporte-mensaje" className="text-sm font-medium">
              Mensaje para la empresa
            </Label>
            <Textarea
              id="soporte-mensaje"
              value={mensaje}
              onChange={(event) => setMensaje(event.target.value)}
              placeholder="Explica qué está mal y cuál debería ser el dato correcto..."
              className="min-h-[110px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 10 caracteres.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Evidencias</Label>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] px-4 py-6 text-center transition-colors hover:bg-primary/[0.06]"
            >
              <FileUp className="h-5 w-5 text-primary" aria-hidden />
              <span className="text-sm font-medium text-foreground">
                Adjuntar evidencias
              </span>
              <span className="text-xs text-muted-foreground">
                PDF o imagen · máx. {MAX_FILES} archivos · {MAX_FILE_MB} MB c/u
              </span>
            </button>

            {files.length > 0 ? (
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                  >
                    <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate text-foreground">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      aria-label={`Quitar ${file.name}`}
                      onClick={() =>
                        setFiles((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="flex gap-3 border-t border-border/60 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-1.5 h-4 w-4" />
            Cancelar
          </Button>
          <PrimaryActionButton
            type="button"
            showArrow={false}
            className="flex-1"
            loading={isPending}
            loadingText="Enviando..."
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Enviar a soporte
          </PrimaryActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
