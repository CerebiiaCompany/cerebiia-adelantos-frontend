// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
import { http } from "../client";
import type { AdvanceDTO } from "../types";

export const advancesEndpoints = {
  list: () => http.get<AdvanceDTO[]>("/advances"),
  getById: (id: string) => http.get<AdvanceDTO>(`/advances/${id}`),
  request: (amount: number) => http.post<AdvanceDTO>("/advances", { amount }),
};
