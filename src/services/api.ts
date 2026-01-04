import axios from "axios";

const rawBaseUrl = (import.meta.env.VITE_API_URL ?? "").trim();

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const cleanedBase = stripTrailingSlash(rawBaseUrl);
const baseHadApiSuffix = cleanedBase.toLowerCase().endsWith("/api");
const baseWithoutApi = baseHadApiSuffix ? cleanedBase.slice(0, -4) : cleanedBase;

export const apiBaseURL = baseWithoutApi || window.location.origin;
export const apiHadApiSuffix = baseHadApiSuffix;

if (import.meta.env?.DEV) {
  const suffixNote = baseHadApiSuffix ? " (removido sufixo /api)" : "";
  console.info("[api] baseURL:", apiBaseURL + suffixNote);
}

export const api = axios.create({
  baseURL: apiBaseURL,
  headers: { "Content-Type": "application/json" },
});
