import { apiRequest } from "./client";
import type { UserMe } from "../types";

type RawMe = {
  name?: unknown;
  email?: unknown;
  telegramChatId?: unknown;
  telegramId?: unknown;
} | null;

const normalizeString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const normalizeId = (value: unknown) => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return undefined;
};

export const getMe = async (): Promise<UserMe> => {
  const data = await apiRequest<RawMe>({
    url: "/api/me",
    method: "GET",
  });

  return {
    name: normalizeString(data?.name),
    email: normalizeString(data?.email),
    telegramChatId: normalizeId(data?.telegramChatId),
    telegramId: normalizeId(data?.telegramId),
  };
};
