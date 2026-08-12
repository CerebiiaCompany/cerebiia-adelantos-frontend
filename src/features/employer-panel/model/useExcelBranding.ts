import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { empresasEndpoints } from "@/shared/api/endpoints";
import type { ExcelBrandingDTO } from "@/shared/api/types";
import {
  fetchLogoAsDataUrl,
  normalizeExcelBrandingPreferences,
  resolveExcelBrandingOwnerKey,
  saveExcelBrandingPreferences,
  type ExcelBrandTarget,
  type ExcelBrandingPreferences,
} from "@/shared/lib/excelBranding";

export const EXCEL_BRANDING_QUERY_KEY = ["empresas", "me", "excel-branding"] as const;

export async function mapExcelBrandingDtoToPreferences(
  dto: ExcelBrandingDTO,
): Promise<ExcelBrandingPreferences> {
  const logoDataUrl = await fetchLogoAsDataUrl(dto.logo_url);
  return normalizeExcelBrandingPreferences({
    presetId: dto.preset_id,
    colors: dto.colors,
    applyTo: dto.apply_to as ExcelBrandTarget,
    logoDataUrl,
    logoFileName: dto.logo_file_name || null,
  });
}

export function preferencesToUpdateRequest(prefs: ExcelBrandingPreferences) {
  return {
    preset_id: prefs.presetId,
    colors: prefs.colors,
    apply_to: prefs.applyTo,
  };
}

async function fetchAndCacheExcelBranding(): Promise<ExcelBrandingPreferences> {
  const dto = await empresasEndpoints.getExcelBranding();
  const prefs = await mapExcelBrandingDtoToPreferences(dto);
  const ownerKey = resolveExcelBrandingOwnerKey();
  if (ownerKey) {
    saveExcelBrandingPreferences(prefs, ownerKey);
  }
  return prefs;
}

export function useExcelBranding() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: EXCEL_BRANDING_QUERY_KEY,
    queryFn: fetchAndCacheExcelBranding,
    staleTime: 5 * 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: async (input: {
      prefs: ExcelBrandingPreferences;
      pendingLogoFile: File | null;
      removeLogo: boolean;
    }) => {
      let dto = await empresasEndpoints.updateExcelBranding(
        preferencesToUpdateRequest(input.prefs),
      );

      if (input.removeLogo) {
        dto = await empresasEndpoints.deleteExcelLogo();
      } else if (input.pendingLogoFile) {
        dto = await empresasEndpoints.uploadExcelLogo(input.pendingLogoFile);
      }

      let prefs = await mapExcelBrandingDtoToPreferences(dto);
      // Si acabamos de subir un logo, preferir el data URL local del draft
      // cuando el fetch remoto falle (p. ej. CORS en storage).
      if (
        input.pendingLogoFile &&
        !prefs.logoDataUrl &&
        input.prefs.logoDataUrl?.startsWith("data:image/")
      ) {
        prefs = {
          ...prefs,
          logoDataUrl: input.prefs.logoDataUrl,
          logoFileName: input.prefs.logoFileName,
        };
      }

      const ownerKey = resolveExcelBrandingOwnerKey();
      if (ownerKey) {
        saveExcelBrandingPreferences(prefs, ownerKey);
      }
      return prefs;
    },
    onSuccess: (prefs) => {
      queryClient.setQueryData(EXCEL_BRANDING_QUERY_KEY, prefs);
    },
  });

  return {
    ...query,
    saveBranding: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
}
