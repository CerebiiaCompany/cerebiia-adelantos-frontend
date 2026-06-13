export type SelfieCaptureMode = "live" | "upload";

export function shouldUseLiveCamera(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    ua,
  );
}

export function getSelfieCaptureMode(): SelfieCaptureMode {
  return shouldUseLiveCamera() ? "live" : "upload";
}
