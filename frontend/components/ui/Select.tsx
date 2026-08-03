"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { FiCheck, FiChevronDown, FiSearch } from "react-icons/fi";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  /** Mostra um campo de busca dentro da lista, para casos com muitas opções. */
  searchable?: boolean;
  searchPlaceholder?: string;
  children: ReactNode;
}

interface OptionData {
  value: string;
  label: string;
  disabled: boolean;
}

/** Lê os `<option>` passados como children para montar a lista. */
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

/** Select do design system.
 *
 * Sempre desenha a própria lista em vez do menu nativo, que cada navegador
 * estiliza do seu jeito e ignora boa parte do CSS da página. Como isso abre
 * mão do comportamento nativo, o teclado é reimplementado aqui: setas, Home,
 * End, Enter e Escape. Não suporta `<optgroup>`. */
export function Select({
  label,
  error,
  id,
  className = "",
  searchable = false,
  searchPlaceholder = "Buscar...",
  children,
  ...selectProps
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? selectProps.name ?? generatedId;

  const nativeRef = useRef<HTMLSelectElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

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

    document.addEventListener("mousedown", handlePointerDown);
    if (searchable) searchRef.current?.focus();
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen, searchable]);

  // Mantém a opção destacada visível ao navegar com as setas.
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  /** Escreve no select nativo escondido e dispara o evento de verdade, para o
   * `onChange` de quem usa o componente receber um ChangeEvent normal. */
  function pick(option: OptionData) {
    if (option.disabled) return;
    const select = nativeRef.current;
    if (select) {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
      setter?.call(select, option.value);
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    close();
  }

  function open() {
    setIsOpen(true);
    setActiveIndex(options.findIndex((option) => option.value === currentValue));
  }

  function close() {
    setIsOpen(false);
    setSearch("");
    setActiveIndex(-1);
  }

  /** Anda para a próxima opção habilitada na direção indicada. */
  function move(step: number) {
    if (visible.length === 0) return;
    let next = activeIndex;
    for (let attempt = 0; attempt < visible.length; attempt += 1) {
      next = (next + step + visible.length) % visible.length;
      if (!visible[next].disabled) {
        setActiveIndex(next);
        return;
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      close();
      return;
    }
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter") {
        event.preventDefault();
        open();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(-1);
      move(1);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(visible.length);
      move(-1);
    } else if (event.key === "Enter" || (event.key === " " && !searchable)) {
      event.preventDefault();
      if (visible[activeIndex]) pick(visible[activeIndex]);
    }
  }

  const fieldClassName = `h-11 w-full rounded-xl border bg-surface px-3.5 text-ink outline-none
    transition-colors duration-150
    ${error ? "border-danger focus:border-danger" : "border-border focus:border-accent"}`;

  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${selectId}-label`} className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
        {label}
      </span>

      <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
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
          onClick={() => (isOpen ? close() : open())}
          className={`${fieldClassName} flex items-center justify-between gap-2 text-left
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
              {searchable && (
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
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setActiveIndex(0);
                    }}
                    placeholder={searchPlaceholder}
                    aria-label={`Buscar em ${label}`}
                    className="h-10 w-full bg-transparent pr-3 pl-9 text-sm text-ink outline-none
                      placeholder:text-ink-muted"
                  />
                </div>
              )}

              <ul
                ref={listRef}
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
                  visible.map((option, index) => {
                    const isSelected = option.value === currentValue;
                    const isActive = index === activeIndex;
                    return (
                      <li
                        key={option.value}
                        role="option"
                        aria-selected={isSelected}
                        aria-disabled={option.disabled}
                        onClick={() => pick(option)}
                        onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                        // py-3 no mobile mantém o alvo de toque em 44px, já que
                        // aqui não existe mais o seletor nativo do celular.
                        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-3
                          text-sm transition-colors duration-150 sm:py-2.5 ${
                            option.disabled
                              ? "cursor-not-allowed text-ink-muted opacity-50"
                              : isSelected
                                ? "bg-accent/10 font-semibold text-accent"
                                : isActive
                                  ? "bg-paper text-ink"
                                  : "text-ink"
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
