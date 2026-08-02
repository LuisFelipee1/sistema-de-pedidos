import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className = "", children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`h-11 w-full rounded-xl border bg-surface px-3.5 text-ink outline-none
            transition-colors duration-150
            ${error ? "border-danger focus:border-danger" : "border-border focus:border-accent"}
            ${className}`}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  },
);

Select.displayName = "Select";
