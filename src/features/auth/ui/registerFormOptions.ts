export const REGISTER_STEP_FORM_OPTIONS = {
  mode: "onChange" as const,
  reValidateMode: "onChange" as const,
};

export function isRegisterContinueDisabled(
  isValid: boolean,
  isSubmitting = false,
  extraBlocked = false,
): boolean {
  return isSubmitting || extraBlocked || !isValid;
}
