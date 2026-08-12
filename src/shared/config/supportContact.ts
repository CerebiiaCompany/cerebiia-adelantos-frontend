// ⚠️ AGNOSTIC — WhatsApp support contact (build-time env)

/**
 * Número de la línea de soporte en WhatsApp (E.164 sin "+").
 * Colombia: 57 + 10 dígitos, p. ej. 573001234567
 *
 * Override: VITE_WHATSAPP_SUPPORT_PHONE
 */
const FALLBACK_WHATSAPP_SUPPORT_PHONE = "573202259770";

const FALLBACK_WHATSAPP_SUPPORT_MESSAGE =
  "Hola, necesito ayuda con AdeCerebiia.";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function getWhatsAppSupportPhone(): string {
  const fromEnv = (
    import.meta.env.VITE_WHATSAPP_SUPPORT_PHONE as string | undefined
  )?.trim();
  const phone = digitsOnly(fromEnv || FALLBACK_WHATSAPP_SUPPORT_PHONE);
  return phone;
}

export function getWhatsAppSupportMessage(): string {
  const fromEnv = (
    import.meta.env.VITE_WHATSAPP_SUPPORT_MESSAGE as string | undefined
  )?.trim();
  return fromEnv || FALLBACK_WHATSAPP_SUPPORT_MESSAGE;
}

export function buildWhatsAppSupportUrl(
  phone: string = getWhatsAppSupportPhone(),
  message: string = getWhatsAppSupportMessage(),
): string {
  const digits = digitsOnly(phone);
  if (!digits) return "";

  const base = `https://wa.me/${digits}`;
  const text = message.trim();
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}
