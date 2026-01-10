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
  "Dinheiro",
  "Debito",
  "Credito",
  "Pix",
  "Transferencia",
  "Outro",
];

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  Dinheiro: "Dinheiro",
  Debito: "Débito",
  Credito: "Crédito",
  Pix: "Pix",
  Transferencia: "Transferência",
  Outro: "Outro",
};

export const mapToPaymentMethod = (value?: string): PaymentMethod | undefined => {
  const key = normalizeKey(value);
  if (!key) return undefined;

  if (key.includes("PIX")) return "Pix";
  if (key.includes("DINHEIRO")) return "Dinheiro";
  if (key.includes("DEBITO") || key.includes("DEBIT")) return "Debito";
  if (key.includes("CREDITO") || key.includes("CREDIT")) return "Credito";
  if (key.includes("TRANSFER")) return "Transferencia";
  if (key.includes("OUTRO")) return "Outro";
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
  return normalized.includes("CREDITO") || normalized.includes("CREDIT");
};
