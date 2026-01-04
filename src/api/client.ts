import type { AxiosError, AxiosRequestConfig } from "axios";
import { api, apiBaseURL, apiHadApiSuffix } from "../services/api";

const AUTH_TOKEN_KEY = "despesas_token";
const isDev = Boolean(import.meta.env?.DEV);

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

export const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const saveToken = (token: string) => localStorage.setItem(AUTH_TOKEN_KEY, token);

export const clearToken = () => localStorage.removeItem(AUTH_TOKEN_KEY);

const redirectToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};

const parseErrorMessage = (error: AxiosError<ApiErrorResponse>) => {
  const responseData = error.response?.data;
  if (responseData && typeof responseData === "object") {
    return responseData.message || responseData.error;
  }

  if (typeof error.response?.data === "string") {
    return error.response.data;
  }

  return error.message || "Nao foi possivel completar a requisicao.";
};

const resolveFullUrl = (config: AxiosRequestConfig) => {
  const base = (config.baseURL ?? apiBaseURL).replace(/\/+$/, "");
  const url = (config.url ?? "").toString().replace(/^\/+/, "");
  return url ? `${base}/${url}` : base;
};

if (isDev) {
  const suffixNote = apiHadApiSuffix ? " (sufixo /api removido)" : "";
  console.info("[api] baseURL ativo:", apiBaseURL + suffixNote);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  if (isDev) {
    const method = (config.method ?? "GET").toUpperCase();
    console.info("[api] request:", method, resolveFullUrl(config));
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const fullUrl = resolveFullUrl(error.config ?? {});

    if (isDev) {
      const payload = error.response?.data ?? error.message;
      console.warn("[api] error:", status ?? "no-status", fullUrl, payload);
    }

    if (status === 401) {
      clearToken();
      redirectToLogin();
      return Promise.reject(new Error("Sessao expirada / nao autenticado."));
    }

    if (status === 404) {
      return Promise.reject(new Error("Endpoint nao encontrado."));
    }

    return Promise.reject(new Error(parseErrorMessage(error)));
  },
);

export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await api.request<T>(config);
  return (response.data ?? null) as T;
};
