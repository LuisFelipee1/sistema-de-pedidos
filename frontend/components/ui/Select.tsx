"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { FiCheck, FiChevronDown, FiSearch } from "react-icons/fi";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  /** Troca o menu nativo por uma lista com campo de busca, para casos com
   * muitas opções. Não suporta `<optgroup>`. */
  searchable?: boolean;
  searchPlaceholder?: string;
  children: ReactNode;
}

interface OptionData {
  value: string;
  label: string;
  disabled: boolean;
}

/** Lê os `<option>` passados como children para montar a lista pesquisável. */
function extractOptions(children: ReactNode): OptionData[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child) || child.type !== "option") return [];
    const props = child.props as {
      value?: string | number;
      children?: ReactNode;
      disabled?: boolean;
    };
    return [
      {
        value: String(props.value ?? ""),
        label: typeof props.children === "string" ? props.children : String(props.children ?? ""),
        disabled: Boolean(props.disabled),
      },
    ];
  });
}

const labelClassName = "text-xs font-semibold uppercase tracking-wide text-ink-muted";

function fieldClassName(error?: string) {
  return `h-11 w-full rounded-xl border bg-surface px-3.5 text-ink outline-none
    transition-colors duration-150
    ${error ? "border-danger focus:border-danger" : "border-border focus:border-accent"}`;
}

export function Select({
  label,
  error,
  id,
  className = "",
  searchable = false,
  searchPlaceholder = "Buscar...",
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? props.name ?? generatedId;

  if (!searchable) {
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className={labelClassName}>
          {label}
        </label>
        <select
          id={selectId}
          className={`${fieldClassName(error)} ${className}`}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }

  return (
    <SearchableSelect
      label={label}
      error={error}
      selectId={selectId}
      className={className}
      searchPlaceholder={searchPlaceholder}
      selectProps={props}
    >
      {children}
    </SearchableSelect>
  );
}

interface SearchableSelectProps {
  label: string;
  error?: string;
  selectId: string;
  className: string;
  searchPlaceholder: string;
  selectProps: SelectHTMLAttributes<HTMLSelectElement>;
  children: ReactNode;
}

function SearchableSelect({
  label,
  error,
  selectId,
  className,
  searchPlaceholder,
  selectProps,
  children,
}: SearchableSelectProps) {
  const nativeRef = useRef<HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const options = extractOptions(children);
  const currentValue = String(selectProps.value ?? "");
  const selected = options.find((option) => option.value === currentValue);

  const term = search.trim().toLowerCase();
  const visible = term
    ? options.filter((option) => option.label.toLowerCase().includes(term))
    : options;

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  /** Escreve no select nativo escondido e dispara o evento de verdade, para o
   * `onChange` de quem usa o componente continuar recebendo um ChangeEvent
   * normal — a mesma assinatura do select sem busca. */
  function pick(option: OptionData) {
    if (option.disabled) return;
    const select = nativeRef.current;
    if (select) {
      const setter = Object.getOwnPropertyDescriptor(
        HTMLSelectElement.prototype,
        "value",
      )?.set;
      setter?.call(select, option.value);
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setIsOpen(false);
    setSearch("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${selectId}-label`} className={labelClassName}>
        {label}
      </span>

      <div ref={containerRef} className="relative">
        {/* Carrega o valor e mantém as semânticas de formulário (name, required). */}
        <select
          ref={nativeRef}
          id={selectId}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          {...selectProps}
        >
          {children}
        </select>

        <button
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={`${selectId}-listbox`}
          aria-haspopup="listbox"
          aria-labelledby={`${selectId}-label`}
          aria-invalid={Boolean(error)}
          disabled={selectProps.disabled}
          onClick={() => setIsOpen((open) => !open)}
          className={`${fieldClassName(error)} flex items-center justify-between gap-2 text-left
            disabled:opacity-60 ${className}`}
        >
          <span className={`truncate ${selected ? "" : "text-ink-muted"}`}>
            {selected?.label ?? "Selecione..."}
          </span>
          <FiChevronDown
            size={18}
            aria-hidden
            className={`shrink-0 text-ink-muted transition-transform duration-200
              ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-xl
                border border-border bg-surface shadow-xl"
            >
              <div className="relative border-b border-border">
                <FiSearch
                  size={16}
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
                />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={`Buscar em ${label}`}
                  className="h-10 w-full bg-transparent pr-3 pl-9 text-sm text-ink outline-none
                    placeholder:text-ink-muted"
                />
              </div>

              <ul
                id={`${selectId}-listbox`}
                role="listbox"
                aria-labelledby={`${selectId}-label`}
                className="max-h-56 overflow-y-auto p-1"
              >
                {visible.length === 0 ? (
                  <li className="px-3 py-3 text-center text-sm text-ink-muted">
                    Nenhuma opção encontrada.
                  </li>
                ) : (
                  visible.map((option) => {
                    const isSelected = option.value === currentValue;
                    return (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                        onClick={() => pick(option)}
                        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5
                          text-sm transition-colors duration-150 ${
                            option.disabled
                              ? "cursor-not-allowed text-ink-muted opacity-50"
                              : isSelected
                                ? "bg-accent/10 font-semibold text-accent"
                                : "text-ink hover:bg-paper"
                          }`}
                      >
                        <span className="truncate">{option.label}</span>
                        {isSelected && <FiCheck size={16} className="shrink-0" aria-hidden />}
                      </li>
                    );
                  })
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
