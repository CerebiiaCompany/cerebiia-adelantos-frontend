import { useEffect } from "react";
import { saveRegisterDraft } from "./registerDraftStorage";
import type { RegisterDraftState } from "./useRegisterDraftPersistence.types";

const SAVE_DEBOUNCE_MS = 450;

function shouldPersistDraft(state: RegisterDraftState): boolean {
  return Boolean(state.documentData.documentNumber?.trim());
}

interface UseRegisterDraftPersistenceOptions {
  enabled: boolean;
  state: RegisterDraftState;
}

export function useRegisterDraftPersistence({
  enabled,
  state,
}: UseRegisterDraftPersistenceOptions) {
  useEffect(() => {
    if (!enabled || !shouldPersistDraft(state)) return;

    const timer = window.setTimeout(() => {
      void saveRegisterDraft(state);
    }, SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [enabled, state]);
}
