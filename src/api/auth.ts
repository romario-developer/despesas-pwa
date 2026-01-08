import { apiRequest } from "./client";
import type { AuthResponse } from "../types";

export const login = async (password: string): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>({
    url: "/api/auth/login",
    method: "POST",
    data: { password },
  });
};

export const changePassword = (currentPassword: string, newPassword: string) => {
  return apiRequest<void>({
    url: "/api/me/password",
    method: "POST",
    data: { currentPassword, newPassword },
  });
};
