import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  helper?: ReactNode;
};

const EmptyState = ({ title, description, actions, helper }: EmptyStateProps) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mt-2 text-sm text-slate-600">{description}</p>
    {actions ? (
      <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-center">
        {actions}
      </div>
    ) : null}
    {helper ? <div className="mt-3 text-xs text-slate-500">{helper}</div> : null}
  </div>
);

export default EmptyState;
