import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  ImageUp,
  Loader2,
  RefreshCw,
  ScanFace,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SelfieValidationChecks,
  detectFaceCount,
  useSelfieValidation,
} from "@/features/auth/selfie-validation";
import { getSelfieCaptureMode, isMobileDevice } from "@/features/auth/selfie-validation/utils/captureDevice";
import {
  canvasToFile,
  imageFileToCanvas,
  videoFrameToCanvas,
  warmupFaceEngine,
} from "@/features/auth/selfie-validation/utils/faceEngine";

const UPLOAD_ACCEPT = ".jpg,.jpeg,.png,image/jpeg,image/png";

const SELFIE_DOCUMENT_INSTRUCTION =
  "Debes aparecer sosteniendo en mano el mismo documento de identidad que cargaste en el paso anterior, junto a tu rostro y mirando de frente a la cámara.";

const SELFIE_DOCUMENT_UPLOAD_INSTRUCTION =
  "Sube una foto donde aparezcas sosteniendo en mano el mismo documento de identidad que cargaste en el paso anterior, junto a tu rostro y mirando de frente.";

interface RegisterSelfieValidationStepProps {
  defaultSelfieFile: File | null;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (selfieFile: File) => void;
}

type CameraStatus = "loading" | "ready" | "denied" | "error";

export function RegisterSelfieValidationStep({
  defaultSelfieFile,
  isSubmitting,
  onBack,
  onSubmit,
}: RegisterSelfieValidationStepProps) {
  const captureMode = useMemo(() => getSelfieCaptureMode(), []);
  const isMobile = useMemo(() => isMobileDevice(), []);
  const useLiveCamera = captureMode === "live";

  const videoRef = useRef<HTMLVideoElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewFrameRef = useRef<ImageData | null>(null);
  const previewIntervalRef = useRef<number | null>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>(
    useLiveCamera ? "loading" : "ready",
  );
  const [cameraMessage, setCameraMessage] = useState(
    useLiveCamera
      ? "Preparando cámara y modelos de validación..."
      : "Sube una foto clara de tu rostro",
  );
  const [liveHint, setLiveHint] = useState(
    "Sostén tu documento junto a tu rostro dentro del marco",
  );
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [validatedFile, setValidatedFile] = useState<File | null>(
    defaultSelfieFile,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);

  const { state, validateSelfie, resetValidation, isValidating } =
    useSelfieValidation();

  const isRestoredValidatedSelfie = useMemo(() => {
    if (!defaultSelfieFile || !validatedFile) return false;

    return (
      validatedFile.name === defaultSelfieFile.name &&
      validatedFile.size === defaultSelfieFile.size &&
      validatedFile.lastModified === defaultSelfieFile.lastModified
    );
  }, [defaultSelfieFile, validatedFile]);

  useEffect(() => {
    if (!defaultSelfieFile) return;

    setValidatedFile(defaultSelfieFile);

    void (async () => {
      try {
        const canvas = await imageFileToCanvas(defaultSelfieFile);
        await validateSelfie({
          selfieCanvas: canvas,
          previousFrame: null,
          captureMode: useLiveCamera ? "live" : "upload",
        });
      } catch {
        // La selfie ya fue validada al guardar el borrador.
      }
    })();
  }, [defaultSelfieFile, useLiveCamera, validateSelfie]);

  const stopCamera = useCallback(() => {
    if (previewIntervalRef.current) {
      window.clearInterval(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startPreviewDetection = useCallback(() => {
    if (previewIntervalRef.current) {
      window.clearInterval(previewIntervalRef.current);
    }

    previewIntervalRef.current = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || isValidating) return;

      try {
        const snapshot = videoFrameToCanvas(video);
        previewFrameRef.current =
          snapshot
            .getContext("2d")
            ?.getImageData(0, 0, snapshot.width, snapshot.height) ?? null;

        const count = await detectFaceCount(video);
        if (count === 0) {
          setLiveHint("Acércate y asegúrate de que tu rostro sea visible");
        } else if (count > 1) {
          setLiveHint("Debe aparecer solo tu rostro y el documento en la cámara");
        } else {
          setLiveHint("Rostro detectado. Sostén el documento y captura la foto");
        }
      } catch {
        setLiveHint("Sostén tu documento junto a tu rostro dentro del marco");
      }
    }, 900);
  }, [isValidating]);

  const startCamera = useCallback(async () => {
    setCameraStatus("loading");
    setCameraMessage("Solicitando acceso a la cámara...");

    try {
      await warmupFaceEngine();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("No se pudo iniciar la vista previa");

      video.srcObject = stream;
      await video.play();

      setCameraStatus("ready");
      setCameraMessage("Mira de frente a la cámara con buena iluminación");
      startPreviewDetection();
    } catch {
      stopCamera();
      setCameraStatus("denied");
      setCameraMessage(
        "No pudimos acceder a la cámara. Habilita los permisos e intenta de nuevo",
      );
    }
  }, [startPreviewDetection, stopCamera]);

  useEffect(() => {
    if (!useLiveCamera) {
      void warmupFaceEngine();
      return;
    }

    if (defaultSelfieFile) {
      return;
    }

    void startCamera();
    return () => stopCamera();
  }, [useLiveCamera, startCamera, stopCamera, defaultSelfieFile]);

  useEffect(() => {
    if (!validatedFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(validatedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [validatedFile]);

  useEffect(() => {
    if (!selectedUploadFile) {
      setUploadPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(selectedUploadFile);
    setUploadPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedUploadFile]);

  async function handleCapture() {
    const video = videoRef.current;
    if (!video || cameraStatus !== "ready" || isValidating) return;

    const canvas = videoFrameToCanvas(video);
    const result = await validateSelfie({
      selfieCanvas: canvas,
      previousFrame: previewFrameRef.current,
      captureMode: "live",
    });

    if (result?.isValid) {
      const file = await canvasToFile(canvas, "selfie-validacion.jpg");
      setValidatedFile(file);
      stopCamera();
      setCameraStatus("ready");
      setCameraMessage("");
    }
  }

  async function handleUploadValidate() {
    if (!selectedUploadFile || isValidating) return;

    try {
      const canvas = await imageFileToCanvas(selectedUploadFile);
      const result = await validateSelfie({
        selfieCanvas: canvas,
        previousFrame: null,
        captureMode: "upload",
      });

      if (result?.isValid) {
        setValidatedFile(selectedUploadFile);
      }
    } catch {
      resetValidation();
    }
  }

  function handleUploadSelect(file: File | null) {
    setSelectedUploadFile(file);
    resetValidation();
    setValidatedFile(null);

    if (file && useLiveCamera) {
      stopCamera();
      setCameraStatus("ready");
      setCameraMessage("Foto seleccionada. Valida la imagen para continuar.");
    } else if (!file && useLiveCamera && !validatedFile) {
      void startCamera();
    }
  }

  function handleRetry() {
    resetValidation();
    setValidatedFile(null);
    setSelectedUploadFile(null);

    if (useLiveCamera) {
      setLiveHint("Sostén tu documento junto a tu rostro dentro del marco");
      void startCamera();
    }
  }

  function handleContinue() {
    if (validatedFile) {
      onSubmit(validatedFile);
    }
  }

  const canContinue =
    Boolean(validatedFile) &&
    (state.isValid || isRestoredValidatedSelfie) &&
    (!isValidating || isRestoredValidatedSelfie);
  const showRetry =
    state.phase === "complete" && !state.isValid && !isValidating;
  const showValidatedPreview = Boolean(previewUrl);
  const cameraUnavailable =
    cameraStatus === "denied" || cameraStatus === "error";
  const showCameraError =
    useLiveCamera && cameraUnavailable && !showValidatedPreview;
  const showLiveCameraViewer =
    useLiveCamera &&
    !selectedUploadFile &&
    (!cameraUnavailable || showValidatedPreview);
  const showLiveCaptureControls =
    useLiveCamera &&
    !showValidatedPreview &&
    !selectedUploadFile &&
    !cameraUnavailable;
  const showGalleryUpload =
    !showValidatedPreview && (!useLiveCamera || isMobile || cameraUnavailable);
  const showGalleryDivider =
    showLiveCameraViewer || (useLiveCamera && isMobile && !cameraUnavailable);

  return (
    <div className="space-y-4">
      <div className="animate-stagger-up stagger-1 rounded-xl border border-border/80 bg-muted/20 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {useLiveCamera
                ? "Validación facial en tiempo real"
                : "Validación facial con foto"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {useLiveCamera
                ? SELFIE_DOCUMENT_INSTRUCTION
                : SELFIE_DOCUMENT_UPLOAD_INSTRUCTION}
            </p>
            {isMobile && useLiveCamera && (
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Si tu celular es lento o la validación falla, usa la opción{" "}
                <span className="font-medium text-foreground">
                  Elegir foto de la galería
                </span>
                .
              </p>
            )}
          </div>
        </div>
      </div>

      {showLiveCameraViewer && (
        <div className="animate-stagger-up stagger-2 relative overflow-hidden rounded-xl border border-primary/20 bg-background/80">
          <div className="relative aspect-[4/5] max-h-[320px] w-full bg-muted/30">
            {showValidatedPreview ? (
              <img
                src={previewUrl ?? undefined}
                alt="Selfie validada"
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={cn(
                    "h-full w-full object-cover",
                    cameraStatus !== "ready" && "opacity-40",
                  )}
                  style={{ transform: "scaleX(-1)" }}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-[68%] w-[58%] rounded-[999px] border-2 border-primary/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]" />
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent px-4 pb-4 pt-10">
                  <p className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <ScanFace className="h-3.5 w-3.5 text-primary" />
                    {liveHint}
                  </p>
                </div>
              </>
            )}

            {cameraStatus === "loading" && !showValidatedPreview && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 text-xs text-muted-foreground shadow-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  {cameraMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showGalleryDivider && showGalleryUpload && (
        <div className="animate-stagger-up stagger-2 flex items-center gap-3 px-1">
          <div className="h-px flex-1 bg-border/80" />
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            o sube desde galería
          </span>
          <div className="h-px flex-1 bg-border/80" />
        </div>
      )}

      {showGalleryUpload && (
        <div className="animate-stagger-up stagger-2 space-y-3">
          <input
            ref={uploadInputRef}
            type="file"
            accept={UPLOAD_ACCEPT}
            className="hidden"
            disabled={isSubmitting || isValidating}
            onChange={(event) =>
              handleUploadSelect(event.target.files?.[0] ?? null)
            }
          />

          {!selectedUploadFile && isMobile && useLiveCamera && !cameraUnavailable && (
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting || isValidating}
              onClick={() => uploadInputRef.current?.click()}
              className="auth-outline-btn h-11 w-full rounded-xl border-primary/25 text-sm font-semibold"
            >
              <ImageUp className="mr-2 h-4 w-4" />
              Elegir foto de la galería
            </Button>
          )}

          {(selectedUploadFile || !useLiveCamera || cameraUnavailable) && (
            <div
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                uploadInputRef.current?.click();
              }
            }}
            onClick={() => uploadInputRef.current?.click()}
            className={cn(
              "rounded-xl border-2 border-dashed border-primary/25 bg-background/80 p-5 transition-all duration-200",
              "hover:border-primary/45 hover:bg-primary/[0.03]",
              selectedUploadFile && "border-primary/40 bg-primary/[0.04]",
            )}
          >
            {selectedUploadFile && uploadPreviewUrl ? (
              <div className="flex items-center gap-4">
                <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-primary/15 bg-muted/30">
                  <img
                    src={uploadPreviewUrl}
                    alt="Vista previa selfie"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {selectedUploadFile.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {(selectedUploadFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleUploadSelect(null);
                      if (uploadInputRef.current) {
                        uploadInputRef.current.value = "";
                      }
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <X className="h-3 w-3" />
                    Cambiar imagen
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 py-4 text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold uppercase tracking-wide text-primary">
                    Subir foto con documento
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG o PNG · rostro y documento visibles, bien iluminados
                  </p>
                </div>
              </div>
            )}
            </div>
          )}
        </div>
      )}

      {showValidatedPreview && selectedUploadFile && (
        <div className="animate-stagger-up stagger-2 overflow-hidden rounded-xl border border-primary/20 bg-background/80">
          <img
            src={previewUrl ?? undefined}
            alt="Selfie validada"
            className="aspect-[4/5] max-h-[320px] w-full object-cover"
          />
        </div>
      )}

      {showCameraError && (
        <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p>{cameraMessage}</p>
          <p className="mt-2 text-xs text-destructive/90">
            Puedes continuar subiendo una foto desde tu galería.
          </p>
        </div>
      )}

      <SelfieValidationChecks state={state} />

      <div className="animate-stagger-up stagger-3 flex flex-col gap-3 sm:flex-row">
        {showLiveCaptureControls && cameraStatus === "ready" && (
            <Button
              type="button"
              onClick={() => void handleCapture()}
              disabled={isSubmitting || isValidating}
              className="btn-login h-11 flex-1 rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-md"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Capturar y validar
                </>
              )}
            </Button>
          )}

        {showGalleryUpload && selectedUploadFile && (
          <Button
            type="button"
            onClick={() => void handleUploadValidate()}
            disabled={isSubmitting || isValidating}
            className="btn-login h-11 flex-1 rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-md"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ImageUp className="mr-2 h-4 w-4" />
                Validar imagen
              </>
            )}
          </Button>
        )}

        {showRetry && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRetry}
            disabled={isSubmitting}
            className="auth-secondary-btn h-11 flex-1 rounded-xl"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar selfie
          </Button>
        )}
      </div>

      <div className="animate-stagger-up stagger-4 flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isSubmitting || isValidating}
          className="auth-secondary-btn h-11 flex-1 rounded-xl"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue || isSubmitting}
          className={cn(
            "btn-login h-11 flex-1 rounded-xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-md",
            isSubmitting && "animate-pulse-glow",
          )}
        >
          Continuar
          <ArrowRight className="btn-arrow ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
