"use client";

import { FaBellConcierge } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";

import { Text } from "@/components/ui";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/slices/authSlice";

export function MobileHeader() {
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.auth.username);

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-surface
        px-4 py-3 md:hidden"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink">
        <FaBellConcierge size={16} />
      </span>
      <Text variant="body" className="min-w-0 flex-1 truncate font-semibold">
        {username}
      </Text>
      <button
        type="button"
        onClick={() => dispatch(logout())}
        aria-label="Sair"
        className="flex size-10 items-center justify-center rounded-xl text-ink-muted
          transition-colors hover:bg-paper hover:text-ink"
      >
        <FiLogOut size={20} />
      </button>
    </header>
  );
}
