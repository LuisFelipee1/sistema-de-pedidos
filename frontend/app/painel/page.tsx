"use client";

import { FiLoader, FiLogOut } from "react-icons/fi";

import { Button, Card, MascotMessage, Text } from "@/components/ui";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logout } from "@/lib/redux/slices/authSlice";

export default function PainelPage() {
  const { isChecking, isAuthenticated } = useRequireAuth();
  const dispatch = useAppDispatch();
  const { username, roles } = useAppSelector((state) => state.auth);

  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <FiLoader className="animate-spin text-ink-muted" size={28} aria-label="Carregando" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper px-4 py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <MascotMessage variant="happy" size={100}>
          <Text variant="body">
            Oi, <strong>{username}</strong>! Essa é a base do painel — as telas de mesas, cardápio
            e pedidos ainda estão por vir.
          </Text>
        </MascotMessage>

        <Card className="flex items-center justify-between">
          <div>
            <Text variant="label">Funções</Text>
            <Text variant="body" className="mt-1">
              {roles.join(", ") || "—"}
            </Text>
          </div>
          <Button variant="secondary" onClick={() => dispatch(logout())}>
            <FiLogOut size={16} />
            Sair
          </Button>
        </Card>
      </div>
    </div>
  );
}
