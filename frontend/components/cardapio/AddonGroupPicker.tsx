"use client";

import Image from "next/image";
import { FiCheck } from "react-icons/fi";

import { Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import type { AddonGroup, AddonOption } from "@/types/menu";

export interface AddonGroupPickerProps {
  group: AddonGroup;
  /** Ids selecionados neste grupo. */
  selected: number[];
  onToggle: (group: AddonGroup, option: AddonOption) => void;
  /** Termo da busca do topo — esconde as opções que não batem. */
  search: string;
}

export function AddonGroupPicker({ group, selected, onToggle, search }: AddonGroupPickerProps) {
  const term = search.trim().toLowerCase();
  const options = term
    ? group.options.filter((option) => option.name.toLowerCase().includes(term))
    : group.options;

  if (options.length === 0) return null;

  const isSingleChoice = !group.is_addon;

  return (
    <section className="flex flex-col">
      <header className="flex items-center gap-3 bg-paper px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-ink">{group.name}</h2>
          <p className="text-sm text-ink-muted">
            {isSingleChoice
              ? "Escolha 1 item"
              : group.is_required
                ? "Escolha ao menos 1 item"
                : "Escolha se quiser"}
          </p>
        </div>
        {group.is_required && (
          <Badge tone="danger" className="shrink-0">
            Obrigatório
          </Badge>
        )}
        <Badge tone={selected.length > 0 ? "success" : "neutral"} className="shrink-0 tabular-nums">
          {selected.length}
          {isSingleChoice ? " / 1" : ""}
        </Badge>
      </header>

      <ul className="flex flex-col">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const price = Number(option.price_delta);
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onToggle(group, option)}
                aria-pressed={isSelected}
                className="flex w-full items-center gap-3 border-b border-border px-4 py-3
                  text-left transition-colors hover:bg-paper"
              >
                {option.image && (
                  <Image
                    src={option.image}
                    alt={option.name}
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-lg object-cover"
                  />
                )}

                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">{option.name}</span>
                  {option.description && (
                    <span className="block text-sm text-ink-muted">{option.description}</span>
                  )}
                  {price > 0 && (
                    <span className="block text-sm font-medium text-success">
                      + {formatCurrency(price)}
                    </span>
                  )}
                </span>

                <span
                  aria-hidden
                  className={`flex size-6 shrink-0 items-center justify-center border-2
                    transition-colors ${isSingleChoice ? "rounded-full" : "rounded-md"} ${
                      isSelected
                        ? "border-accent bg-accent text-accent-ink"
                        : "border-ink/25 bg-surface"
                    }`}
                >
                  {isSelected &&
                    (isSingleChoice ? (
                      <span className="size-2.5 rounded-full bg-accent-ink" />
                    ) : (
                      <FiCheck size={15} strokeWidth={3} />
                    ))}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
