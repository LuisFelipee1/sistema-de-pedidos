"use client";

import { useState, type FormEvent } from "react";

import { Button, Input, Select } from "@/components/ui";
import { TABLE_STATUS_LABELS, type RestaurantTable, type TablePayload, type TableStatus } from "@/types/tables";

export interface TableFormProps {
  initialValue?: RestaurantTable;
  onSubmit: (payload: TablePayload) => Promise<void>;
  onCancel: () => void;
}

export function TableForm({ initialValue, onSubmit, onCancel }: TableFormProps) {
  const [number, setNumber] = useState(initialValue?.number.toString() ?? "");
  const [status, setStatus] = useState<TableStatus>(initialValue?.status ?? "livre");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({ number: Number(number), status });
    } catch {
      setError("Não foi possível salvar. Confira os dados.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Número da mesa"
        name="number"
        type="number"
        min={1}
        value={number}
        onChange={(event) => setNumber(event.target.value)}
        required
      />
      <Select
        label="Status"
        name="status"
        value={status}
        onChange={(event) => setStatus(event.target.value as TableStatus)}
      >
        {Object.entries(TABLE_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
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
