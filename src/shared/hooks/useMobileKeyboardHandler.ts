import { useEffect } from "react";

/**
 * Hook global que detecta la apertura del teclado virtual en dispositivos móviles
 * y desplaza automáticamente el formulario/input enfocado hacia el centro de la pantalla
 * para evitar que el teclado tape los campos de texto, botones o modales.
 */
export function useMobileKeyboardHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: number | undefined;

    const scrollFocusedElementIntoView = (element?: Element | null) => {
      const activeEl = element ?? document.activeElement;
      if (!activeEl) return;

      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        activeEl.hasAttribute("contenteditable");

      if (!isInput) return;

      // Intentar centrar suavemente el elemento en la parte visible de la pantalla
      try {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      } catch {
        activeEl.scrollIntoView(false);
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      const isInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target.hasAttribute("contenteditable");

      if (!isInput) return;

      // Esperar a que la animación de despliegue del teclado virtual concluya
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        scrollFocusedElementIntoView(target);
      }, 250);
    };

    // Soporte para visualViewport (Chrome Android, iOS Safari moderno)
    const handleVisualViewportResize = () => {
      if (!window.visualViewport) return;
      const isKeyboardOpen = window.visualViewport.height < window.innerHeight * 0.85;

      if (isKeyboardOpen && document.activeElement) {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          scrollFocusedElementIntoView();
        }, 150);
      }
    };

    document.addEventListener("focusin", handleFocusIn, { passive: true });
    window.visualViewport?.addEventListener("resize", handleVisualViewportResize, { passive: true });

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("focusin", handleFocusIn);
      window.visualViewport?.removeEventListener("resize", handleVisualViewportResize);
    };
  }, []);
}
