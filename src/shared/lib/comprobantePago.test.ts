import { describe, expect, it } from "vitest";
import {
  getComprobanteFileKind,
  resolveComprobantePagoUrl,
} from "./comprobantePago";

describe("comprobantePago", () => {
  it("construye URL relativa para rutas del backend", () => {
    expect(
      resolveComprobantePagoUrl(
        "comprobantes/550e8400-e29b-41d4-a716-446655440000/transferencia.jpg",
      ),
    ).toBe(
      "/media/comprobantes/550e8400-e29b-41d4-a716-446655440000/transferencia.jpg",
    );
  });

  it("respeta URLs absolutas", () => {
    expect(
      resolveComprobantePagoUrl("https://cdn.example.com/evidencia.pdf"),
    ).toBe("https://cdn.example.com/evidencia.pdf");
  });

  it("devuelve null si no hay ruta", () => {
    expect(resolveComprobantePagoUrl(null)).toBeNull();
    expect(resolveComprobantePagoUrl("")).toBeNull();
  });

  it("detecta tipo de archivo", () => {
    expect(getComprobanteFileKind("/media/x/foto.png")).toBe("image");
    expect(getComprobanteFileKind("/media/x/doc.pdf")).toBe("pdf");
    expect(getComprobanteFileKind("/media/x/archivo.zip")).toBe("other");
  });
});
