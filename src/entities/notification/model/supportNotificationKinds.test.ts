import { describe, expect, it } from "vitest";
import { isSupportNotificationKind } from "./supportNotificationKinds";

describe("isSupportNotificationKind", () => {
  it("identifica kinds de soporte empleado y empresa", () => {
    expect(isSupportNotificationKind("support_replied")).toBe(true);
    expect(isSupportNotificationKind("employer_support_message")).toBe(true);
  });

  it("rechaza otros kinds", () => {
    expect(isSupportNotificationKind("advance_paid")).toBe(false);
    expect(isSupportNotificationKind("employer_advance_requested")).toBe(false);
  });
});
