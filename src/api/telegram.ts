import { apiRequest } from "./client";

export type TelegramLinkCodeResponse = {
  code: string;
  expiresAt?: string;
};

type TelegramStatusApiResponse = {
  connected?: unknown;
  telegramChatId?: unknown;
};

export type TelegramStatusResponse = {
  connected: boolean;
  telegramChatId?: string;
};

export const createTelegramLinkCode = () => {
  return apiRequest<TelegramLinkCodeResponse>({
    url: "/api/telegram/link-code",
    method: "POST",
  });
};

const normalizeTelegramStatus = (
  data: TelegramStatusApiResponse | null | undefined,
): TelegramStatusResponse => {
  const connected = Boolean(data?.connected);
  const rawChatId = data?.telegramChatId;
  const telegramChatId =
    rawChatId === null || rawChatId === undefined ? undefined : String(rawChatId);
  return { connected, telegramChatId };
};

export const getTelegramStatus = async (): Promise<TelegramStatusResponse> => {
  const data = await apiRequest<TelegramStatusApiResponse | null>({
    url: "/api/telegram/status",
    method: "GET",
  });
  return normalizeTelegramStatus(data);
};
