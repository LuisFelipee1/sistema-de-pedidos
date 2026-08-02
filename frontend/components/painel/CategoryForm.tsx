"use client";

import { useState, type FormEvent } from "react";

import { Button, Input, Switch } from "@/components/ui";
import type { Category, CategoryPayload } from "@/types/menu";

export interface CategoryFormProps {
  initialValue?: Category;
  onSubmit: (payload: CategoryPayload) => Promise<void>;
  onCancel: () => void;
}

export function CategoryForm({ initialValue, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [displayOrder, setDisplayOrder] = useState(initialValue?.display_order.toString() ?? "0");
  const [isActive, setIsActive] = useState(initialValue?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name, display_order: Number(displayOrder), is_active: isActive });
    } catch {
      setError("Não foi possível salvar. Confira os dados.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nome da categoria"
        name="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <Input
        label="Ordem de exibição"
        name="display_order"
        type="number"
        min={0}
        value={displayOrder}
        onChange={(event) => setDisplayOrder(event.target.value)}
      />
      <Switch label="Categoria ativa" checked={isActive} onChange={setIsActive} />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Salvar
        </Button>
      </div>
    </form>
  );
}
