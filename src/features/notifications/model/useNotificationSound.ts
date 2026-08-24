import { useEffect, useRef } from "react";
import { isSupportNotificationKind } from "@/entities/notification";
import {
  playGeneralNotificationSound,
  playSupportNotificationSound,
  resetNotificationSoundState,
  unlockNotificationSound,
} from "@/shared/lib/notificationSound";
import type { AppNotification } from "./types";

interface UseNotificationSoundOptions {
  enabled: boolean;
  isInitialLoadComplete: boolean;
}

function partitionNewNotifications(notifications: AppNotification[]) {
  const support: AppNotification[] = [];
  const general: AppNotification[] = [];

  for (const notification of notifications) {
    if (isSupportNotificationKind(notification.kind)) {
      support.push(notification);
    } else {
      general.push(notification);
    }
  }

  return { support, general };
}

export function useNotificationSound(
  notifications: AppNotification[],
  { enabled, isInitialLoadComplete }: UseNotificationSoundOptions,
): void {
  const knownUnreadIdsRef = useRef<Set<string>>(new Set());
  const soundedNotificationIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    unlockNotificationSound();

    const unlock = () => {
      unlockNotificationSound();
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("mousedown", unlock, { passive: true });
    window.addEventListener("click", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("focus", unlock);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("mousedown", unlock);
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("focus", unlock);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      initializedRef.current = false;
      knownUnreadIdsRef.current = new Set();
      soundedNotificationIdsRef.current = new Set();
      resetNotificationSoundState();
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isInitialLoadComplete) {
      return;
    }

    const unreadNotifications = notifications.filter(
      (notification) => !notification.read,
    );

    if (!initializedRef.current) {
      knownUnreadIdsRef.current = new Set(
        unreadNotifications.map((notification) => notification.id),
      );
      unreadNotifications.forEach((notification) =>
        soundedNotificationIdsRef.current.add(notification.id),
      );
      initializedRef.current = true;
      return;
    }

    const newUnreadNotifications = unreadNotifications.filter(
      (notification) => !knownUnreadIdsRef.current.has(notification.id),
    );

    const pendingSound = newUnreadNotifications.filter(
      (notification) => !soundedNotificationIdsRef.current.has(notification.id),
    );

    if (pendingSound.length > 0) {
      const { support, general } = partitionNewNotifications(pendingSound);

      if (support.length > 0) {
        playSupportNotificationSound();
      }

      if (general.length > 0) {
        playGeneralNotificationSound();
      }

      pendingSound.forEach((notification) =>
        soundedNotificationIdsRef.current.add(notification.id),
      );
    }

    newUnreadNotifications.forEach((notification) =>
      knownUnreadIdsRef.current.add(notification.id),
    );

    for (const id of knownUnreadIdsRef.current) {
      if (!unreadNotifications.some((notification) => notification.id === id)) {
        knownUnreadIdsRef.current.delete(id);
      }
    }
  }, [notifications, enabled, isInitialLoadComplete]);
}
