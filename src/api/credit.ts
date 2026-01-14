import { apiRequest } from "./client";

const normalizeNumber = (value: unknown): number | undefined => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
};

const resolveArray = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const data = payload as Record<string, unknown>;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.cards)) return data.cards;
  if (Array.isArray(data.invoices)) return data.invoices;
  if (Array.isArray(data.forecast)) return data.forecast;
  return [];
};

type RawCreditCard = Record<string, unknown>;

export type CreditOverviewCard = {
  cardId: string;
  name: string;
  brand?: string;
  invoiceAmount?: number;
  closingDate?: string;
  dueDate?: string;
  limit?: number;
  availableLimit?: number;
};

export const getCreditOverview = async (month: string) => {
  const response = await apiRequest<unknown>({
    url: "/api/credit/overview",
    method: "GET",
    params: { month },
  });
  const items = resolveArray(response);
  const cards = items
    .map((raw) => normalizeCreditCard(raw))
    .filter((item): item is CreditOverviewCard => Boolean(item));
  return cards;
};

const normalizeCreditCard = (value: unknown): CreditOverviewCard | null => {
  if (!value || typeof value !== "object") return null;
  const data = value as RawCreditCard;
  const id =
    normalizeString(data.cardId) ??
    normalizeString(data.id) ??
    normalizeString(data.card) ??
    normalizeString(data.cardIdRaw) ??
    normalizeString(data.card_id);
  if (!id) return null;

  const name =
    normalizeString(data.name) ??
    normalizeString(data.cardName) ??
    normalizeString(data.label) ??
    normalizeString(data.brand);
  if (!name) return null;

  return {
    cardId: id,
    name,
    brand: normalizeString(data.brand),
    invoiceAmount: normalizeNumber(
      data.invoiceAmount ?? data.invoice_total ?? data.total ?? data.amount,
    ),
    closingDate: normalizeString(data.closingDate ?? data.closing_day),
    dueDate: normalizeString(data.dueDate ?? data.due_day),
    limit: normalizeNumber(data.limit ?? data.creditLimit ?? data.credit_limit),
    availableLimit: normalizeNumber(
      data.availableLimit ?? data.available_limit ?? data.available ?? data.limitAvailable,
    ),
  };
};

type RawInvoiceItem = Record<string, unknown>;

export type CreditInvoiceItem = {
  id: string;
  description: string;
  amount: number;
  installmentCurrent?: number;
  installmentTotal?: number;
};

export const getCreditInvoice = async (cardId: string, month: string) => {
  const response = await apiRequest<unknown>({
    url: `/api/credit/cards/${cardId}/invoice`,
    method: "GET",
    params: { month },
  });
  const items = resolveArray(response);
  return items
    .map((item) => normalizeInvoiceItem(item))
    .filter((entry): entry is CreditInvoiceItem => Boolean(entry));
};

const normalizeInvoiceItem = (value: unknown): CreditInvoiceItem | null => {
  if (!value || typeof value !== "object") return null;
  const data = value as RawInvoiceItem;
  const id =
    normalizeString(data.id) ??
    normalizeString(data.lineId) ??
    normalizeString(data.description) ??
    normalizeString(data.item_id);
  const description =
    normalizeString(data.description) ??
    normalizeString(data.title) ??
    normalizeString(data.name);
  const amount =
    normalizeNumber(data.amount ?? data.value) ??
    normalizeNumber(data.invoiceAmount ?? data.total);
  if (!description || amount === undefined) return null;

  const rawInstallments =
    data.installment && typeof data.installment === "object"
      ? (data.installment as Record<string, unknown>)
      : {};
  const installmentCurrent =
    normalizeNumber(data.installmentCurrent ?? rawInstallments.current ?? rawInstallments.index) ??
    normalizeNumber(data.installment_index ?? data.installment_number);
  const installmentTotal =
    normalizeNumber(data.installmentTotal ?? rawInstallments.total ?? rawInstallments.count) ??
    normalizeNumber(data.installment_count ?? data.installment_total);

  return {
    id: id || description,
    description,
    amount,
    installmentCurrent: installmentCurrent ?? undefined,
    installmentTotal: installmentTotal ?? undefined,
  };
};

export type CreditForecastItem = {
  month: string;
  amount: number;
};

export const getCreditForecast = async (cardId: string, months = 6) => {
  const response = await apiRequest<unknown>({
    url: `/api/credit/cards/${cardId}/forecast`,
    method: "GET",
    params: { months },
  });
  const items = resolveArray(response);
  return items
    .map((item) => normalizeForecastItem(item))
    .filter((entry): entry is CreditForecastItem => Boolean(entry));
};

const normalizeForecastItem = (value: unknown): CreditForecastItem | null => {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const month =
    normalizeString(data.month) ??
    normalizeString(data.label) ??
    normalizeString(data.name);
  const amount = normalizeNumber(data.amount ?? data.value ?? data.total);
  if (!month || amount === undefined) return null;
  return { month, amount };
};
