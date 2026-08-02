"use client";

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export interface FilterChipsProps<T extends string> {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label"?: string;
}

/** Filtros de toque único. No mobile a linha rola na horizontal em vez de
 * quebrar, para os chips não empurrarem o conteúdo da tela para baixo. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: FilterChipsProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm
              font-medium transition-colors duration-150 ${
                isActive
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-border bg-surface text-ink-muted hover:border-ink/30 hover:text-ink"
              }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  isActive ? "bg-accent-ink/20" : "bg-ink/10"
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
