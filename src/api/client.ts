import type { AxiosError, AxiosRequestConfig } from "axios";
import { api, apiBaseURL, apiHadApiSuffix, shouldLogApi } from "../services/api";

const AUTH_TOKEN_KEY = "despesas_token";

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
  const url = (config.url ?? "").toString();
  const isAbsolute = /^https?:\/\//i.test(url);
  if (isAbsolute) return url;

  const base = (config.baseURL ?? apiBaseURL).replace(/\/+$/, "");
  const trimmedUrl = url.replace(/^\/+/, "");
  return trimmedUrl ? `${base}/${trimmedUrl}` : base;
};

if (shouldLogApi) {
  const suffixNote = apiHadApiSuffix ? " (sufixo /api removido)" : "";
  // eslint-disable-next-line no-console
  console.info("[api] baseURL ativo:", apiBaseURL + suffixNote);
}

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  if (shouldLogApi) {
    const method = (config.method ?? "GET").toUpperCase();
    // eslint-disable-next-line no-console
    console.info("[api] request:", method, resolveFullUrl(config));
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const fullUrl = resolveFullUrl(error.config ?? {});

    if (shouldLogApi) {
      const payload = error.response?.data ?? error.message;
      // eslint-disable-next-line no-console
      console.warn("[api] error:", status ?? "no-status", fullUrl, payload);
    }

    if (status === 401) {
      clearToken();
      redirectToLogin();
      return Promise.reject(new Error("Sessao expirada ou nao autenticado."));
    }

    if (status === 404) {
      return Promise.reject(
        new Error("Endpoint nao encontrado. Verifique VITE_API_URL e paths /api."),
      );
    }

    return Promise.reject(new Error(parseErrorMessage(error)));
  },
);

export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await api.request<T>(config);
  return (response.data ?? null) as T;
};
