import { SelectHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-ink-700 dark:text-white/80">
          {label}
        </label>
        <select
          id={selectId}
          ref={ref}
          className={clsx(
            "rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors focus:border-emerald dark:border-white/10 dark:bg-surface-cardDark dark:text-white",
            error && "border-danger focus:border-danger",
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);

Select.displayName = "Select";
