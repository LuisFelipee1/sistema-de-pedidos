"use client";

import { FiLoader } from "react-icons/fi";

import { MobileHeader } from "@/components/painel/MobileHeader";
import { MobileNav } from "@/components/painel/MobileNav";
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
    <div className="min-h-screen bg-paper md:flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <MobileHeader />
      {/* pb-24 no mobile abre espaço para a barra de navegação fixa não cobrir
          o fim do conteúdo. */}
      <main className="flex-1 px-4 pt-5 pb-24 md:overflow-y-auto md:px-8 md:py-8 md:pb-8">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
