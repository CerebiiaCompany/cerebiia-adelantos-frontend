import * as faceapi from "@vladmandic/face-api";
import { FACE_MODEL_URL } from "../constants";
import { isMobileDevice } from "./captureDevice";

export interface FaceAnalysis {
  box: { x: number; y: number; width: number; height: number };
  landmarks: faceapi.FaceLandmarks68;
  score: number;
}

let modelsPromise: Promise<void> | null = null;

function getDetectorInputSize(): number {
  return isMobileDevice() ? 160 : 224;
}

async function loadModels() {
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(FACE_MODEL_URL),
  ]);
}

export async function warmupFaceEngine(): Promise<void> {
  if (!modelsPromise) {
    modelsPromise = loadModels();
  }
  await modelsPromise;
}

type FaceInput =
  | HTMLCanvasElement
  | HTMLImageElement
  | HTMLVideoElement
  | OffscreenCanvas;

function mapFaceDetections(
  detections: Array<{
    detection: { box: FaceAnalysis["box"]; score: number };
    landmarks: FaceAnalysis["landmarks"];
  }>,
): FaceAnalysis[] {
  return detections.map((item) => ({
    box: item.detection.box,
    landmarks: item.landmarks,
    score: item.detection.score,
  }));
}

function getFaceOverlapRatio(
  left: FaceAnalysis["box"],
  right: FaceAnalysis["box"],
): number {
  const overlapWidth = Math.max(
    0,
    Math.min(left.x + left.width, right.x + right.width) - Math.max(left.x, right.x),
  );
  const overlapHeight = Math.max(
    0,
    Math.min(left.y + left.height, right.y + right.height) -
      Math.max(left.y, right.y),
  );
  return (overlapWidth * overlapHeight) / (left.width * left.height || 1);
}

function mergeFaceDetections(
  baseFaces: FaceAnalysis[],
  extraFaces: FaceAnalysis[],
): FaceAnalysis[] {
  const merged = [...baseFaces];

  for (const candidate of extraFaces) {
    const overlapsExisting = merged.some(
      (existing) => getFaceOverlapRatio(existing.box, candidate.box) > 0.35,
    );

    if (!overlapsExisting) {
      merged.push(candidate);
    }
  }

  return merged.sort(
    (left, right) =>
      right.box.width * right.box.height - left.box.width * left.box.height,
  );
}

export async function detectFaces(source: FaceInput): Promise<FaceAnalysis[]> {
  await warmupFaceEngine();

  const detections = await faceapi
    .detectAllFaces(
      source,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: getDetectorInputSize(),
        scoreThreshold: isMobileDevice() ? 0.4 : 0.45,
      }),
    )
    .withFaceLandmarks(true);

  return mapFaceDetections(detections);
}

/** Segunda pasada sensible solo si hace falta detectar la foto pequeña en la cédula. */
export async function detectFacesForSelfieValidation(
  source: FaceInput,
): Promise<FaceAnalysis[]> {
  const primaryFaces = await detectFaces(source);

  if (primaryFaces.length >= 2) {
    return primaryFaces;
  }

  const sensitiveDetections = await faceapi
    .detectAllFaces(
      source,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.28,
      }),
    )
    .withFaceLandmarks(true);

  return mergeFaceDetections(primaryFaces, mapFaceDetections(sensitiveDetections));
}

export async function detectFaceCount(source: FaceInput): Promise<number> {
  await warmupFaceEngine();
  const detections = await faceapi.detectAllFaces(
    source,
    new faceapi.TinyFaceDetectorOptions({
      inputSize: 160,
      scoreThreshold: 0.4,
    }),
  );
  return detections.length;
}

export async function fileToFaceInput(file: File): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file);
  try {
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const { fileToImageSource } = await import(
        "@/features/auth/document-validation/utils/fileToImageSource"
      );
      const { source } = await fileToImageSource(file);
      if (source instanceof HTMLCanvasElement) return source;
      const canvas = document.createElement("canvas");
      canvas.width = source.naturalWidth;
      canvas.height = source.naturalHeight;
      canvas.getContext("2d")?.drawImage(source, 0, 0);
      return canvas;
    }

    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d")?.drawImage(image, 0, 0);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    image.src = url;
  });
}

export function videoFrameToCanvas(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo capturar la selfie");
  }
  context.drawImage(video, 0, 0);
  return canvas;
}

export function canvasToFile(canvas: HTMLCanvasElement, fileName: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar la selfie"));
        return;
      }
      resolve(new File([blob], fileName, { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  });
}

export async function imageFileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(file);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No se pudo leer la imagen");
    }

    context.drawImage(image, 0, 0);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}
