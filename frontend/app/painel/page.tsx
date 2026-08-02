"use client";

import Link from "next/link";

import { visibleNavItems } from "@/components/painel/nav-items";
import { FeatureCard, MascotMessage, Text } from "@/components/ui";
import { useAppSelector } from "@/lib/redux/hooks";

export default function PainelPage() {
  const { username, roles } = useAppSelector((state) => state.auth);
  const isAdmin = roles.includes("administrador");

  // Reaproveita a mesma lista da navegação: um atalho aqui nunca pode apontar
  // para uma tela que o cargo não enxerga no menu.
  const quickLinks = visibleNavItems(roles).filter((item) => item.description);

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <MascotMessage variant="happy" size={100}>
        <Text variant="body">
          Oi, <strong>{username}</strong>!{" "}
          {isAdmin
            ? "Antes de operar pedidos, vamos configurar seu restaurante — comece cadastrando mesas e cardápio."
            : "Tudo pronto para o serviço. Abra as mesas para anotar os pedidos."}
        </Text>
      </MascotMessage>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <FeatureCard icon={link.icon} title={link.label} description={link.description!} />
          </Link>
        ))}
      </div>
    </div>
  );
}
