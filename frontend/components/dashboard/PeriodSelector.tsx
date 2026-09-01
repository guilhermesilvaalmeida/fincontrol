"use client";

import clsx from "clsx";

export type DashboardPeriod = "DAY" | "WEEK" | "MONTH" | "YEAR";

const options: { value: DashboardPeriod; label: string }[] = [
  { value: "DAY", label: "Diário" },
  { value: "WEEK", label: "Semanal" },
  { value: "MONTH", label: "Mensal" },
  { value: "YEAR", label: "Anual" },
];

export function PeriodSelector({
  value,
  onChange,
}: {
  value: DashboardPeriod;
  onChange: (period: DashboardPeriod) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl bg-ink-50 p-1 dark:bg-white/5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={clsx(
            "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm",
            value === opt.value
              ? "bg-surface-card text-ink shadow-sm dark:bg-surface-cardDark dark:text-white"
              : "text-ink-400"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
