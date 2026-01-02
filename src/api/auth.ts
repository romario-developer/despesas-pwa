import { apiFetch } from "./client";
import type { AuthResponse } from "../types";

export const login = async (password: string): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
};
