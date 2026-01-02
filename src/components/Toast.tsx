import { useEffect } from "react";

type ToastProps = {
  message: string;
  type?: "success" | "error";
  onClose?: () => void;
  duration?: number;
};

const Toast = ({ message, type = "success", onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const id = window.setTimeout(() => onClose?.(), duration);
    return () => window.clearTimeout(id);
  }, [duration, onClose]);

  const bg =
    type === "error"
      ? "bg-red-600"
      : "bg-emerald-600";

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className={`flex items-center gap-3 rounded-lg ${bg} px-4 py-3 text-sm font-semibold text-white shadow-lg`}>
        <span>{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-white/10 px-2 py-1 text-xs font-semibold transition hover:bg-white/20"
          >
            Fechar
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast;
