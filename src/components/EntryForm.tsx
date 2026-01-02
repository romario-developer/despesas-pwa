import { useEffect, useMemo, useState } from "react";
import type { Entry, EntryPayload } from "../types";

type EntryFormProps = {
  initialValues?: Partial<Entry>;
  categories?: string[];
  onSubmit: (payload: EntryPayload) => Promise<void>;
  onCancel: () => void;
};

type FormErrors = Partial<Record<keyof EntryPayload, string>>;

const normalizeAmount = (value: string) => {
  const sanitized = value.replace(/\./g, "").replace(",", ".");
  return Number(sanitized);
};

const EntryForm = ({ initialValues, categories = [], onSubmit, onCancel }: EntryFormProps) => {
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [amount, setAmount] = useState(
    initialValues?.amount !== undefined ? String(initialValues.amount) : "",
  );
  const [category, setCategory] = useState(initialValues?.category ?? "");
  const [date, setDate] = useState(
    initialValues?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
  );
  const [source] = useState(initialValues?.source ?? "manual");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDescription(initialValues?.description ?? "");
    setAmount(
      initialValues?.amount !== undefined ? String(initialValues.amount) : "",
    );
    setCategory(initialValues?.category ?? "");
    setDate(initialValues?.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  }, [initialValues]);

  const safeCategories = Array.isArray(categories)
    ? categories
    : Object.keys((categories ?? {}) as Record<string, unknown>);

  const validate = (): EntryPayload | null => {
    const nextErrors: FormErrors = {};
    if (!description.trim()) nextErrors.description = "Descricao obrigatoria";
    if (!category.trim()) nextErrors.category = "Categoria obrigatoria";
    if (!date) nextErrors.date = "Data obrigatoria";

    const parsedAmount = normalizeAmount(amount);
    if (!amount.trim() || Number.isNaN(parsedAmount)) {
      nextErrors.amount = "Valor invalido";
    } else if (parsedAmount === 0) {
      nextErrors.amount = "Valor deve ser diferente de zero";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return null;
    }

    return {
      description: description.trim(),
      amount: parsedAmount,
      category: category.trim(),
      date,
      source,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setApiError(null);
    const payload = validate();
    if (!payload) return;

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar.";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = useMemo(() => safeCategories, [safeCategories]);

  return (
    <form className="card space-y-4 p-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-slate-700">
          Descricao
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Ex.: Almoco"
            required
          />
        </label>
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Valor
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="0,00"
            required
          />
        </label>
        {errors.amount && (
          <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Categoria
          <input
            list="entry-categories"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Ex.: Alimentacao"
            required
          />
          {categoryOptions.length > 0 && (
            <datalist id="entry-categories">
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          )}
        </label>
        {errors.category && (
          <p className="mt-1 text-xs text-red-600">{errors.category}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Data
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            required
          />
        </label>
        {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
      </div>

      {apiError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {apiError}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
};

export default EntryForm;
