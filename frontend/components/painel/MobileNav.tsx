"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppSelector } from "@/lib/redux/hooks";

import { NAV_ITEMS } from "./nav-items";

/** Barra inferior do mobile: o garçom segura o celular com uma mão só, então a
 * navegação fica na altura do polegar em vez de escondida atrás de um menu. */
export function MobileNav() {
  const pathname = usePathname();
  const roles = useAppSelector((state) => state.auth.roles);

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.some((role) => roles.includes(role)));

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface
        pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {visibleItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5
              transition-colors duration-150 ${isActive ? "text-accent" : "text-ink-muted"}`}
          >
            <Icon size={20} className="shrink-0" />
            <span className="w-full truncate text-center text-[10px] font-medium">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
