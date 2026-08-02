"use client";

import { FiLoader } from "react-icons/fi";

import { Sidebar } from "@/components/painel/Sidebar";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const { isChecking, isAuthenticated } = useRequireAuth();

  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <FiLoader className="animate-spin text-ink-muted" size={28} aria-label="Carregando" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}
