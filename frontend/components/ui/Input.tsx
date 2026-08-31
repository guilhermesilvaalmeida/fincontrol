import { InputHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-ink-700 dark:text-white/80">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            "rounded-xl border border-ink-100 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-400 focus:border-emerald dark:border-white/10 dark:bg-surface-cardDark dark:text-white",
            error && "border-danger focus:border-danger",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="text-xs text-danger">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
