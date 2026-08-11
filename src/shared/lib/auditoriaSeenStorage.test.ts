import { describe, expect, it, beforeEach } from "vitest";
import {
  countUnreadAuditoriaCambios,
  getSeenAuditoriaCambioIds,
  isAuditoriaCambioAlertable,
  markAuditoriaCambioSeen,
} from "./auditoriaSeenStorage";

describe("auditoriaSeenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("marks employee changes as alertable and empresa changes as not", () => {
    expect(isAuditoriaCambioAlertable({ actor_tipo: "empleado" })).toBe(true);
    expect(isAuditoriaCambioAlertable({ actor_tipo: "sistema" })).toBe(true);
    expect(isAuditoriaCambioAlertable({ actor_tipo: "empresa" })).toBe(false);
  });

  it("counts unread alertable changes until marked seen", () => {
    const rows = [
      { id: "a1", actor_tipo: "empleado" },
      { id: "a2", actor_tipo: "empresa" },
      { id: "a3", actor_tipo: "empleado" },
    ];

    expect(countUnreadAuditoriaCambios(rows)).toBe(2);

    markAuditoriaCambioSeen("a1");
    expect(countUnreadAuditoriaCambios(rows)).toBe(1);
    expect(getSeenAuditoriaCambioIds().has("a1")).toBe(true);
  });
});
