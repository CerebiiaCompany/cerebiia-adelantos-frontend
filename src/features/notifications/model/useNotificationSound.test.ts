import { renderHook } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import type { AppNotification } from "./types";
import { useNotificationSound } from "./useNotificationSound";

const playSupportNotificationSoundMock = vi.fn();
const playGeneralNotificationSoundMock = vi.fn();
const unlockNotificationSoundMock = vi.fn();
const resetNotificationSoundStateMock = vi.fn();

vi.mock("@/shared/lib/notificationSound", () => ({
  playSupportNotificationSound: () => playSupportNotificationSoundMock(),
  playGeneralNotificationSound: () => playGeneralNotificationSoundMock(),
  unlockNotificationSound: () => unlockNotificationSoundMock(),
  resetNotificationSoundState: () => resetNotificationSoundStateMock(),
}));

function buildNotification(
  id: string,
  kind: AppNotification["kind"],
  read = false,
): AppNotification {
  return {
    id,
    kind,
    icon: vi.fn() as AppNotification["icon"],
    title: "Test",
    description: "Desc",
    time: "ahora",
    read,
  };
}

describe("useNotificationSound", () => {
  beforeEach(() => {
    playSupportNotificationSoundMock.mockReset();
    playGeneralNotificationSoundMock.mockReset();
    unlockNotificationSoundMock.mockReset();
    resetNotificationSoundStateMock.mockReset();
  });

  it("no reproduce sonido en la carga inicial", () => {
    renderHook(() =>
      useNotificationSound([buildNotification("n1", "support_replied")], {
        enabled: true,
        isInitialLoadComplete: true,
      }),
    );

    expect(playSupportNotificationSoundMock).not.toHaveBeenCalled();
    expect(playGeneralNotificationSoundMock).not.toHaveBeenCalled();
  });

  it("usa sonido de soporte para mensajes de soporte", () => {
    const { rerender } = renderHook(
      ({ items }) =>
        useNotificationSound(items, {
          enabled: true,
          isInitialLoadComplete: true,
        }),
      { initialProps: { items: [buildNotification("n1", "advance_paid")] } },
    );

    rerender({
      items: [
        buildNotification("n1", "advance_paid"),
        buildNotification("n2", "support_replied"),
      ],
    });

    expect(playSupportNotificationSoundMock).toHaveBeenCalledTimes(1);
    expect(playGeneralNotificationSoundMock).not.toHaveBeenCalled();
  });

  it("usa sonido tranquilo para el resto de notificaciones", () => {
    const { rerender } = renderHook(
      ({ items }) =>
        useNotificationSound(items, {
          enabled: true,
          isInitialLoadComplete: true,
        }),
      {
        initialProps: {
          items: [buildNotification("n1", "support_replied")],
        },
      },
    );

    rerender({
      items: [
        buildNotification("n1", "support_replied"),
        buildNotification("n2", "advance_approved"),
      ],
    });

    expect(playGeneralNotificationSoundMock).toHaveBeenCalledTimes(1);
    expect(playSupportNotificationSoundMock).not.toHaveBeenCalled();
  });

  it("reproduce sonido de soporte para mensajes de empresa", () => {
    const { rerender } = renderHook(
      ({ items }) =>
        useNotificationSound(items, {
          enabled: true,
          isInitialLoadComplete: true,
        }),
      { initialProps: { items: [] as AppNotification[] } },
    );

    rerender({
      items: [buildNotification("n1", "employer_support_message")],
    });

    expect(playSupportNotificationSoundMock).toHaveBeenCalledTimes(1);
  });

  it("no mezcla sonidos: soporte solo dispara tono de soporte", () => {
    const { rerender } = renderHook(
      ({ items }) =>
        useNotificationSound(items, {
          enabled: true,
          isInitialLoadComplete: true,
        }),
      { initialProps: { items: [] as AppNotification[] } },
    );

    rerender({
      items: [
        buildNotification("n1", "support_replied"),
        buildNotification("n2", "employer_support_message"),
      ],
    });

    expect(playSupportNotificationSoundMock).toHaveBeenCalledTimes(1);
    expect(playGeneralNotificationSoundMock).not.toHaveBeenCalled();
  });

  it("no repite sonido para la misma notificación", () => {
    const { rerender } = renderHook(
      ({ items }) =>
        useNotificationSound(items, {
          enabled: true,
          isInitialLoadComplete: true,
        }),
      { initialProps: { items: [] as AppNotification[] } },
    );

    const item = buildNotification("n1", "advance_paid");

    rerender({ items: [item] });
    rerender({ items: [{ ...item }] });

    expect(playGeneralNotificationSoundMock).toHaveBeenCalledTimes(1);
  });
});
