"use client";

import Link from "next/link";
import { FaBoxOpen, FaUserGroup } from "react-icons/fa6";
import { MdOutlineCategory, MdOutlineTableRestaurant } from "react-icons/md";

import { FeatureCard, MascotMessage, Text } from "@/components/ui";
import { useAppSelector } from "@/lib/redux/hooks";

const QUICK_LINKS = [
  {
    icon: MdOutlineTableRestaurant,
    title: "Mesas",
    description: "Cadastre e organize as mesas do seu restaurante.",
    href: "/painel/mesas",
  },
  {
    icon: MdOutlineCategory,
    title: "Categorias",
    description: "Organize o cardápio em categorias.",
    href: "/painel/cardapio/categorias",
  },
  {
    icon: FaBoxOpen,
    title: "Produtos",
    description: "Cadastre os produtos, preços e adicionais.",
    href: "/painel/cardapio/produtos",
  },
  {
    icon: FaUserGroup,
    title: "Funcionários",
    description: "Adicione garçons e cozinha, com a função certa.",
    href: "/painel/funcionarios",
  },
];

export default function PainelPage() {
  const { username } = useAppSelector((state) => state.auth);

  return (
    <div className="flex flex-col gap-10">
      <MascotMessage variant="happy" size={100}>
        <Text variant="body">
          Oi, <strong>{username}</strong>! Antes de operar pedidos, vamos configurar seu
          restaurante — comece cadastrando mesas e cardápio.
        </Text>
      </MascotMessage>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <FeatureCard icon={link.icon} title={link.title} description={link.description} />
          </Link>
        ))}
      </div>
    </div>
  );
}
