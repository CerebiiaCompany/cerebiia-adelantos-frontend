import type { UserProfileData } from "@/shared/api/types";
import type {
  BasicInfoFormValues,
  ContactEmailFormValues,
  ContactPhoneFormValues,
  IdentityUploadFormValues,
  VerifyDocumentFormValues,
} from "@/shared/validations/register.schema";
import type {
  RegisterFlowType,
  RegisterStepId,
} from "../ui/RegisterStepIndicator";
import type { DocumentVerificationStatus } from "../ui/steps/RegisterDocumentStep";

export interface RegisterDraftState {
  step: RegisterStepId;
  flowType: RegisterFlowType;
  verificationStatus: DocumentVerificationStatus;
  documentData: VerifyDocumentFormValues;
  profile: UserProfileData | null;
  basicInfo: BasicInfoFormValues;
  contactEmail: ContactEmailFormValues;
  contactPhone: ContactPhoneFormValues;
  identityUpload: IdentityUploadFormValues;
  selfieFile: File | null;
  laborCertFile: File | null;
}

export { loadRegisterDraft, clearRegisterDraft } from "./registerDraftStorage";

export async function hydrateRegisterDraftState(): Promise<RegisterDraftState | null> {
  const { loadRegisterDraft } = await import("./registerDraftStorage");
  const draft = await loadRegisterDraft();
  if (!draft) return null;

  const { snapshot, identityUpload, selfieFile, laborCertFile } = draft;

  return {
    step: snapshot.step,
    flowType: snapshot.flowType,
    verificationStatus: snapshot.verificationStatus,
    documentData: snapshot.documentData as VerifyDocumentFormValues,
    profile: snapshot.profile,
    basicInfo: snapshot.basicInfo,
    contactEmail: snapshot.contactEmail,
    contactPhone: snapshot.contactPhone,
    identityUpload,
    selfieFile,
    laborCertFile,
  };
}
