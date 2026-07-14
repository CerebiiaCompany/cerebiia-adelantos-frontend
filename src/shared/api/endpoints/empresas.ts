// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports

import { http } from "../client";
import type {
  EmpresaEstadoDTO,
  EmpresaListItemDTO,
  EmpresasListParams,
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
};
