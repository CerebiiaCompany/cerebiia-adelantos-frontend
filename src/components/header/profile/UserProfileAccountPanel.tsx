import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Eye,
  EyeOff,
  IdCard,
  Landmark,
  Mail,
  Phone,
  User,
  Wallet,
} from "lucide-react";
import { useProfileView } from "@/features/auth";
import { cn } from "@/lib/utils";

interface UserProfileAccountPanelProps {
  onBack: () => void;
}

function maskDocumentNumber(value?: string): string {
  if (!value || value === "—") return "—";
  const trimmed = value.trim();
  if (trimmed.length <= 4) return "••••";
  return `••••••${trimmed.slice(-4)}`;
}

function maskSalary(value?: string): string {
  if (!value || value === "—") return "—";
  return "$ ••••••••";
}

function maskAccountNumber(value?: string): string {
  if (!value || value === "—") return "—";
  const trimmed = value.trim();
  if (trimmed.length <= 4) return "••••";
  return `••••••••${trimmed.slice(-4)}`;
}

function maskEmployeeId(value?: string): string {
  if (!value || value === "—") return "—";
  return "••••••••••••••••";
}

function maskEmail(value?: string): string {
  if (!value || value === "—") return "—";
  const atIndex = value.indexOf("@");
  if (atIndex <= 1) return "••••@••••";
  const name = value.slice(0, atIndex);
  const domain = value.slice(atIndex);
  return `${name[0]}••••${name.slice(-1)}${domain}`;
}

function maskPhone(value?: string): string {
  if (!value || value === "—") return "—";
  const trimmed = value.trim();
  if (trimmed.length <= 4) return "••••";
  return `••••••${trimmed.slice(-4)}`;
}

type SensitiveFieldKey =
  | "document"
  | "salary"
  | "accountNumber"
  | "employeeNumber"
  | "email"
  | "phone";

export function UserProfileAccountPanel({ onBack }: UserProfileAccountPanelProps) {
  const profile = useProfileView();
  const [revealedFields, setRevealedFields] = useState<
    Partial<Record<SensitiveFieldKey, boolean>>
  >({});

  const isEmployee = profile?.actorType === "empleado";

  const relevantKeys = useMemo<SensitiveFieldKey[]>(() => {
    if (isEmployee) {
      return ["document", "salary", "accountNumber", "employeeNumber"];
    }
    return ["email", "phone"];
  }, [isEmployee]);

  const allRevealed = useMemo(() => {
    return (
      relevantKeys.length > 0 &&
      relevantKeys.every((key) => Boolean(revealedFields[key]))
    );
  }, [relevantKeys, revealedFields]);

  if (!profile) return null;

  const toggleField = (key: SensitiveFieldKey) => {
    setRevealedFields((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleAll = () => {
    const nextState = !allRevealed;
    const nextMap: Partial<Record<SensitiveFieldKey, boolean>> = {};
    relevantKeys.forEach((key) => {
      nextMap[key] = nextState;
    });
    setRevealedFields(nextMap);
  };

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="border-b border-slate-100 bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.04] px-4 py-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-3 flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Volver al perfil
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Ver mi cuenta
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              Información personal y laboral asociada a tu perfil.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleAll}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            title={
              allRevealed
                ? "Ocultar todos los datos sensibles"
                : "Mostrar todos los datos sensibles"
            }
            aria-label={
              allRevealed
                ? "Ocultar todos los datos sensibles"
                : "Mostrar todos los datos sensibles"
            }
          >
            {allRevealed ? (
              <>
                <EyeOff className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <span>Ocultar</span>
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span>Revelar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        <ProfileRow icon={User} label="Nombre completo" value={profile.fullName} />

        {isEmployee ? (
          <>
            <ProfileRow
              icon={IdCard}
              label="Documento"
              value={profile.documentNumber ?? "—"}
              maskedValue={maskDocumentNumber(profile.documentNumber)}
              sensitive
              isRevealed={Boolean(revealedFields.document)}
              onToggleReveal={() => toggleField("document")}
              mono
            />
            <ProfileRow
              icon={Wallet}
              label="Salario"
              value={profile.salary ?? "—"}
              maskedValue={maskSalary(profile.salary)}
              sensitive
              isRevealed={Boolean(revealedFields.salary)}
              onToggleReveal={() => toggleField("salary")}
            />
            <ProfileRow icon={Landmark} label="Banco" value={profile.bank ?? "—"} />
            <ProfileRow
              icon={CreditCard}
              label="Número de cuenta"
              value={profile.accountNumber ?? "—"}
              maskedValue={maskAccountNumber(profile.accountNumber)}
              sensitive
              isRevealed={Boolean(revealedFields.accountNumber)}
              onToggleReveal={() => toggleField("accountNumber")}
              mono
            />
            <ProfileRow icon={Building2} label="Estado" value={profile.status ?? "—"} />
            <ProfileRow
              icon={Building2}
              label="Empresa vinculada"
              value={profile.company ?? "—"}
            />
            <ProfileRow
              icon={User}
              label="ID de empleado"
              value={profile.employeeNumber ?? "—"}
              maskedValue={maskEmployeeId(profile.employeeNumber)}
              sensitive
              isRevealed={Boolean(revealedFields.employeeNumber)}
              onToggleReveal={() => toggleField("employeeNumber")}
              mono
            />
            <ProfileRow
              icon={User}
              label="Miembro desde"
              value={profile.memberSince ?? "—"}
            />
          </>
        ) : (
          <>
            <ProfileRow
              icon={Mail}
              label="Correo"
              value={profile.email ?? "—"}
              maskedValue={maskEmail(profile.email)}
              sensitive
              isRevealed={Boolean(revealedFields.email)}
              onToggleReveal={() => toggleField("email")}
            />
            <ProfileRow
              icon={Phone}
              label="Teléfono"
              value={profile.phone ?? "—"}
              maskedValue={maskPhone(profile.phone)}
              sensitive
              isRevealed={Boolean(revealedFields.phone)}
              onToggleReveal={() => toggleField("phone")}
            />
            <ProfileRow icon={Building2} label="Empresa" value={profile.company ?? "—"} />
            <ProfileRow
              icon={User}
              label="Miembro desde"
              value={profile.memberSince ?? "—"}
            />
          </>
        )}
      </div>
    </div>
  );
}

interface ProfileRowProps {
  icon: LucideIcon;
  label: string;
  value: string;
  mono?: boolean;
  sensitive?: boolean;
  isRevealed?: boolean;
  maskedValue?: string;
  onToggleReveal?: () => void;
}

function ProfileRow({
  icon: Icon,
  label,
  value,
  mono = false,
  sensitive = false,
  isRevealed = false,
  maskedValue,
  onToggleReveal,
}: ProfileRowProps) {
  const isAvailable = Boolean(value && value !== "—");
  const displayValue =
    sensitive && !isRevealed && isAvailable ? (maskedValue ?? "••••••••") : value;

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 transition-colors hover:bg-slate-50/70">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">{label}</p>
          <p
            className={cn(
              "truncate text-sm font-medium text-slate-800",
              mono && "font-mono text-xs",
              sensitive &&
                !isRevealed &&
                isAvailable &&
                "font-mono text-xs tracking-wider text-slate-600",
            )}
          >
            {displayValue}
          </p>
        </div>
      </div>

      {sensitive && isAvailable && onToggleReveal && (
        <button
          type="button"
          onClick={onToggleReveal}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          title={
            isRevealed
              ? `Ocultar ${label.toLowerCase()}`
              : `Mostrar ${label.toLowerCase()}`
          }
          aria-label={
            isRevealed
              ? `Ocultar ${label.toLowerCase()}`
              : `Mostrar ${label.toLowerCase()}`
          }
        >
          {isRevealed ? (
            <EyeOff className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          ) : (
            <Eye className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
