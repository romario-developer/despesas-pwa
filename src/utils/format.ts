const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);
export const formatBRL = (value: number) => currencyFormatter.format(value);

const extractDateParts = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, year, month, day] = match;
  return { year, month, day };
};

export const formatDate = (isoDate: string) => {
  const trimmed = isoDate.trim();
  const parts = extractDateParts(trimmed);
  if (parts) {
    return `${parts.day}/${parts.month}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return dateFormatter.format(parsed);
};

export const parseCurrencyInput = (input: string) => {
  const sanitized = input.replace(/[^\d,.-]/g, "");
  const normalized = sanitized.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : NaN;
};

export const safeNumber = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const formatPercent = (value: number) => {
  const clamped = clamp(value, 0, 100);
  const decimals = Number.isInteger(clamped) ? 0 : 1;
  return `${clamped.toFixed(decimals)}%`;
};
