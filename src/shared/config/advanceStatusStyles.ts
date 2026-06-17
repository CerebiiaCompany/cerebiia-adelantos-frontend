import type {
  AdvanceHistoryStatus,
  AdvanceReceiptStatus,
} from "@/shared/config/advanceHistory.types";

type StatusStyleTokens = {
  label: string;
  badgeClassName: string;
  stampClassName: string;
};

/** Verde / amarillo / rojo en tonos muy claros, unificados en tabla y recibo. */
export const ADVANCE_STATUS_STYLES = {
  en_curso: {
    label: "En curso",
    badgeClassName:
      "rounded-none border-amber-100/90 bg-amber-50/70 px-2.5 py-1 font-medium text-amber-700/70 hover:bg-amber-50/70",
    stampClassName: "border-amber-200/80 text-amber-700/75",
  },
  aprobado: {
    label: "Aprobado",
    badgeClassName:
      "rounded-none border-emerald-100/90 bg-emerald-50/70 px-2.5 py-1 font-medium text-emerald-700/75 hover:bg-emerald-50/70",
    stampClassName: "border-emerald-200/80 text-emerald-700/80",
  },
  transferido: {
    label: "Transferido",
    badgeClassName:
      "rounded-none border-emerald-100/90 bg-emerald-50/70 px-2.5 py-1 font-medium text-emerald-700/75 hover:bg-emerald-50/70",
    stampClassName: "border-emerald-200/80 text-emerald-700/80",
  },
  no_aprobado: {
    label: "No aprobado",
    badgeClassName:
      "rounded-none border-red-100/90 bg-red-50/70 px-2.5 py-1 font-medium text-red-600/70 hover:bg-red-50/70",
    stampClassName: "border-red-200/80 text-red-600/75",
  },
} as const satisfies Record<
  AdvanceHistoryStatus | AdvanceReceiptStatus,
  StatusStyleTokens
>;

export const ADVANCE_HISTORY_STATUS_LABEL: Record<AdvanceHistoryStatus, string> =
  {
    aprobado: ADVANCE_STATUS_STYLES.aprobado.label,
    en_curso: ADVANCE_STATUS_STYLES.en_curso.label,
    no_aprobado: ADVANCE_STATUS_STYLES.no_aprobado.label,
  };

export const ADVANCE_HISTORY_STATUS_BADGE_CLASS: Record<
  AdvanceHistoryStatus,
  string
> = {
  aprobado: ADVANCE_STATUS_STYLES.aprobado.badgeClassName,
  en_curso: ADVANCE_STATUS_STYLES.en_curso.badgeClassName,
  no_aprobado: ADVANCE_STATUS_STYLES.no_aprobado.badgeClassName,
};

export const ADVANCE_RECEIPT_STATUS_CONFIG: Record<
  AdvanceReceiptStatus,
  { label: string; className: string }
> = {
  en_curso: {
    label: ADVANCE_STATUS_STYLES.en_curso.label,
    className: ADVANCE_STATUS_STYLES.en_curso.stampClassName,
  },
  aprobado: {
    label: ADVANCE_STATUS_STYLES.aprobado.label,
    className: ADVANCE_STATUS_STYLES.aprobado.stampClassName,
  },
  transferido: {
    label: ADVANCE_STATUS_STYLES.transferido.label,
    className: ADVANCE_STATUS_STYLES.transferido.stampClassName,
  },
};

export type { AdvanceReceiptStatus } from "@/shared/config/advanceHistory.types";
