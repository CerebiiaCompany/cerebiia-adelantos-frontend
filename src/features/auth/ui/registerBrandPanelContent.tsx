import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  Camera,
  ClipboardCheck,
  FileCheck,
  FileText,
  Hash,
  IdCard,
  Image,
  Images,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  Pencil,
  ScanSearch,
  ShieldCheck,
  Smartphone,
  Sun,
  Upload,
  User,
  UserCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import type { RegisterStepId } from "./RegisterStepIndicator";

export type AuthBrandGuideStep = {
  title: string;
  description?: string;
  icon: LucideIcon;
};

export type RegisterBrandPanelContent = {
  title: ReactNode;
  description: ReactNode;
  steps: AuthBrandGuideStep[];
  mobileTitle: string;
  mobileSummary: string;
  compactSteps: AuthBrandGuideStep[];
};

function compactSteps(
  ...items: ReadonlyArray<{ title: string; icon: LucideIcon }>
): AuthBrandGuideStep[] {
  return items.map(({ title, icon }) => ({ title, icon }));
}

const PRE_REGISTRATION_VERIFICATION_STEPS: AuthBrandGuideStep[] = [
  {
    title: "Selecciona tu tipo de documento",
    description: "Elige CC, CE, pasaporte o PPT según tu identificación oficial.",
    icon: IdCard,
  },
  {
    title: "Ingresa tu número de documento",
    description: "Debe coincidir con el registrado por tu empresa en nómina.",
    icon: Hash,
  },
  {
    title: "Autoriza el tratamiento de datos",
    description: "Marca las casillas de términos y política de privacidad.",
    icon: ShieldCheck,
  },
  {
    title: 'Pulsa "Verificar"',
    description:
      "Consultamos si tu empleador te tiene pre-registrado en la plataforma.",
    icon: ScanSearch,
  },
  {
    title: "Continúa con tu registro",
    description:
      "Si estás pre-registrado, activa tu cuenta. Si no, podrás completar el alta.",
    icon: ArrowRight,
  },
];

const REGISTER_BRAND_PANEL_BY_STEP: Record<
  RegisterStepId,
  RegisterBrandPanelContent
> = {
  document: {
    title: (
      <>
        Verifica si estás
        <br />
        pre-registrado.
      </>
    ),
    description: (
      <>
        Tu empresa debe haberte cargado en nómina para que puedas solicitar
        adelantos. Sigue estos pasos para comprobarlo.
      </>
    ),
    steps: PRE_REGISTRATION_VERIFICATION_STEPS,
    mobileTitle: "Verifica tu pre-registro",
    mobileSummary:
      "Comprueba en segundos si tu empresa te registró en la plataforma.",
    compactSteps: compactSteps(
      { title: "Ingresa tu tipo y número de documento", icon: IdCard },
      { title: "Autoriza datos y pulsa Verificar", icon: ShieldCheck },
      { title: "Continúa si apareces pre-registrado", icon: UserCheck },
    ),
  },
  "basic-info": {
    title: (
      <>
        Completa tus
        <br />
        datos personales.
      </>
    ),
    description: (
      <>
        Esta información nos permite vincular tu perfil con la empresa y tu
        ciudad de residencia.
      </>
    ),
    steps: [
      {
        title: "Escribe tus nombres y apellidos",
        description: "Tal como aparecen en tu documento de identidad.",
        icon: User,
      },
      {
        title: "Indica género, ciudad y dirección",
        description: "Datos requeridos para tu expediente laboral.",
        icon: MapPin,
      },
      {
        title: "Selecciona tu empresa",
        description: "Debe ser la organización que te registró en nómina.",
        icon: Building2,
      },
    ],
    mobileTitle: "Datos personales",
    mobileSummary: "Completa tu perfil para vincularte con tu empresa.",
    compactSteps: compactSteps(
      { title: "Nombres, apellidos y ubicación", icon: User },
      { title: "Selecciona la empresa que te registró", icon: Building2 },
    ),
  },
  "contact-email": {
    title: (
      <>
        Confirma tu
        <br />
        correo electrónico.
      </>
    ),
    description: (
      <>
        Usaremos este correo para notificaciones de adelantos y seguridad de tu
        cuenta.
      </>
    ),
    steps: [
      {
        title: "Ingresa un correo válido",
        description: "Preferiblemente el que uses con frecuencia.",
        icon: Mail,
      },
      {
        title: "Acepta la política de datos",
        description: "Revisa y autoriza el tratamiento de tu información.",
        icon: ShieldCheck,
      },
    ],
    mobileTitle: "Correo electrónico",
    mobileSummary: "Lo usaremos para notificaciones y seguridad de tu cuenta.",
    compactSteps: compactSteps(
      { title: "Ingresa un correo válido", icon: Mail },
      { title: "Acepta la política de datos", icon: ShieldCheck },
    ),
  },
  "contact-phone": {
    title: (
      <>
        Valida tu
        <br />
        número celular.
      </>
    ),
    description: (
      <>
        El celular nos ayuda a contactarte y a proteger el acceso a tu cuenta.
      </>
    ),
    steps: [
      {
        title: "Ingresa tu número móvil",
        description: "Incluye el indicativo de Colombia si aplica.",
        icon: Smartphone,
      },
      {
        title: "Acepta las autorizaciones",
        description: "Contrato de billetera y almacenamiento temporal de datos.",
        icon: FileCheck,
      },
    ],
    mobileTitle: "Número celular",
    mobileSummary: "Valida tu contacto y las autorizaciones requeridas.",
    compactSteps: compactSteps(
      { title: "Ingresa tu número móvil", icon: Smartphone },
      { title: "Acepta las autorizaciones", icon: FileCheck },
    ),
  },
  "identity-upload": {
    title: (
      <>
        Sube tu
        <br />
        documento de identidad.
      </>
    ),
    description: (
      <>
        Carga fotos legibles del frente y reverso para validar tu identidad.
      </>
    ),
    steps: [
      {
        title: "Foto del frente del documento",
        description: "Sin reflejos, bordes visibles y texto nítido.",
        icon: Image,
      },
      {
        title: "Foto del reverso del documento",
        description: "Asegúrate de que toda la información sea legible.",
        icon: Images,
      },
    ],
    mobileTitle: "Documento de identidad",
    mobileSummary: "Sube fotos claras del frente y reverso de tu documento.",
    compactSteps: compactSteps(
      { title: "Foto del frente del documento", icon: Image },
      { title: "Foto del reverso del documento", icon: Images },
    ),
  },
  review: {
    title: (
      <>
        Revisa tu
        <br />
        información.
      </>
    ),
    description: (
      <>
        Confirma que los datos ingresados sean correctos antes de continuar con
        la validación.
      </>
    ),
    steps: [
      {
        title: "Verifica cada campo",
        description: "Nombre, contacto, empresa y documentos cargados.",
        icon: ClipboardCheck,
      },
      {
        title: "Corrige si es necesario",
        description: "Puedes volver al paso anterior antes de confirmar.",
        icon: Pencil,
      },
    ],
    mobileTitle: "Revisa tu información",
    mobileSummary: "Confirma que todo esté correcto antes de continuar.",
    compactSteps: compactSteps(
      { title: "Verifica cada campo del formulario", icon: ClipboardCheck },
      { title: "Corrige lo necesario y continúa", icon: Pencil },
    ),
  },
  "selfie-validation": {
    title: (
      <>
        Valida tu
        <br />
        identidad con selfie.
      </>
    ),
    description: (
      <>
        Toma una foto sosteniendo tu documento junto a tu rostro para mayor
        seguridad.
      </>
    ),
    steps: [
      {
        title: "Buena iluminación",
        description: "Evita sombras sobre tu rostro y el documento.",
        icon: Sun,
      },
      {
        title: "Documento visible",
        description: "Sostén el mismo documento que cargaste en el paso anterior.",
        icon: IdCard,
      },
      {
        title: "Captura y confirma",
        description: "Sigue las indicaciones en pantalla hasta aprobar la validación.",
        icon: Camera,
      },
    ],
    mobileTitle: "Validación facial",
    mobileSummary: "Toma una selfie con tu documento para verificar tu identidad.",
    compactSteps: compactSteps(
      { title: "Buena luz y rostro visible", icon: Sun },
      { title: "Sostén el documento cargado", icon: IdCard },
      { title: "Captura y confirma la validación", icon: Camera },
    ),
  },
  "labor-certification": {
    title: (
      <>
        Certificación
        <br />
        laboral.
      </>
    ),
    description: (
      <>
        Adjunta tu certificación laboral vigente emitida por tu empleador.
      </>
    ),
    steps: [
      {
        title: "Prepara el PDF o imagen",
        description: "Debe incluir empresa, cargo y fecha de vinculación.",
        icon: FileText,
      },
      {
        title: "Carga el archivo",
        description: "El sistema validará que coincida con tus datos registrados.",
        icon: Upload,
      },
    ],
    mobileTitle: "Certificación laboral",
    mobileSummary: "Adjunta el documento vigente emitido por tu empleador.",
    compactSteps: compactSteps(
      { title: "Prepara PDF o imagen legible", icon: FileText },
      { title: "Carga el archivo para validación", icon: Upload },
    ),
  },
  password: {
    title: (
      <>
        Crea tu
        <br />
        contraseña.
      </>
    ),
    description: (
      <>
        Define una clave segura para ingresar y solicitar adelantos cuando lo
        necesites.
      </>
    ),
    steps: [
      {
        title: "Usa al menos 8 caracteres",
        description: "Combina letras, números y símbolos si es posible.",
        icon: KeyRound,
      },
      {
        title: "Confirma la contraseña",
        description: "Debe coincidir en ambos campos para finalizar el registro.",
        icon: LockKeyhole,
      },
    ],
    mobileTitle: "Crea tu contraseña",
    mobileSummary: "Define una clave segura para acceder a la plataforma.",
    compactSteps: compactSteps(
      { title: "Mínimo 8 caracteres seguros", icon: KeyRound },
      { title: "Confirma la misma contraseña", icon: LockKeyhole },
    ),
  },
};

export function getRegisterBrandPanelContent(
  step: RegisterStepId,
): RegisterBrandPanelContent {
  return REGISTER_BRAND_PANEL_BY_STEP[step];
}
