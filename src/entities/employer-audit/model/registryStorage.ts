// ⚠️ AGNOSTIC — company advance registry (provisional until employer API)

import { calculateAdvanceTransactionFee } from "@/shared/config/advanceFees";

export const MAX_ADVANCE_INSTALLMENTS = 3;

export type CompanyAdvanceStatus = "procesado" | "en_curso" | "rechazado";

export interface RegisteredCompanyAdvance {
  id: string;
  empresaId: string;
  employeeId: string;
  employeeName: string;
  employeeDocument: string;
  baseSalary: number;
  advancedAmount: number;
  installments: number;
  feeAmount: number;
  netDisbursedAmount: number;
  status: CompanyAdvanceStatus;
  requestedAt: string;
  transferId: string;
  /** URL usable del comprobante de transferencia (GET evidencia). */
  paymentEvidenceUrl: string | null;
  /** Motivo ingresado al rechazar (solo aplica si status = rechazado). */
  rejectionReason: string | null;
}

export interface RegisterCompanyAdvanceInput {
  empresaId: string;
  employeeId: string;
  employeeName: string;
  employeeDocument: string;
  baseSalary: number;
  advancedAmount: number;
  installments: number;
  status?: CompanyAdvanceStatus;
  requestedAt?: string;
}

type RegistryListener = () => void;

const STORAGE_PREFIX = "cerebiia:company-advances:";
const listeners = new Set<RegistryListener>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStorageKey(empresaId: string): string {
  return `${STORAGE_PREFIX}${empresaId}`;
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function clampInstallments(value: number): number {
  const normalized = Math.round(value);
  if (normalized < 1) return 1;
  if (normalized > MAX_ADVANCE_INSTALLMENTS) return MAX_ADVANCE_INSTALLMENTS;
  return normalized;
}

function buildTransferId(requestedAt: string): string {
  const date = new Date(requestedAt);
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  return `TRF-${stamp}-${String(date.getTime()).slice(-5)}`;
}

function isRegisteredCompanyAdvance(value: unknown): value is RegisteredCompanyAdvance {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.empresaId === "string" &&
    typeof record.employeeId === "string" &&
    typeof record.employeeName === "string" &&
    typeof record.employeeDocument === "string" &&
    typeof record.baseSalary === "number" &&
    typeof record.advancedAmount === "number" &&
    typeof record.installments === "number" &&
    typeof record.feeAmount === "number" &&
    typeof record.netDisbursedAmount === "number" &&
    typeof record.status === "string" &&
    typeof record.requestedAt === "string" &&
    typeof record.transferId === "string"
  );
}

function normalizeRegisteredAdvance(
  record: RegisteredCompanyAdvance,
): RegisteredCompanyAdvance {
  return {
    ...record,
    paymentEvidenceUrl: record.paymentEvidenceUrl ?? null,
    rejectionReason: record.rejectionReason ?? null,
  };
}

export function subscribeCompanyAdvances(listener: RegistryListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function loadCompanyAdvances(empresaId: string): RegisteredCompanyAdvance[] {
  if (!isBrowser() || !empresaId) return [];

  const raw = window.localStorage.getItem(getStorageKey(empresaId));
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isRegisteredCompanyAdvance)
      .map(normalizeRegisteredAdvance);
  } catch {
    return [];
  }
}

export function saveCompanyAdvances(
  empresaId: string,
  advances: RegisteredCompanyAdvance[],
): void {
  if (!isBrowser() || !empresaId) return;

  window.localStorage.setItem(
    getStorageKey(empresaId),
    JSON.stringify(advances.slice(0, 200)),
  );
  notifyListeners();
}

export function registerCompanyAdvance(
  input: RegisterCompanyAdvanceInput,
): RegisteredCompanyAdvance {
  const requestedAt = input.requestedAt ?? new Date().toISOString();
  const installments = clampInstallments(input.installments);
  const feeAmount = calculateAdvanceTransactionFee(input.advancedAmount);
  const netDisbursedAmount = input.advancedAmount - feeAmount;

  const record: RegisteredCompanyAdvance = {
    id: `adv-${new Date(requestedAt).getTime()}`,
    empresaId: input.empresaId,
    employeeId: input.employeeId,
    employeeName: input.employeeName,
    employeeDocument: input.employeeDocument,
    baseSalary: input.baseSalary,
    advancedAmount: input.advancedAmount,
    installments,
    feeAmount,
    netDisbursedAmount,
    status: input.status ?? "en_curso",
    requestedAt,
    transferId: buildTransferId(requestedAt),
    paymentEvidenceUrl: null,
    rejectionReason: null,
  };

  const current = loadCompanyAdvances(input.empresaId);
  saveCompanyAdvances(input.empresaId, [record, ...current]);
  return record;
}
