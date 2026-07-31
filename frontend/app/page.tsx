"use client";

import {
  FaBellConcierge,
  FaClipboardList,
  FaCreditCard,
  FaKitchenSet,
  FaQrcode,
  FaUserGroup,
} from "react-icons/fa6";
import { MdOutlineTableRestaurant } from "react-icons/md";

import { Button, FeatureCard, MascotMessage, Text } from "@/components/ui";

const FEATURES = [
  {
    icon: FaQrcode,
    title: "Cardápio pelo QR Code",
    description:
      "O cliente escaneia o código na mesa, vê o cardápio e monta o pedido sozinho — sem app pra baixar.",
  },
  {
    icon: FaClipboardList,
    title: "Pedido presencial",
    description:
      "O garçom lança o pedido direto no sistema e manda pra cozinha na hora, sem ida e volta.",
  },
  {
    icon: FaKitchenSet,
    title: "Fila da cozinha em tempo real",
    description:
      "Cada pedido aparece assim que entra, com status claro do início ao fim do preparo.",
  },
  {
    icon: FaCreditCard,
    title: "Pagamento com Mercado Pago",
    description:
      "PIX e cartão direto pelo sistema, com confirmação automática assim que o pagamento cai.",
  },
  {
    icon: MdOutlineTableRestaurant,
    title: "Controle de mesas",
    description: "Veja o status de cada mesa — livre, ocupada, aguardando pagamento — num painel só.",
  },
  {
    icon: FaUserGroup,
    title: "Gestão da equipe",
    description:
      "Cada funcionário com sua função — garçom, cozinha ou administrador — e o acesso certo pra cada um.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-ink">
            <FaBellConcierge size={16} />
          </span>
          <Text variant="h2" className="text-lg">
            Sistema de Pedidos
          </Text>
        </div>
        <Button href="/login" variant="secondary">
          Entrar
        </Button>
      </header>

      <main className="flex flex-1 flex-col gap-24 px-6 pb-28">
        {/* Hero */}
        <section className="mx-auto flex w-full max-w-6xl flex-col-reverse items-center gap-10 pt-8 lg:flex-row">
          <div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold tracking-wide text-ink-muted uppercase">
              <FaBellConcierge className="text-accent" />
              Feito pra pequenos restaurantes
            </span>
            <Text variant="h1" className="max-w-lg">
              Todo pedido, do cardápio ao pagamento, num lugar só.
            </Text>
            <Text variant="muted" className="max-w-md text-base">
              Hamburgueria, pizzaria, cafeteria ou food truck — organize cardápio, mesas, cozinha
              e pagamento sem perder nenhum pedido de vista.
            </Text>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/cadastro" size="lg" className="w-full sm:w-auto">
                Cadastrar meu restaurante
              </Button>
              <Button href="/login" variant="secondary" size="lg" className="w-full sm:w-auto">
                Já tenho conta
              </Button>
            </div>
          </div>

          <div className="flex flex-1 justify-center">
            <MascotMessage variant="happy" size={140} align="right">
              <Text variant="body">
                Oi, eu sou o <strong>Ding</strong>! Vou te mostrar rapidinho o que dá pra fazer por
                aqui.
              </Text>
            </MascotMessage>
          </div>
        </section>

        {/* Problema */}
        <section className="mx-auto flex w-full max-w-3xl justify-center">
          <MascotMessage variant="sad" size={90}>
            <Text variant="body">
              Comanda de papel some, pedido sai errado, cliente esperando sem saber quanto falta…
              isso cansa, né?
            </Text>
          </MascotMessage>
        </section>

        {/* Features */}
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <div className="flex justify-center">
            <MascotMessage variant="serious" size={90}>
              <Text variant="body">Com o sistema, cada etapa fica organizada. Olha só:</Text>
            </MascotMessage>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 text-center">
          <MascotMessage variant="happy" size={110}>
            <Text variant="body">
              Bora organizar o seu restaurante? Leva menos de 2 minutos pra cadastrar.
            </Text>
          </MascotMessage>
          <Button href="/cadastro" size="lg">
            Cadastrar meu restaurante
          </Button>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center">
        <Text variant="muted">Sistema de Pedidos — gestão de pedidos para pequenos restaurantes.</Text>
      </footer>
    </div>
  );
}
