// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports

import { http } from "../client";
import type {
  EmpresaEstadoDTO,
  EmpresaListItemDTO,
  EmpresasListParams,
  ExcelBrandingDTO,
  UpdateExcelBrandingRequest,
} from "../types/empresa";

function buildEmpresasListarPath(params?: EmpresasListParams): string {
  const search = new URLSearchParams();
  if (params?.mes != null) search.set("mes", String(params.mes));
  if (params?.anio != null) search.set("anio", String(params.anio));
  const qs = search.toString();
  return qs ? `/empresas/listar/?${qs}` : "/empresas/listar/";
}

export const empresasEndpoints = {
  listar: (params?: EmpresasListParams) =>
    http.get<EmpresaListItemDTO[]>(buildEmpresasListarPath(params)),
  /** Suspende empresa: POST /empresas/{id}/suspender/ → activa=false */
  suspender: (empresaId: string) =>
    http.post<EmpresaEstadoDTO>(`/empresas/${empresaId}/suspender/`),
  /** Reactiva empresa: POST /empresas/{id}/reactivar/ → activa=true */
  reactivar: (empresaId: string) =>
    http.post<EmpresaEstadoDTO>(`/empresas/${empresaId}/reactivar/`),

  /** Personalización de Excels de la empresa autenticada (BD). */
  getExcelBranding: () =>
    http.get<ExcelBrandingDTO>("/empresas/me/excel-branding/"),
  updateExcelBranding: (body: UpdateExcelBrandingRequest) =>
    http.put<ExcelBrandingDTO>("/empresas/me/excel-branding/", body),
  uploadExcelLogo: (file: File) => {
    const formData = new FormData();
    formData.append("logo", file);
    return http.postForm<ExcelBrandingDTO>(
      "/empresas/me/excel-branding/logo/",
      formData,
    );
  },
  deleteExcelLogo: () =>
    http.del<ExcelBrandingDTO>("/empresas/me/excel-branding/logo/"),
};
