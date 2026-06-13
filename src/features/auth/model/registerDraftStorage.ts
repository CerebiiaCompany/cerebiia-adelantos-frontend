import type { UserProfileData } from "@/shared/api/types";
import type {
  BasicInfoFormValues,
  ContactEmailFormValues,
  ContactPhoneFormValues,
  IdentityUploadFormValues,
} from "@/shared/validations/register.schema";
import type {
  RegisterFlowType,
  RegisterStepId,
} from "../ui/RegisterStepIndicator";
import type { DocumentVerificationStatus } from "../ui/steps/RegisterDocumentStep";

const DRAFT_STORAGE_KEY = "cerebiia:register-draft:v1";
const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const DB_NAME = "cerebiia-register-draft";
const DB_VERSION = 1;
const FILES_STORE = "files";

type DraftFileKey = "front" | "back" | "selfie" | "laborCert";

interface StoredFileRecord {
  key: DraftFileKey;
  blob: Blob;
  name: string;
  type: string;
  lastModified: number;
}

export interface RegisterDraftSnapshot {
  version: 1;
  savedAt: number;
  step: RegisterStepId;
  flowType: RegisterFlowType;
  verificationStatus: DocumentVerificationStatus;
  documentData: {
    documentType?: string;
    documentNumber: string;
    acceptMandatorySensitiveTreatment?: boolean;
    acceptAccessoryTreatment?: boolean;
  };
  profile: UserProfileData | null;
  basicInfo: BasicInfoFormValues;
  contactEmail: ContactEmailFormValues;
  contactPhone: ContactPhoneFormValues;
}

export interface RegisterDraftRestoreResult {
  snapshot: RegisterDraftSnapshot;
  identityUpload: IdentityUploadFormValues;
  selfieFile: File | null;
  laborCertFile: File | null;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(FILES_STORE)) {
        database.createObjectStore(FILES_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("No se pudo abrir el almacenamiento"));
  });
}

async function saveFileRecord(record: StoredFileRecord): Promise<void> {
  const database = await openDraftDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(FILES_STORE, "readwrite");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("No se pudo guardar el archivo"));

    transaction.objectStore(FILES_STORE).put(record);
  });

  database.close();
}

async function loadFileRecord(key: DraftFileKey): Promise<StoredFileRecord | null> {
  const database = await openDraftDatabase();

  const record = await new Promise<StoredFileRecord | null>((resolve, reject) => {
    const transaction = database.transaction(FILES_STORE, "readonly");
    const request = transaction.objectStore(FILES_STORE).get(key);

    request.onsuccess = () => resolve((request.result as StoredFileRecord) ?? null);
    request.onerror = () =>
      reject(request.error ?? new Error("No se pudo leer el archivo"));
  });

  database.close();
  return record;
}

async function deleteAllFileRecords(): Promise<void> {
  const database = await openDraftDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(FILES_STORE, "readwrite");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("No se pudieron eliminar archivos"));

    transaction.objectStore(FILES_STORE).clear();
  });

  database.close();
}

function recordToFile(record: StoredFileRecord): File {
  return new File([record.blob], record.name, {
    type: record.type,
    lastModified: record.lastModified,
  });
}

async function removeFileRecord(key: DraftFileKey): Promise<void> {
  const database = await openDraftDatabase();

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(FILES_STORE, "readwrite");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("No se pudo eliminar el archivo"));

    transaction.objectStore(FILES_STORE).delete(key);
  });

  database.close();
}

async function syncDraftFile(
  key: DraftFileKey,
  file: File | null | undefined,
): Promise<void> {
  if (file) {
    await saveFileRecord({
      key,
      blob: file,
      name: file.name,
      type: file.type,
      lastModified: file.lastModified,
    });
    return;
  }

  await removeFileRecord(key);
}

async function loadDraftFile(key: DraftFileKey): Promise<File | null> {
  const record = await loadFileRecord(key);
  return record ? recordToFile(record) : null;
}

function normalizeRestoredStep(
  step: RegisterStepId,
  identityUpload: IdentityUploadFormValues,
  selfieFile: File | null,
  laborCertFile: File | null,
  profile: UserProfileData | null,
  documentNumber: string,
): RegisterStepId {
  if (!documentNumber) return "document";
  if (step === "basic-info" || step === "contact-email") return step;
  if (!profile && step !== "document") return "document";

  if (step === "password" && !laborCertFile) {
    if (selfieFile) return "labor-certification";
    return identityUpload.frontFile ? "selfie-validation" : "identity-upload";
  }

  if (step === "labor-certification" && !selfieFile) {
    return identityUpload.frontFile ? "selfie-validation" : "identity-upload";
  }

  if (step === "password" && !selfieFile) {
    return identityUpload.frontFile ? "selfie-validation" : "identity-upload";
  }

  if (step === "selfie-validation" && !identityUpload.frontFile) {
    return "identity-upload";
  }

  if (
    (step === "review" ||
      step === "selfie-validation" ||
      step === "labor-certification" ||
      step === "password") &&
    !identityUpload.frontFile
  ) {
    return "identity-upload";
  }

  return step;
}

export async function loadRegisterDraft(): Promise<RegisterDraftRestoreResult | null> {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const snapshot = JSON.parse(raw) as RegisterDraftSnapshot;

    if (snapshot.version !== 1) {
      await clearRegisterDraft();
      return null;
    }

    if (Date.now() - snapshot.savedAt > DRAFT_MAX_AGE_MS) {
      await clearRegisterDraft();
      return null;
    }

    const [frontFile, backFile, selfieFile, laborCertFile] = await Promise.all([
      loadDraftFile("front"),
      loadDraftFile("back"),
      loadDraftFile("selfie"),
      loadDraftFile("laborCert"),
    ]);

    const identityUpload: IdentityUploadFormValues = {
      frontFile,
      backFile,
    };

    const step = normalizeRestoredStep(
      snapshot.step,
      identityUpload,
      selfieFile,
      laborCertFile,
      snapshot.profile,
      snapshot.documentData.documentNumber ?? "",
    );

    return {
      snapshot: { ...snapshot, step },
      identityUpload,
      selfieFile,
      laborCertFile,
    };
  } catch {
    await clearRegisterDraft();
    return null;
  }
}

export async function saveRegisterDraft(input: {
  step: RegisterStepId;
  flowType: RegisterFlowType;
  verificationStatus: DocumentVerificationStatus;
  documentData: RegisterDraftSnapshot["documentData"];
  profile: UserProfileData | null;
  basicInfo: BasicInfoFormValues;
  contactEmail: ContactEmailFormValues;
  contactPhone: ContactPhoneFormValues;
  identityUpload: IdentityUploadFormValues;
  selfieFile: File | null;
  laborCertFile: File | null;
}): Promise<void> {
  if (!isBrowser()) return;

  const snapshot: RegisterDraftSnapshot = {
    version: 1,
    savedAt: Date.now(),
    step: input.step,
    flowType: input.flowType,
    verificationStatus: input.verificationStatus,
    documentData: input.documentData,
    profile: input.profile,
    basicInfo: input.basicInfo,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
  };

  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(snapshot));

  await Promise.all([
    syncDraftFile("front", input.identityUpload.frontFile),
    syncDraftFile("back", input.identityUpload.backFile),
    syncDraftFile("selfie", input.selfieFile),
    syncDraftFile("laborCert", input.laborCertFile),
  ]);
}

export async function clearRegisterDraft(): Promise<void> {
  if (!isBrowser()) return;

  window.localStorage.removeItem(DRAFT_STORAGE_KEY);

  try {
    await deleteAllFileRecords();
  } catch {
    // Ignorar errores al limpiar borradores locales.
  }
}
