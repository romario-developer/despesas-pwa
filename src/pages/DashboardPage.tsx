import { useState } from "react";
import { apiFetch } from "../api/client";
import type { SummaryResponse } from "../types";

const DashboardPage = () => {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch<SummaryResponse>("/api/summary?month=2025-12");
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar resumo.";
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Dashboard</h2>
        <button
          type="button"
          onClick={handleTest}
          disabled={isLoading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isLoading ? "Carregando..." : "Testar Summary"}
        </button>
      </div>
      <div className="card p-4">
        <p className="mb-2 text-sm text-slate-600">Em construção</p>
        {error && (
          <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {data && (
          <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
        {!data && !error && (
          <p className="text-sm text-slate-500">
            Clique em &quot;Testar Summary&quot; para validar a API.
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
