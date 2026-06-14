// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
import { http } from "../client";
import type { CompanyOption } from "../types";

export const companiesEndpoints = {
  list: () => http.get<CompanyOption[]>("/companies"),
};
