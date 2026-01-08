import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../api/auth";
import { setMustChangePassword } from "../api/client";

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!currentPassword.trim()) {
      nextErrors.currentPassword = "Informe a senha atual.";
    }

    if (newPassword.length < 8) {
      nextErrors.newPassword = "A nova senha deve ter pelo menos 8 caracteres.";
    }

    if (confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "A confirmacao nao confere.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMustChangePassword(false);
      navigate("/", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao trocar a senha.";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          Troque sua senha
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Por seguranca, altere sua senha antes de continuar.
        </p>

        <form className="mt-6 space-y-4" noValidate onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Senha atual
            </span>
            <input
              type="password"
              name="currentPassword"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
            {errors.currentPassword && (
              <p className="mt-2 text-xs text-red-600">{errors.currentPassword}</p>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Nova senha
            </span>
            <input
              type="password"
              name="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              minLength={8}
              required
            />
            {errors.newPassword && (
              <p className="mt-2 text-xs text-red-600">{errors.newPassword}</p>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Confirmar nova senha
            </span>
            <input
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              minLength={8}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
          </label>

          {apiError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {apiError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
