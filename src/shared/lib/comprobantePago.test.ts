import { describe, expect, it } from "vitest";
import {
  getComprobanteFileKind,
  publicizeStorageUrl,
  resolveComprobantePagoUrl,
  resolveSolicitudComprobanteUrl,
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

  it("reescribe host interno minio a localhost", () => {
    expect(
      publicizeStorageUrl(
        "http://minio:9000/adelantos-media/comprobantes/x/carta-falsa-1.jpe",
      ),
    ).toBe(
      "http://localhost:9000/adelantos-media/comprobantes/x/carta-falsa-1.jpe",
    );
    expect(
      resolveComprobantePagoUrl(
        "http://minio:9000/adelantos-media/comprobantes/x/carta-falsa-1.jpe",
      ),
    ).toBe(
      "http://localhost:9000/adelantos-media/comprobantes/x/carta-falsa-1.jpe",
    );
  });

  it("normaliza path /media ya resuelto por el backend", () => {
    expect(
      resolveComprobantePagoUrl("/media/comprobantes/x/transferencia.pdf"),
    ).toBe("/media/comprobantes/x/transferencia.pdf");
  });

  it("devuelve null si no hay ruta", () => {
    expect(resolveComprobantePagoUrl(null)).toBeNull();
    expect(resolveComprobantePagoUrl("")).toBeNull();
  });

  it("prioriza comprobante_pago_url en resolveSolicitudComprobanteUrl", () => {
    expect(
      resolveSolicitudComprobanteUrl({
        comprobante_pago_url: "/media/comprobantes/a.pdf",
        comprobante_pago: "comprobantes/legacy.jpg",
      }),
    ).toBe("/media/comprobantes/a.pdf");
  });

  it("detecta tipo de archivo incluyendo .jpe", () => {
    expect(getComprobanteFileKind("/media/x/foto.png")).toBe("image");
    expect(getComprobanteFileKind("/media/x/foto.jpe")).toBe("image");
    expect(getComprobanteFileKind("/media/x/doc.pdf")).toBe("pdf");
    expect(getComprobanteFileKind("/media/x/archivo.zip")).toBe("other");
  });
});
