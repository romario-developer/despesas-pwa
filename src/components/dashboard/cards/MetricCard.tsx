import type { ReactNode } from "react";
import { cardBase, cardHover, titleMuted, valueBig } from "../../../styles/dashboardTokens";

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  variant?: "default" | "positive" | "negative" | "highlight";
  onClick?: () => void;
};

const variantClasses: Record<NonNullable<MetricCardProps["variant"]>, string> = {
  default: "border-slate-200/70 bg-white shadow-sm",
  positive: "border-emerald-200/70 bg-emerald-50/40",
  negative: "border-rose-200/70 bg-rose-50/40",
  highlight:
    "relative overflow-hidden border-primary/30 bg-white shadow-md ring-1 ring-primary/20 before:absolute before:left-0 before:top-0 before:h-1 before:w-full before:bg-primary/70 before:content-['']",
};

const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  onClick,
}: MetricCardProps) => {
  const badgeText = subtitle && subtitle.length <= 12 ? subtitle : undefined;
  const valueToneClass =
    variant === "positive"
      ? "text-emerald-700"
      : variant === "negative"
        ? "text-rose-700"
        : "text-slate-900";
  const baseClasses = [
    cardBase,
    cardHover,
    "min-h-[112px] w-full p-4 sm:p-5 text-left",
    variantClasses[variant],
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600">
              {icon}
            </span>
          ) : null}
          <p className={`${titleMuted} leading-snug`}>{title}</p>
        </div>
        {badgeText ? (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {badgeText}
          </span>
        ) : null}
      </div>
      <p className={`${valueBig} ${valueToneClass} break-words leading-tight`}>
        {value}
      </p>
      {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${baseClasses} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30`}
        aria-label={`Abrir ${title}`}
      >
        {content}
      </button>
    );
  }

  return <div className={baseClasses}>{content}</div>;
};

export default MetricCard;
