import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserProfileData } from "@/shared/api/types";
import {
  IDENTITY_UPLOAD_MAX_MB,
  validateLaborCertFile,
} from "@/shared/validations/register.schema";
import {
  LaborCertValidationChecks,
  useLaborCertValidation,
} from "@/features/auth/labor-certification-validation";
import { GenericDocumentIllustration } from "./DocumentUploadIllustrations";

const ACCEPTED_FILE_TYPES =
  ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf";

interface RegisterLaborCertificationStepProps {
  profile: UserProfileData;
  defaultLaborCertFile: File | null;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (laborCertFile: File) => void;
}

export function RegisterLaborCertificationStep({
  profile,
  defaultLaborCertFile,
  isSubmitting,
  onBack,
  onSubmit,
}: RegisterLaborCertificationStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(defaultLaborCertFile);
  const [error, setError] = useState<string | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const employeeFullName = `${profile.firstNames} ${profile.lastNames}`.trim();

  const { state, validateFile, isAnalyzing } = useLaborCertValidation({
    employeeFullName,
    companyName: profile.companyName,
  });

  const isPdf = file?.type === "application/pdf" || file?.name.endsWith(".pdf");
  const isImage = file?.type.startsWith("image/");

  useEffect(() => {
    if (!file || !isImage) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isImage]);

  useEffect(() => {
    void validateFile(file);
  }, [file, validateFile]);

  const canContinue =
    Boolean(file) &&
    state.phase === "complete" &&
    state.canContinue &&
    !isAnalyzing &&
    !isSubmitting;

  const handleFiles = useCallback((files: FileList | null) => {
    const selected = files?.[0] ?? null;
    const validationError = validateLaborCertFile(selected);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(undefined);
    setFile(selected);
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validationError = validateLaborCertFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!file || !canContinue) return;
    onSubmit(file);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="animate-stagger-up stagger-1 rounded-xl border border-border/80 bg-muted/20 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BriefcaseBusiness className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Certificación laboral
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Carga tu certificación laboral vigente emitida por{" "}
              <span className="font-medium text-foreground">
                {profile.companyName || "tu empresa"}
              </span>
              . Asegúrate de que contenga tu fecha de vinculación laboral.
            </p>
          </div>
        </div>
      </div>

      <div className="animate-stagger-up stagger-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-left">
        <p className="text-xs leading-relaxed text-amber-900 dark:text-amber-200">
          <span className="font-semibold">Recuerda:</span> Solo puedes subir el
          documento original. No se aceptan documentos con contraseña o
          bloqueados.
        </p>
      </div>

      <div className="animate-stagger-up stagger-3 rounded-xl border border-border/80 bg-background/60 px-4 py-4">
        <p className="mb-3 text-sm font-semibold text-foreground">
          Requisitos del documento
        </p>
        <ul className="space-y-2.5">
          {[
            "Formatos permitidos: JPG, JPEG, PNG y PDF.",
            `Tamaño máximo: ${IDENTITY_UPLOAD_MAX_MB} MB.`,
            "Documento legible, completo y sin cortes.",
            "Debe corresponder a una certificación laboral vigente.",
          ].map((requirement) => (
            <li
              key={requirement}
              className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
            >
              <span
                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary"
                aria-hidden="true"
              />
              <span>{requirement}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="animate-stagger-up stagger-4 space-y-2">
        <div
          className={cn(
            "relative rounded-xl border-2 border-dashed transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/80 bg-muted/10",
            error && "border-destructive/40",
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            className="sr-only"
            disabled={isSubmitting || isAnalyzing}
            onChange={(event) => handleFiles(event.target.files)}
          />

          {!file ? (
            <button
              type="button"
              disabled={isSubmitting || isAnalyzing}
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-start gap-3 px-4 py-8 text-left"
            >
              <GenericDocumentIllustration className="h-16 w-28 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Subir certificación laboral
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Arrastra el archivo aquí o haz clic para seleccionarlo
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <Upload className="h-3.5 w-3.5" />
                Seleccionar archivo
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-3 px-4 py-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Vista previa certificación"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BriefcaseBusiness className="h-6 w-6" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                  {isPdf ? " · PDF" : " · Imagen"}
                </p>
                <button
                  type="button"
                  disabled={isSubmitting || isAnalyzing}
                  onClick={() => {
                    setFile(null);
                    setError(undefined);
                    if (inputRef.current) inputRef.current.value = "";
                  }}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <X className="h-3 w-3" />
                  Cambiar archivo
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}

        <LaborCertValidationChecks state={state} />
      </div>

      <div className="animate-stagger-up stagger-5 flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting || isAnalyzing}
          className="auth-secondary-btn h-11 flex-1 rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button
          type="submit"
          disabled={!canContinue}
          className={cn(
            "btn-login h-11 flex-1 rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-md",
            isSubmitting && "animate-pulse-glow",
          )}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Continuar
              <ArrowRight className="btn-arrow ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
