import { describe, expect, it } from "vitest";
import { prepareSelfieAnalysisCanvas } from "./prepareSelfieAnalysisCanvas";

describe("prepareSelfieAnalysisCanvas", () => {
  it("deja intactas imágenes ya pequeñas", () => {
    const source = {
      width: 720,
      height: 960,
    } as HTMLCanvasElement;

    expect(prepareSelfieAnalysisCanvas(source)).toBe(source);
  });
});
