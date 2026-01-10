import type { PaymentMethod } from "../types";

const stripDiacritics = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalizeKey = (value?: string) => {
  if (!value) return "";
  return stripDiacritics(value)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  "PIX",
  "CASH",
  "DEBIT",
  "CREDIT",
  "TRANSFER",
  "OTHER",
];

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: "Pix",
  CASH: "Dinheiro",
  DEBIT: "Debito",
  CREDIT: "Credito",
  TRANSFER: "Transferencia",
  OTHER: "Outro",
};

export const mapToPaymentMethod = (value?: string): PaymentMethod | undefined => {
  const key = normalizeKey(value);
  if (!key) return undefined;

  if (key.includes("PIX")) return "PIX";
  if (key.includes("DINHEIRO") || key.includes("CASH")) return "CASH";
  if (key.includes("DEBITO") || key.includes("DEBIT")) return "DEBIT";
  if (key.includes("CREDITO") || key.includes("CREDIT")) return "CREDIT";
  if (key.includes("TRANSFER")) return "TRANSFER";
  if (key.includes("OUTRO") || key.includes("OTHER")) return "OTHER";
  return undefined;
};

export const formatPaymentMethodLabel = (value?: string | PaymentMethod) => {
  const method = typeof value === "string" ? mapToPaymentMethod(value) : value;
  if (method && PAYMENT_METHOD_LABELS[method]) {
    return PAYMENT_METHOD_LABELS[method];
  }
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return undefined;
};

export const isPaymentMethodCredit = (value?: string | PaymentMethod) => {
  const normalized = normalizeKey(typeof value === "string" ? value : value ?? "");
  return normalized.includes("CREDIT");
};
