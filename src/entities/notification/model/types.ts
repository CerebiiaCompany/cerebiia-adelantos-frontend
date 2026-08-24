// ⚠️ AGNOSTIC — employee notification records (provisional hasta API)

export type NotificationKind =
  | "advance_requested"
  | "advance_approved"
  | "advance_paid"
  | "advance_rejected"
  | "payment_evidence"
  | "payroll_due_3d"
  | "next_payment_net_updated"
  | "cupo_80"
  | "cupo_low"
  | "cupo_exhausted"
  | "achievement_unlocked"
  | "data_change_audit"
  | "support_replied"
  | "config_fee_updated"
  | "config_advance_percent_updated"
  | "config_min_amount_updated"
  | "config_installments_updated"
  | "config_custom_updated"
  | "employee_activated"
  | "employee_suspended"
  | "employer_advance_requested"
  | "employer_advance_approved"
  | "employer_advance_rejected"
  | "employer_support_message"
  | "provider_week_debt";

export interface StoredNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  createdAt: string;
  /** Ruta interna SPA (sin react-router). */
  href?: string;
}

export function formatNotificationAmount(amount: number): string {
  return `$${amount.toLocaleString("es-CO")}`;
}

export function buildAdvanceRequestedNotification(
  amount: number,
  createdAt: string = new Date().toISOString(),
  options?: { solicitudId?: string; href?: string },
): StoredNotification {
  const formattedAmount = formatNotificationAmount(amount);
  const id = options?.solicitudId
    ? `advance-requested:${options.solicitudId}`
    : `advance-${new Date(createdAt).getTime()}`;

  return {
    id,
    kind: "advance_requested",
    title: "Adelanto solicitado",
    description: `Tu adelanto de ${formattedAmount} fue registrado y está en proceso.`,
    createdAt,
    href: options?.href,
  };
}

export function buildAdvanceApprovedNotification(
  solicitudId: string,
  amount: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  const formattedAmount = formatNotificationAmount(amount);
  return {
    id: `advance-approved:${solicitudId}`,
    kind: "advance_approved",
    title: "Adelanto aprobado",
    description: `Tu adelanto de ${formattedAmount} fue aprobado.`,
    createdAt,
    href,
  };
}

export function buildAdvancePaidNotification(
  solicitudId: string,
  amount: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  const formattedAmount = formatNotificationAmount(amount);
  return {
    id: `advance-paid:${solicitudId}`,
    kind: "advance_paid",
    title: "Adelanto pagado",
    description: `Tu adelanto de ${formattedAmount} fue transferido exitosamente.`,
    createdAt,
    href,
  };
}

export function buildAdvanceRejectedNotification(
  solicitudId: string,
  amount: number,
  createdAt: string,
  href?: string,
  motivo?: string | null,
): StoredNotification {
  const formattedAmount = formatNotificationAmount(amount);
  const motivoText =
    motivo && motivo.trim()
      ? ` Motivo: ${motivo.trim()}`
      : "";
  return {
    id: `advance-rejected:${solicitudId}`,
    kind: "advance_rejected",
    title: "Adelanto rechazado",
    description: `Tu adelanto de ${formattedAmount} fue rechazado.${motivoText}`,
    createdAt,
    href,
  };
}

export function buildPaymentEvidenceNotification(
  solicitudId: string,
  amount: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  const formattedAmount = formatNotificationAmount(amount);
  return {
    id: `payment-evidence:${solicitudId}`,
    kind: "payment_evidence",
    title: "Evidencia de pago",
    description: `Te enviaron la evidencia de transferencia de tu adelanto de ${formattedAmount}.`,
    createdAt,
    href,
  };
}

export function buildPayrollDue3dNotification(
  paymentDateIso: string,
  daysUntil: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  const dateLabel = new Date(paymentDateIso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  });
  const dayLabel =
    daysUntil === 0
      ? "hoy"
      : daysUntil === 1
        ? "mañana"
        : `en ${daysUntil} días`;

  return {
    id: `payroll-due-3d:${paymentDateIso.slice(0, 10)}`,
    kind: "payroll_due_3d",
    title: "Próximo pago de nómina",
    description: `Faltan ${dayLabel} para tu pago del ${dateLabel}.`,
    createdAt,
    href,
  };
}

export function buildNextPaymentNetUpdatedNotification(
  monthKey: string,
  nextPaymentNet: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  const formatted = formatNotificationAmount(nextPaymentNet);
  return {
    id: `next-payment-net:${monthKey}:${Math.round(nextPaymentNet)}`,
    kind: "next_payment_net_updated",
    title: "Próximo pago neto actualizado",
    description: `Tu próximo pago neto estimado es ${formatted}. Revísalo en Control.`,
    createdAt,
    href,
  };
}

export function buildCupo80Notification(
  monthKey: string,
  usedPercent: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  return {
    id: `cupo-80:${monthKey}`,
    kind: "cupo_80",
    title: "Cupo casi agotado",
    description: `Has consumido el ${usedPercent}% de tu cupo de adelantos este mes.`,
    createdAt,
    href,
  };
}

export function buildAchievementUnlockedNotification(
  achievementId: string,
  title: string,
  points: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  return {
    id: `achievement:${achievementId}`,
    kind: "achievement_unlocked",
    title: "Logro desbloqueado",
    description: `¡Felicidades! Obtuviste "${title}" (+${points} pts).`,
    createdAt,
    href,
  };
}

export function buildDataChangeAuditNotification(
  cambioId: string,
  actorTipo: string,
  actorNombre: string,
  createdAt: string,
  href?: string,
): StoredNotification {
  const isEmpresa = actorTipo === "empresa";
  const isPropio = actorTipo === "empleado";
  const title = isEmpresa
    ? "La empresa actualizó tus datos"
    : isPropio
      ? "Actualizaste tus datos"
      : "Cambio en tus datos";
  const description = isEmpresa
    ? `${actorNombre || "Tu empresa"} realizó un cambio en tu información. Revisa la auditoría.`
    : isPropio
      ? "Tu actualización de datos quedó registrada en auditoría."
      : `Se registró un cambio en tus datos (${actorNombre || "sistema"}).`;

  return {
    id: `audit:${cambioId}`,
    kind: "data_change_audit",
    title,
    description,
    createdAt,
    href,
  };
}

export function buildSupportRepliedNotification(
  reporteId: string,
  createdAt: string,
  href?: string,
  respondidoPor?: string | null,
): StoredNotification {
  const who = respondidoPor?.trim()
    ? ` ${respondidoPor.trim()} respondió`
    : " La empresa respondió";
  return {
    id: `support-replied:${reporteId}`,
    kind: "support_replied",
    title: "Respuesta a tu reporte",
    description: `${who} a tu consulta de soporte. Revisa el detalle.`,
    createdAt,
    href,
  };
}

export function buildConfigFeeUpdatedNotification(
  tarifaFijaPorCuota: number,
  previousTarifa: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  const next = formatNotificationAmount(tarifaFijaPorCuota);
  const prev = formatNotificationAmount(previousTarifa);
  return {
    id: `config-fee:${Math.round(tarifaFijaPorCuota)}`,
    kind: "config_fee_updated",
    title: "Comisión por cuota actualizada",
    description: `La comisión fija por cuota pasó de ${prev} a ${next}.`,
    createdAt,
    href,
  };
}

export function buildConfigAdvancePercentUpdatedNotification(
  porcentajeMaximo: number,
  previousPorcentaje: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  return {
    id: `config-percent:${porcentajeMaximo}`,
    kind: "config_advance_percent_updated",
    title: "Porcentaje de adelanto actualizado",
    description: `El porcentaje máximo de adelanto pasó de ${previousPorcentaje}% a ${porcentajeMaximo}%.`,
    createdAt,
    href,
  };
}

export function buildConfigMinAmountUpdatedNotification(
  montoMinimo: number,
  previousMonto: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  return {
    id: `config-min-amount:${Math.round(montoMinimo)}`,
    kind: "config_min_amount_updated",
    title: "Monto mínimo de adelanto actualizado",
    description: `El monto mínimo de adelanto pasó de ${formatNotificationAmount(previousMonto)} a ${formatNotificationAmount(montoMinimo)}.`,
    createdAt,
    href,
  };
}

export function buildConfigInstallmentsUpdatedNotification(
  maxCuotas: number,
  previousCuotas: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  return {
    id: `config-installments:${maxCuotas}`,
    kind: "config_installments_updated",
    title: "Número de cuotas actualizado",
    description: `El número máximo de cuotas para adelantos pasó de ${previousCuotas} a ${maxCuotas}.`,
    createdAt,
    href,
  };
}

export function buildConfigCustomUpdatedNotification(
  title: string,
  description: string,
  createdAt: string,
  href?: string,
): StoredNotification {
  return {
    id: `config-custom:${Date.now()}`,
    kind: "config_custom_updated",
    title,
    description,
    createdAt,
    href,
  };
}

export function buildEmployeeActivatedNotification(
  empleadoId: string,
  empleadoNombre: string,
  createdAt: string,
  href?: string,
): StoredNotification {
  const name = empleadoNombre.trim() || "Un empleado";
  return {
    id: `employee-activated:${empleadoId}:${createdAt.slice(0, 10)}`,
    kind: "employee_activated",
    title: "Cuenta activada",
    description: `${name} acaba de activar su cuenta.`,
    createdAt,
    href,
  };
}

export function buildEmployeeSuspendedNotification(
  empleadoId: string,
  empleadoNombre: string,
  createdAt: string,
  href?: string,
): StoredNotification {
  const name = empleadoNombre.trim() || "Un empleado";
  return {
    id: `employee-suspended:${empleadoId}:${createdAt.slice(0, 16)}`,
    kind: "employee_suspended",
    title: "Empleado suspendido",
    description: `${name} fue suspendido y quedó inactivo.`,
    createdAt,
    href,
  };
}

export function buildEmployerAdvanceRequestedNotification(
  solicitudId: string,
  empleadoNombre: string,
  amount: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  const name = empleadoNombre.trim() || "Un empleado";
  const formatted = formatNotificationAmount(amount);
  return {
    id: `employer-advance-requested:${solicitudId}`,
    kind: "employer_advance_requested",
    title: "Nuevo adelanto solicitado",
    description: `${name} solicitó un adelanto de ${formatted}.`,
    createdAt,
    href,
  };
}

export function buildEmployerAdvanceApprovedNotification(
  solicitudId: string,
  empleadoNombre: string,
  amount: number,
  createdAt: string,
  href?: string,
): StoredNotification {
  const name = empleadoNombre.trim() || "Un empleado";
  const formatted = formatNotificationAmount(amount);
  return {
    id: `employer-advance-approved:${solicitudId}`,
    kind: "employer_advance_approved",
    title: "Adelanto aprobado",
    description: `Se aprobó el adelanto de ${formatted} de ${name}.`,
    createdAt,
    href,
  };
}

export function buildEmployerAdvanceRejectedNotification(
  solicitudId: string,
  empleadoNombre: string,
  amount: number,
  createdAt: string,
  href?: string,
  motivo?: string | null,
): StoredNotification {
  const name = empleadoNombre.trim() || "Un empleado";
  const formatted = formatNotificationAmount(amount);
  const motivoText =
    motivo && motivo.trim() ? ` Motivo: ${motivo.trim()}` : "";
  return {
    id: `employer-advance-rejected:${solicitudId}`,
    kind: "employer_advance_rejected",
    title: "Adelanto rechazado",
    description: `Se rechazó el adelanto de ${formatted} de ${name}.${motivoText}`,
    createdAt,
    href,
  };
}

export function buildEmployerSupportMessageNotification(
  reporteId: string,
  empleadoNombre: string,
  createdAt: string,
  href?: string,
): StoredNotification {
  const name = empleadoNombre.trim() || "Un empleado";
  return {
    id: `employer-support:${reporteId}`,
    kind: "employer_support_message",
    title: "Nuevo mensaje de soporte",
    description: `${name} envió una consulta de soporte.`,
    createdAt,
    href,
  };
}

export function buildProviderWeekDebtNotification(
  weekKey: string,
  amount: number,
  periodLabel: string,
  createdAt: string,
  href?: string,
): StoredNotification {
  const formatted = formatNotificationAmount(amount);
  return {
    id: `provider-week-debt:${weekKey}:${Math.round(amount)}`,
    kind: "provider_week_debt",
    title: "Cierre semanal — pago al proveedor",
    description: `Al culminar la semana debes al proveedor ${formatted} (periodo ${periodLabel}). Revisa retenciones y cierres.`,
    createdAt,
    href,
  };
}

/** Auditoría vista empresa: edición de datos de un empleado. */
export function buildEmployerDataChangeAuditNotification(
  cambioId: string,
  empleadoNombre: string,
  actorTipo: string,
  actorNombre: string,
  createdAt: string,
  href?: string,
): StoredNotification {
  const name = empleadoNombre.trim() || "Un empleado";
  const isEmpresa = actorTipo === "empresa";
  const isEmpleado = actorTipo === "empleado";
  const title = isEmpresa
    ? "Editaste datos de un empleado"
    : isEmpleado
      ? "Empleado actualizó sus datos"
      : "Cambio en datos de empleado";
  const description = isEmpresa
    ? `Se registró una actualización en los datos de ${name}.`
    : isEmpleado
      ? `${name} actualizó su información (${actorNombre || "empleado"}).`
      : `Se registró un cambio en los datos de ${name}.`;

  return {
    id: `audit:${cambioId}`,
    kind: "data_change_audit",
    title,
    description,
    createdAt,
    href,
  };
}
