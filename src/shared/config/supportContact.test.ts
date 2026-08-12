import { describe, expect, it, vi, afterEach } from "vitest";
import {
  buildWhatsAppSupportUrl,
  getWhatsAppSupportPhone,
} from "./supportContact";

describe("supportContact", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds wa.me url with encoded message", () => {
    const url = buildWhatsAppSupportUrl("573202259770", "Hola soporte");
    expect(url).toBe(
      "https://wa.me/573202259770?text=" + encodeURIComponent("Hola soporte"),
    );
  });

  it("strips non-digits from phone", () => {
    const url = buildWhatsAppSupportUrl("+57 320 225 9770", "");
    expect(url).toBe("https://wa.me/573202259770");
  });

  it("reads phone from VITE_WHATSAPP_SUPPORT_PHONE", () => {
    vi.stubEnv("VITE_WHATSAPP_SUPPORT_PHONE", "+57 311 999 8877");
    expect(getWhatsAppSupportPhone()).toBe("573119998877");
  });
});
