import type { ReactNode } from "react";

import { Text } from "./Text";

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "Nenhum item ainda.",
  isLoading,
}: DataTableProps<T>) {
  if (isLoading) {
    return <Text variant="muted">Carregando…</Text>;
  }

  if (data.length === 0) {
    return <Text variant="muted">{emptyMessage}</Text>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-paper">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-xs font-semibold tracking-wide text-ink-muted uppercase"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="border-b border-border last:border-0 hover:bg-paper/60">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-ink">
                  {column.render(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
