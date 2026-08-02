"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

import { Button, Input, Select, Switch } from "@/components/ui";
import type { Category, Product, ProductPayload } from "@/types/menu";

export interface ProductFormProps {
  initialValue?: Product;
  categories: Category[];
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ initialValue, categories, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initialValue?.name ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [price, setPrice] = useState(initialValue?.price ?? "");
  const [categoryId, setCategoryId] = useState(
    initialValue?.category.toString() ?? categories[0]?.id.toString() ?? "",
  );
  const [isAvailable, setIsAvailable] = useState(initialValue?.is_available ?? true);
  const [image, setImage] = useState<File | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryId) {
      setError("Crie uma categoria antes de cadastrar produtos.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        category: Number(categoryId),
        name,
        description,
        price,
        is_available: isAvailable,
        image,
      });
    } catch {
      setError("Não foi possível salvar. Confira os dados.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nome do produto"
        name="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <Select
        label="Categoria"
        name="category"
        value={categoryId}
        onChange={(event) => setCategoryId(event.target.value)}
        required
      >
        {categories.length === 0 && <option value="">Crie uma categoria primeiro</option>}
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Input
        label="Preço"
        name="price"
        type="number"
        step="0.01"
        min={0}
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-ink outline-none transition-colors duration-150 focus:border-accent"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
          Foto do produto
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => setImage(event.target.files?.[0])}
          className="text-sm text-ink-muted file:mr-3 file:rounded-lg file:border-0 file:bg-accent/10 file:px-3 file:py-2 file:font-medium file:text-accent"
        />
        {initialValue?.image && !image && (
          <Image
            src={initialValue.image}
            alt={initialValue.name}
            width={64}
            height={64}
            className="mt-1 rounded-lg border border-border object-cover"
          />
        )}
      </div>
      <Switch label="Disponível no cardápio" checked={isAvailable} onChange={setIsAvailable} />
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
