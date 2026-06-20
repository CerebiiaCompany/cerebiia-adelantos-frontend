// ⚠️ AGNOSTIC — provisional employee deactivation until backend endpoint is live

import type { EmpleadoDTO } from "@/shared/api/types";

const STORAGE_PREFIX = "cerebiia:empleados-desactivados:";

type DeactivationListener = () => void;

const listeners = new Set<DeactivationListener>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStorageKey(empresaId: string): string {
  return `${STORAGE_PREFIX}${empresaId}`;
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeEmpleadoDeactivations(
  listener: DeactivationListener,
): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadDeactivatedEmpleadoIds(empresaId: string): Set<string> {
  if (!isBrowser() || !empresaId) return new Set();

  const raw = window.localStorage.getItem(getStorageKey(empresaId));
  if (!raw) return new Set();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function saveDeactivatedEmpleadoIds(
  empresaId: string,
  ids: Set<string>,
): void {
  if (!isBrowser() || !empresaId) return;

  window.localStorage.setItem(
    getStorageKey(empresaId),
    JSON.stringify([...ids]),
  );
  notifyListeners();
}

export function deactivateEmpleadoLocally(
  empresaId: string,
  empleadoId: string,
): void {
  const current = loadDeactivatedEmpleadoIds(empresaId);
  current.add(empleadoId);
  saveDeactivatedEmpleadoIds(empresaId, current);
}

export function isEmpleadoLocallyDeactivated(
  empresaId: string,
  empleadoId: string,
): boolean {
  return loadDeactivatedEmpleadoIds(empresaId).has(empleadoId);
}

export function applyLocalEmpleadoDeactivations(
  empleados: EmpleadoDTO[],
): EmpleadoDTO[] {
  if (empleados.length === 0) return empleados;

  const empresaId = empleados[0]?.empresa_id;
  if (!empresaId) return empleados;

  const deactivatedIds = loadDeactivatedEmpleadoIds(empresaId);
  if (deactivatedIds.size === 0) return empleados;

  return empleados.map((empleado) =>
    deactivatedIds.has(empleado.id)
      ? { ...empleado, estado: "inactivo" }
      : empleado,
  );
}
