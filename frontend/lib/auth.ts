import { api } from "./api";
import type { LoginPayload, RegisterPayload, UserSummary } from "@/types/auth";

interface SessionResponse {
  user: UserSummary;
}

// O token nunca chega ao browser: as rotas /api/auth/* do proprio Next.js
// fazem a chamada real para a API e guardam o JWT num cookie httpOnly.
export async function login(payload: LoginPayload): Promise<SessionResponse> {
  return api.post<SessionResponse>("/api/auth/login", payload);
}

export async function register(payload: RegisterPayload): Promise<SessionResponse> {
  return api.post<SessionResponse>("/api/auth/register", payload);
}

export async function logout() {
  await api.post("/api/auth/logout");
  window.location.href = "/login";
}
