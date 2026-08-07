"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBellConcierge } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";

import { Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/slices/authSlice";

import { visibleNavItems } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { username, roles, restaurant } = useAppSelector((state) => state.auth);

  const visibleItems = visibleNavItems(roles, restaurant?.slug);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink">
          <FaBellConcierge size={16} />
        </span>
        <Text variant="h2" className="text-base">
          Sistema de Pedidos
        </Text>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-ink-muted hover:bg-paper hover:text-ink"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <div className="px-2">
          <Text variant="muted" className="truncate">
            {username}
          </Text>
        </div>
        <button
          type="button"
          onClick={() => dispatch(logout())}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors duration-150 hover:bg-paper hover:text-ink"
        >
          <FiLogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  );
}
