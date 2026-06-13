import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IDENTITY_UPLOAD_MAX_MB,
  requiresDocumentBothSides,
  validateIdentityUpload,
  type DocumentType,
  type IdentityUploadFormValues,
} from "@/shared/validations/register.schema";
import {
  DocumentValidationChecks,
  useDocumentValidation,
} from "@/features/auth/document-validation";
import {
  GenericDocumentIllustration,
  IdCardBackIllustration,
  IdCardFrontIllustration,
} from "./DocumentUploadIllustrations";

const ACCEPTED_FILE_TYPES =
  ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf";

type UploadSide = "front" | "back" | "single";

function isForeignDocumentType(type: DocumentType): boolean {
  return type === "CE" || type === "PPT" || type === "PASSPORT";
}

function buildUploadRequirements(needsBothSides: boolean): string[] {
  const requirements = [
    "Adjunte una imagen o PDF de su documento de identidad.",
    "Formatos permitidos: JPG, JPEG, PNG y PDF.",
    `Tamaño máximo: ${IDENTITY_UPLOAD_MAX_MB} MB.`,
    "El documento debe estar vigente y ser completamente legible.",
    "Evite imágenes borrosas, cortadas o con reflejos.",
  ];

  if (needsBothSides) {
    requirements.push(
      "Para cédula de ciudadanía o extranjería, cargue ambas caras del documento.",
    );
  }

  return requirements;
}

function getSideLabel(side: UploadSide): string {
  switch (side) {
    case "front":
      return "Frente";
    case "back":
      return "Reverso";
    default:
      return "Documento";
  }
}

function SideIllustration({ side }: { side: UploadSide }) {
  const className = "h-14 w-[5.5rem] shrink-0 text-primary sm:h-16 sm:w-24";

  if (side === "back") {
    return <IdCardBackIllustration className={className} />;
  }

  if (side === "front") {
    return <IdCardFrontIllustration className={className} />;
  }

  return <GenericDocumentIllustration className={className} />;
}

interface DocumentUploadZoneProps {
  side: UploadSide;
  file: File | null;
  error?: string;
  disabled?: boolean;
  onFileSelect: (file: File | null) => void;
}

function DocumentUploadZone({
  side,
  file,
  error,
  disabled,
  onFileSelect,
}: DocumentUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const handleFiles = useCallback(
    (files: FileList | null) => {
      onFileSelect(files?.[0] ?? null);
    },
    [onFileSelect],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-bold uppercase tracking-wide text-primary">
          {getSideLabel(side)}
        </p>
        {file && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Cargado
          </span>
        )}
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "rounded-xl border-2 bg-background/80 p-4 transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-primary/20 hover:border-primary/40 hover:bg-primary/[0.03]",
          file && "border-primary/35 bg-primary/[0.04]",
          error && "border-destructive/40 bg-destructive/5",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          disabled={disabled}
          onChange={(event) => handleFiles(event.target.files)}
        />

        {file ? (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/15 bg-muted/30">
              {isImage && previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`Vista previa ${getSideLabel(side)}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <SideIllustration side={side} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                {isPdf ? "PDF" : "Imagen"}
              </p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onFileSelect(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <X className="h-3 w-3" />
                Cambiar archivo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 sm:gap-5">
            <SideIllustration side={side} />

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 sm:h-12 sm:w-12">
              <Upload className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold uppercase tracking-wide text-primary sm:text-base">
                Subir documento
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Tamaño máximo {IDENTITY_UPLOAD_MAX_MB} MB
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Tipo de archivo: PDF, JPG, PNG
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="animate-shake text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}

interface RegisterIdentityUploadStepProps {
  documentType: DocumentType;
  documentNumber: string;
  defaultValues: IdentityUploadFormValues;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (values: IdentityUploadFormValues) => void;
}

export function RegisterIdentityUploadStep({
  documentType,
  documentNumber,
  defaultValues,
  isSubmitting,
  onBack,
  onSubmit,
}: RegisterIdentityUploadStepProps) {
  const [frontFile, setFrontFile] = useState<File | null>(
    defaultValues.frontFile,
  );
  const [backFile, setBackFile] = useState<File | null>(defaultValues.backFile);
  const [errors, setErrors] = useState<{
    frontFile?: string;
    backFile?: string;
  }>({});

  const needsBothSides = requiresDocumentBothSides(documentType);
  const showForeignerNotice = isForeignDocumentType(documentType);
  const requirements = buildUploadRequirements(needsBothSides);

  const {
    frontState,
    backState,
    validateFront,
    validateBack,
    isAnalyzing,
  } = useDocumentValidation({ documentType, documentNumber });

  useEffect(() => {
    void validateFront(frontFile);
  }, [frontFile, validateFront]);

  useEffect(() => {
    if (needsBothSides) {
      void validateBack(backFile);
    }
  }, [backFile, needsBothSides, validateBack]);

  const frontValidated =
    Boolean(frontFile) &&
    frontState.status === "complete" &&
    frontState.isValid;
  const backValidated =
    !needsBothSides ||
    (Boolean(backFile) && backState.status === "complete" && backState.isValid);
  const canContinue =
    frontValidated && backValidated && !isAnalyzing && !isSubmitting;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validationErrors = validateIdentityUpload(documentType, {
      frontFile,
      backFile,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    onSubmit({ frontFile, backFile });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="animate-stagger-up stagger-1 rounded-xl border border-border/80 bg-muted/20 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Verificación de identidad
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">
          Adjunte una imagen o PDF de su documento de identidad. Esta
          información será utilizada para validar sus datos y garantizar la
          seguridad del proceso de registro.
        </p>
      </div>

      {showForeignerNotice && (
        <div
          role="alert"
          className="animate-stagger-up stagger-2 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3.5"
        >
          <p className="text-sm font-semibold text-foreground">
            Importante para extranjeros
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Debe registrarse con el mismo documento de identidad con el que está
            contratado en su empresa. Si no coinciden,{" "}
            <span className="font-medium text-foreground">
              se perderá todo el proceso
            </span>{" "}
            y deberá iniciar el registro nuevamente.
          </p>
        </div>
      )}

      <div className="animate-stagger-up stagger-3 rounded-xl border border-border/80 bg-background/60 px-4 py-4">
        <p className="mb-3 text-sm font-semibold text-foreground">
          Requisitos del documento
        </p>
        <ul className="space-y-2.5">
          {requirements.map((requirement) => (
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

      <div className="animate-stagger-up stagger-4 space-y-5">
        <div className="space-y-2">
          <DocumentUploadZone
            side={needsBothSides ? "front" : "single"}
            file={frontFile}
            error={errors.frontFile}
            disabled={isSubmitting}
            onFileSelect={(file) => {
              setFrontFile(file);
              if (errors.frontFile) {
                setErrors((prev) => ({ ...prev, frontFile: undefined }));
              }
            }}
          />
          <DocumentValidationChecks state={frontState} />
        </div>

        {needsBothSides && (
          <div className="space-y-2">
            <DocumentUploadZone
              side="back"
              file={backFile}
              error={errors.backFile}
              disabled={isSubmitting}
              onFileSelect={(file) => {
                setBackFile(file);
                if (errors.backFile) {
                  setErrors((prev) => ({ ...prev, backFile: undefined }));
                }
              }}
            />
            <DocumentValidationChecks state={backState} />
          </div>
        )}
      </div>

      <div className="animate-stagger-up stagger-5 flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting}
          className="h-11 flex-1 rounded-xl"
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
