import { warmupPdfEngine } from "./fileToImageSource";
import { warmupOcrEngine } from "./ocrEngine";

let warmupPromise: Promise<void> | null = null;

export function warmupValidationEngines(): Promise<void> {
  if (!warmupPromise) {
    warmupPromise = Promise.all([warmupPdfEngine(), warmupOcrEngine()]).then(
      () => undefined,
    );
  }

  return warmupPromise;
}
