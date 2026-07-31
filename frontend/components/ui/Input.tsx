import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, id, className = "", ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {label}
        </label>
        <div className="relative flex items-center">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 text-ink-muted">{icon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`h-11 w-full rounded-xl border bg-surface text-ink placeholder:text-ink-muted/60
              transition-colors duration-150 outline-none
              ${icon ? "pl-10" : "pl-3.5"} pr-3.5
              ${error ? "border-danger focus:border-danger" : "border-border focus:border-accent"}
              ${className}`}
            aria-invalid={Boolean(error)}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  },
);

Input.displayName = "Input";
