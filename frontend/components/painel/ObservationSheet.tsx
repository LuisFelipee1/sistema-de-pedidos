"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

import { Button, Text } from "@/components/ui";

export interface ObservationResult {
  quantity: number;
  notes: string;
}

export interface ObservationPick {
  /** Muda a cada abertura da folha — usado como `key` para o painel começar
   * sempre com os valores deste item, sem herdar os do anterior. */
  id: string;
  productName: string;
  quantity: number;
  notes: string;
}

export interface ObservationSheetProps {
  /** `null` mantém a folha fechada. */
  pick: ObservationPick | null;
  onConfirm: (result: ObservationResult) => void;
  onCancel: () => void;
}

/** Folha de observações que abre por cima do modal da mesa. Sobe de baixo no
 * mobile (perto do polegar) e vira um cartão centralizado no desktop. */
export function ObservationSheet({ pick, onConfirm, onCancel }: ObservationSheetProps) {
  return (
    <AnimatePresence>
      {pick && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          // O modal da mesa fecha ao clicar no próprio backdrop; sem parar a
          // propagação aqui, fechar esta folha fecharia o pedido inteiro junto.
          onClick={(event) => {
            event.stopPropagation();
            onCancel();
          }}
          className="fixed inset-0 z-60 flex items-end justify-center bg-ink/50 sm:items-center sm:px-4"
        >
          <ObservationPanel key={pick.id} pick={pick} onConfirm={onConfirm} onCancel={onCancel} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ObservationPanelProps {
  pick: ObservationPick;
  onConfirm: (result: ObservationResult) => void;
  onCancel: () => void;
}

function ObservationPanel({ pick, onConfirm, onCancel }: ObservationPanelProps) {
  const [quantity, setQuantity] = useState(pick.quantity);
  const [notes, setNotes] = useState(pick.notes);

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onClick={(event) => event.stopPropagation()}
      className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 shadow-xl sm:rounded-3xl"
    >
      <div className="mb-4">
        <Text variant="label">Observações (opcional)</Text>
        <Text variant="h2" className="mt-1">
          {pick.productName}
        </Text>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <Text variant="body" className="font-medium">
          Quantidade
        </Text>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1}
            aria-label="Diminuir quantidade"
            className="flex size-10 items-center justify-center rounded-full border border-border
              text-ink transition-colors hover:border-accent hover:text-accent
              disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiMinus size={18} />
          </button>
          <span className="w-6 text-center text-xl font-bold tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((current) => current + 1)}
            aria-label="Aumentar quantidade"
            className="flex size-10 items-center justify-center rounded-full border border-border
              text-ink transition-colors hover:border-accent hover:text-accent"
          >
            <FiPlus size={18} />
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Alguma observação?</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          autoFocus
          placeholder="Ex: sem tomate, carne bem passada, molho à parte..."
          className="w-full resize-none rounded-xl border border-border bg-paper px-4 py-3
            text-base text-ink outline-none transition-colors placeholder:text-ink-muted
            focus:border-accent"
        />
      </label>

      <div className="mt-5 flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={() => onConfirm({ quantity, notes: notes.trim() })}
          className="flex-1"
        >
          Salvar
        </Button>
      </div>
    </motion.div>
  );
}
