"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui";
import { TABLE_STATUS_LABELS, type RestaurantTable } from "@/types/tables";

import { TABLE_STATUS_SURFACE, TABLE_STATUS_TONE } from "./table-status";

export interface TableCardProps {
  table: RestaurantTable;
  onSelect: (table: RestaurantTable) => void;
}

export function TableCard({ table, onSelect }: TableCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(table)}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      aria-label={`Mesa ${table.number} — ${TABLE_STATUS_LABELS[table.status]}`}
      className={`flex aspect-square w-full flex-col items-center justify-center gap-2
        rounded-2xl border-2 p-2 shadow-sm transition-colors duration-200
        ${TABLE_STATUS_SURFACE[table.status]}`}
    >
      <span className="text-4xl leading-none font-bold tabular-nums sm:text-5xl">
        {table.number}
      </span>
      <Badge tone={TABLE_STATUS_TONE[table.status]}>{TABLE_STATUS_LABELS[table.status]}</Badge>
    </motion.button>
  );
}
