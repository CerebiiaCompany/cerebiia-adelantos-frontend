// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
import { http } from "../client";
import type { LoginRequest, AuthResponse } from "../types";

export const authEndpoints = {
  login: (data: LoginRequest) => http.post<AuthResponse>("/auth/login", data),
  logout: () => http.post<void>("/auth/logout", {}),
  me: () => http.get<AuthResponse>("/auth/me"),
};
