import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/shared/config/routes";
import type {
  UserProfileData,
} from "@/shared/api/types";
import { PAYMENT_DAY_DEFAULT } from "@/shared/constants/colombia";
import { loadColombianCities } from "@/shared/constants/colombian-cities.loader";
import {
  normalizeEmail,
  sanitizeColombianPhone,
  type BasicInfoFormValues,
  type ContactEmailFormValues,
  type ContactPhoneFormValues,
  type IdentityUploadFormValues,
  type PasswordFormValues,
  type ReviewStepFormValues,
  type VerifyDocumentFormValues,
} from "@/shared/validations/register.schema";
import { useCompanies } from "../model/useCompanies";
import {
  clearRegisterDraft,
  hydrateRegisterDraftState,
} from "../model/useRegisterDraftPersistence.types";
import { useRegisterDraftPersistence } from "../model/useRegisterDraftPersistence";
import { useRegisterUser } from "../model/useRegisterUser";
import { useVerifyDocument } from "../model/useVerifyDocument";
import { RegisterCard } from "./RegisterCard";
import {
  RegisterStepIndicator,
  type RegisterFlowType,
  type RegisterStepId,
} from "./RegisterStepIndicator";
import {
  RegisterDocumentStep,
  type DocumentVerificationStatus,
} from "./steps/RegisterDocumentStep";
import { RegisterBasicInfoStep } from "./steps/RegisterBasicInfoStep";
import { RegisterContactEmailStep } from "./steps/RegisterContactEmailStep";
import { RegisterContactPhoneStep } from "./steps/RegisterContactPhoneStep";
import { RegisterIdentityUploadStep } from "./steps/RegisterIdentityUploadStep";
import { RegisterPasswordStep } from "./steps/RegisterPasswordStep";
import { RegisterReviewStep } from "./steps/RegisterReviewStep";
import { RegisterSelfieValidationStep } from "./steps/RegisterSelfieValidationStep";
import { RegisterLaborCertificationStep } from "./steps/RegisterLaborCertificationStep";
import {
  RegisterStepTransition,
  type RegisterStepDirection,
} from "./RegisterStepTransition";

const NEW_USER_STEP_ORDER: RegisterStepId[] = [
  "document",
  "basic-info",
  "contact-email",
  "contact-phone",
  "identity-upload",
  "review",
  "selfie-validation",
  "labor-certification",
  "password",
];

const EXISTING_USER_STEP_ORDER: RegisterStepId[] = [
  "document",
  "contact-email",
  "contact-phone",
  "identity-upload",
  "review",
  "selfie-validation",
  "labor-certification",
  "password",
];

function getStepOrderIndex(
  stepId: RegisterStepId,
  flowType: RegisterFlowType,
): number {
  const order =
    flowType === "existing" ? EXISTING_USER_STEP_ORDER : NEW_USER_STEP_ORDER;
  return order.indexOf(stepId);
}

const EMPTY_BASIC_INFO: BasicInfoFormValues = {
  firstNames: "",
  lastNames: "",
  gender: undefined as unknown as BasicInfoFormValues["gender"],
  cityId: "",
  department: undefined as unknown as BasicInfoFormValues["department"],
  address: "",
  companyId: "",
  paymentDay: PAYMENT_DAY_DEFAULT,
};

const EMPTY_CONTACT_EMAIL: ContactEmailFormValues = {
  email: "",
  acceptDataPolicy: false,
  acceptRecords: false,
};

const EMPTY_CONTACT_PHONE: ContactPhoneFormValues = {
  phone: "",
  acceptWalletContract: false,
  acceptTemporaryStorage: false,
};

const EMPTY_IDENTITY_UPLOAD: IdentityUploadFormValues = {
  frontFile: null,
  backFile: null,
};

const EMPTY_SELFIE_FILE: File | null = null;
const EMPTY_LABOR_CERT_FILE: File | null = null;

const STEP_HEADERS: Record<
  RegisterStepId,
  { title: string; subtitle: string }
> = {
  document: {
    title: "Crea tu cuenta",
    subtitle: "Ingresa tu documento de identidad para verificar",
  },
  "basic-info": {
    title: "Datos personales",
    subtitle: "Completa tu información básica para registrarte",
  },
  "contact-email": {
    title: "Correo electrónico",
    subtitle: "Ingresa tu correo y autoriza el tratamiento de datos",
  },
  "contact-phone": {
    title: "Número celular",
    subtitle: "Confirma tu celular y las autorizaciones requeridas",
  },
  "identity-upload": {
    title: "Documento de identidad",
    subtitle: "Cargue su documento oficial para validación de identidad",
  },
  review: {
    title: "Revisa tus datos",
    subtitle: "Confirma que tu información esté correcta antes de continuar",
  },
  "selfie-validation": {
    title: "Validación facial",
    subtitle:
      "Toma una selfie sosteniendo en mano el documento que cargaste, junto a tu rostro",
  },
  "labor-certification": {
    title: "Certificación laboral",
    subtitle: "Carga y valida tu certificación laboral vigente",
  },
  password: {
    title: "Crea tu contraseña",
    subtitle: "Define una contraseña segura para tu cuenta",
  },
};

function RegisterSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[420px] animate-pulse space-y-6 p-8 sm:p-10">
      <div className="space-y-3">
        <div className="h-7 w-48 rounded-lg bg-secondary" />
        <div className="h-4 w-full max-w-xs rounded-md bg-secondary/70" />
      </div>
      <div className="space-y-4">
        <div className="h-11 rounded-xl bg-secondary/80" />
        <div className="h-11 rounded-xl bg-secondary/80" />
        <div className="h-11 rounded-xl bg-secondary" />
      </div>
    </div>
  );
}

function toProfileFromBasicInfo(
  values: BasicInfoFormValues,
  companies: { id: string; name: string }[],
  cityName: string,
): UserProfileData {
  const company = companies.find((c) => c.id === values.companyId);

  return {
    firstNames: values.firstNames,
    lastNames: values.lastNames,
    gender: values.gender,
    cityId: values.cityId,
    cityName,
    department: values.department,
    address: values.address,
    companyId: values.companyId,
    companyName: company?.name ?? "",
    paymentDay: values.paymentDay,
    email: "",
    phone: "",
  };
}

export function RegisterForm() {
  const [isReady, setIsReady] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [step, setStep] = useState<RegisterStepId>("document");
  const [stepDirection, setStepDirection] =
    useState<RegisterStepDirection>("forward");
  const [flowType, setFlowType] = useState<RegisterFlowType>("new");
  const [verificationStatus, setVerificationStatus] =
    useState<DocumentVerificationStatus>("idle");

  const [documentData, setDocumentData] = useState<VerifyDocumentFormValues>({
    documentType: undefined as unknown as VerifyDocumentFormValues["documentType"],
    documentNumber: "",
    acceptMandatorySensitiveTreatment: false,
    acceptAccessoryTreatment: false,
  });
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [basicInfo, setBasicInfo] =
    useState<BasicInfoFormValues>(EMPTY_BASIC_INFO);
  const [contactEmail, setContactEmail] =
    useState<ContactEmailFormValues>(EMPTY_CONTACT_EMAIL);
  const [contactPhone, setContactPhone] =
    useState<ContactPhoneFormValues>(EMPTY_CONTACT_PHONE);
  const [identityUpload, setIdentityUpload] =
    useState<IdentityUploadFormValues>(EMPTY_IDENTITY_UPLOAD);
  const [selfieFile, setSelfieFile] = useState<File | null>(EMPTY_SELFIE_FILE);
  const [laborCertFile, setLaborCertFile] = useState<File | null>(
    EMPTY_LABOR_CERT_FILE,
  );

  const { mutate: verifyDocument, isPending: isVerifying } =
    useVerifyDocument();
  const { mutate: registerUser, isPending: isRegistering } = useRegisterUser();
  const { data: companies = [], isLoading: isLoadingCompanies } =
    useCompanies();

  const draftState = useMemo(
    () => ({
      step,
      flowType,
      verificationStatus,
      documentData,
      profile,
      basicInfo,
      contactEmail,
      contactPhone,
      identityUpload,
      selfieFile,
      laborCertFile,
    }),
    [
      step,
      flowType,
      verificationStatus,
      documentData,
      profile,
      basicInfo,
      contactEmail,
      contactPhone,
      identityUpload,
      selfieFile,
      laborCertFile,
    ],
  );

  useRegisterDraftPersistence({
    enabled: isReady && !isHydrating,
    state: draftState,
  });

  useEffect(() => {
    let cancelled = false;

    void hydrateRegisterDraftState()
      .then((restored) => {
        if (cancelled || !restored) return;

        setStep(restored.step);
        setFlowType(restored.flowType);
        setVerificationStatus(
          restored.verificationStatus !== "idle" &&
            !restored.documentData.acceptMandatorySensitiveTreatment
            ? "idle"
            : restored.verificationStatus,
        );
        setDocumentData({
          ...restored.documentData,
          acceptMandatorySensitiveTreatment:
            restored.documentData.acceptMandatorySensitiveTreatment ?? false,
          acceptAccessoryTreatment:
            restored.documentData.acceptAccessoryTreatment ?? false,
        });
        setProfile(restored.profile);
        setBasicInfo(restored.basicInfo);
        setContactEmail(restored.contactEmail);
        setContactPhone(restored.contactPhone);
        setIdentityUpload(restored.identityUpload);
        setSelfieFile(restored.selfieFile);
        setLaborCertFile(restored.laborCertFile);
      })
      .finally(() => {
        if (cancelled) return;
        setIsHydrating(false);
        window.setTimeout(() => setIsReady(true), 450);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const goToStep = useCallback(
    (next: RegisterStepId) => {
      const currentIdx = getStepOrderIndex(step, flowType);
      const nextIdx = getStepOrderIndex(next, flowType);

      if (currentIdx !== -1 && nextIdx !== -1) {
        setStepDirection(nextIdx >= currentIdx ? "forward" : "back");
      } else {
        setStepDirection("forward");
      }

      setStep(next);
    },
    [flowType, step],
  );

  function handleVerify(values: VerifyDocumentFormValues) {
    if (!values.acceptMandatorySensitiveTreatment) {
      return;
    }

    setDocumentData(values);

    verifyDocument(
      {
        documentType: values.documentType,
        documentNumber: values.documentNumber,
      },
      {
        onSuccess: (response) => {
          if (response.exists && response.profile) {
            setFlowType("existing");
            setVerificationStatus("verified-existing");
            setProfile({
              ...response.profile,
              email: "",
              phone: "",
            });
            goToStep("contact-email");
            return;
          }

          setFlowType("new");
          setVerificationStatus("verified-new");
        },
      },
    );
  }

  function handleProceedNewUser() {
    goToStep("basic-info");
  }

  async function handleBasicInfoSubmit(values: BasicInfoFormValues) {
    const cities = await loadColombianCities();
    const city = cities.find((item) => item.id === values.cityId);

    setBasicInfo(values);
    setProfile(toProfileFromBasicInfo(values, companies, city?.name ?? ""));
    goToStep("contact-email");
  }

  function handleContactEmailSubmit(values: ContactEmailFormValues) {
    setContactEmail(values);
    setProfile((current) =>
      current
        ? { ...current, email: normalizeEmail(values.email) }
        : current,
    );
    goToStep("contact-phone");
  }

  function handleContactPhoneSubmit(values: ContactPhoneFormValues) {
    setContactPhone(values);
    setProfile((current) =>
      current
        ? { ...current, phone: sanitizeColombianPhone(values.phone) }
        : current,
    );
    goToStep("identity-upload");
  }

  function handleIdentityUploadSubmit(values: IdentityUploadFormValues) {
    setIdentityUpload(values);
    goToStep("review");
  }

  function handleReviewSubmit(values: ReviewStepFormValues) {
    const company = companies.find((item) => item.id === values.companyId);

    setBasicInfo((current) => ({
      ...current,
      firstNames: values.firstNames,
      lastNames: values.lastNames,
      gender: values.gender,
      address: values.address,
      companyId: values.companyId,
    }));

    setContactEmail((current) => ({
      ...current,
      email: values.email,
    }));

    setContactPhone((current) => ({
      ...current,
      phone: values.phone,
    }));

    setProfile((current) =>
      current
        ? {
            ...current,
            firstNames: values.firstNames,
            lastNames: values.lastNames,
            gender: values.gender,
            address: values.address,
            companyId: values.companyId,
            companyName: company?.name ?? current.companyName,
            email: normalizeEmail(values.email),
            phone: sanitizeColombianPhone(values.phone),
          }
        : current,
    );

    goToStep("selfie-validation");
  }

  function handleSelfieValidationSubmit(file: File) {
    setSelfieFile(file);
    goToStep("labor-certification");
  }

  function handleLaborCertificationSubmit(file: File) {
    setLaborCertFile(file);
    goToStep("password");
  }

  function handlePasswordSubmit(values: PasswordFormValues) {
    if (!profile || !identityUpload.frontFile || !selfieFile || !laborCertFile) {
      return;
    }

    registerUser(
      {
        documentType: documentData.documentType,
        documentNumber: documentData.documentNumber,
        password: values.password,
        profile,
        identityFiles: {
          front: identityUpload.frontFile,
          back: identityUpload.backFile ?? undefined,
          selfie: selfieFile,
          laborCert: laborCertFile,
        },
      },
      {
        onSuccess: () => {
          void clearRegisterDraft();
        },
      },
    );
  }

  function getPreviousStep(): RegisterStepId | null {
    switch (step) {
      case "basic-info":
        return "document";
      case "contact-email":
        return flowType === "new" ? "basic-info" : "document";
      case "contact-phone":
        return "contact-email";
      case "identity-upload":
        return "contact-phone";
      case "review":
        return "identity-upload";
      case "selfie-validation":
        return "review";
      case "labor-certification":
        return "selfie-validation";
      case "password":
        return "labor-certification";
      default:
        return null;
    }
  }

  const header = STEP_HEADERS[step];
  const isLoading = isVerifying || isRegistering;
  const previousStep = getPreviousStep();

  if (!isReady || isHydrating) {
    return (
      <div className="glass-card glow-border w-full max-w-[420px] overflow-hidden rounded-xl lg:mx-auto">
        <div className="loading-bar">
          <div className="animate-shimmer h-full w-full" />
        </div>
        <RegisterSkeleton />
      </div>
    );
  }

  return (
    <div className="animate-scale-in w-full max-w-[480px] lg:mx-auto">
      <RegisterCard
        isLoading={isLoading}
        loadingMessage={
          isVerifying
            ? "Consultando base de datos..."
            : "Finalizando registro..."
        }
      >
        {step !== "document" && (
          <RegisterStepTransition
            stepKey={`indicator-${step}`}
            direction={stepDirection}
          >
            <RegisterStepIndicator flowType={flowType} currentStep={step} />
          </RegisterStepTransition>
        )}

        <RegisterStepTransition
          stepKey={`header-${step}`}
          direction={stepDirection}
          className="mb-8 space-y-2 text-left"
        >
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {header.title}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground lg:max-w-none">
            {header.subtitle}
          </p>
        </RegisterStepTransition>

        <RegisterStepTransition
          stepKey={`content-${step}`}
          direction={stepDirection}
          className="register-step-content"
        >
        {step === "document" && (
          <RegisterDocumentStep
            defaultValues={documentData}
            verificationStatus={verificationStatus}
            isVerifying={isVerifying}
            onVerify={handleVerify}
            onProceedNewUser={handleProceedNewUser}
          />
        )}

        {step === "basic-info" && (
          <RegisterBasicInfoStep
            defaultValues={basicInfo}
            companies={companies}
            isLoadingCompanies={isLoadingCompanies}
            isSubmitting={false}
            onBack={() => goToStep("document")}
            onSubmit={handleBasicInfoSubmit}
          />
        )}

        {step === "contact-email" && (
          <RegisterContactEmailStep
            defaultValues={contactEmail}
            isSubmitting={false}
            onBack={() => previousStep && goToStep(previousStep)}
            onSubmit={handleContactEmailSubmit}
          />
        )}

        {step === "contact-phone" && (
          <RegisterContactPhoneStep
            defaultValues={contactPhone}
            isSubmitting={false}
            onBack={() => goToStep("contact-email")}
            onSubmit={handleContactPhoneSubmit}
          />
        )}

        {step === "identity-upload" && documentData.documentType && (
          <RegisterIdentityUploadStep
            documentType={documentData.documentType}
            documentNumber={documentData.documentNumber}
            defaultValues={identityUpload}
            isSubmitting={false}
            onBack={() => goToStep("contact-phone")}
            onSubmit={handleIdentityUploadSubmit}
          />
        )}

        {step === "review" && profile && documentData.documentType && (
          <RegisterReviewStep
            documentType={documentData.documentType}
            documentNumber={documentData.documentNumber}
            profile={profile}
            companies={companies}
            isLoadingCompanies={isLoadingCompanies}
            isSubmitting={false}
            onBack={() => goToStep("identity-upload")}
            onSubmit={handleReviewSubmit}
          />
        )}

        {step === "selfie-validation" && identityUpload.frontFile && (
          <RegisterSelfieValidationStep
            defaultSelfieFile={selfieFile}
            isSubmitting={false}
            onBack={() => goToStep("review")}
            onSubmit={handleSelfieValidationSubmit}
          />
        )}

        {step === "labor-certification" && profile && (
          <RegisterLaborCertificationStep
            profile={profile}
            defaultLaborCertFile={laborCertFile}
            isSubmitting={false}
            onBack={() => goToStep("selfie-validation")}
            onSubmit={handleLaborCertificationSubmit}
          />
        )}

        {step === "password" && profile && (
          <RegisterPasswordStep
            isExistingUser={flowType === "existing"}
            isSubmitting={isRegistering}
            onBack={() => goToStep("labor-certification")}
            onSubmit={handlePasswordSubmit}
          />
        )}
        </RegisterStepTransition>

        {step === "document" && (
          <RegisterStepTransition
            stepKey="document-footer"
            direction={stepDirection}
            className="mt-8 flex flex-col items-center gap-3 text-center"
          >
            <p className="text-sm text-muted-foreground">¿Ya tienes cuenta?</p>
            <Button
              variant="outline"
              asChild
              disabled={isLoading}
              className="h-9 rounded-xl px-6 font-medium transition-all duration-300 hover:border-primary/40 hover:bg-primary/5"
            >
              <Link to={ROUTES.login}>Ingresar</Link>
            </Button>
          </RegisterStepTransition>
        )}
      </RegisterCard>
    </div>
  );
}
