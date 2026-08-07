import type { IconType } from "react-icons";
import { FaBoxOpen, FaKitchenSet, FaUserGroup } from "react-icons/fa6";
import { FiHome, FiSettings } from "react-icons/fi";
import { MdOutlineCategory, MdOutlineRestaurantMenu, MdOutlineTableRestaurant } from "react-icons/md";

/** Substituído pelo slug do restaurante da sessão em `visibleNavItems`. */
export const SLUG_TOKEN = ":slug";

export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  /** Administrador pode fazer tudo que Garçom/Cozinha também podem — sempre incluído. */
  roles: string[];
  /** Texto do atalho no dashboard. O item sem descrição não vira atalho. */
  description?: string;
  /** Abre em outra aba — usado na vitrine, que fica fora do painel. */
  external?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/painel",
    label: "Dashboard",
    icon: FiHome,
    roles: ["administrador", "garcom", "cozinha"],
  },
  {
    href: "/painel/mesas",
    label: "Mesas",
    icon: MdOutlineTableRestaurant,
    roles: ["administrador", "garcom"],
    description: "Veja o salão, mude o status e anote pedidos.",
  },
  {
    href: "/painel/cozinha",
    label: "Cozinha",
    icon: FaKitchenSet,
    roles: ["administrador", "cozinha"],
    description: "Acompanhe os pedidos das mesas e o preparo.",
  },
  {
    href: `/cardapio/${SLUG_TOKEN}`,
    label: "Meu Cardápio",
    icon: MdOutlineRestaurantMenu,
    roles: ["administrador"],
    description: "Veja a vitrine que o cliente enxerga e faz pedido.",
    external: true,
  },
  {
    href: "/painel/cardapio/categorias",
    label: "Categorias",
    icon: MdOutlineCategory,
    roles: ["administrador"],
    description: "Organize o cardápio em categorias.",
  },
  {
    href: "/painel/cardapio/produtos",
    label: "Produtos",
    icon: FaBoxOpen,
    roles: ["administrador"],
    description: "Cadastre os produtos, preços e adicionais.",
  },
  {
    href: "/painel/funcionarios",
    label: "Funcionários",
    icon: FaUserGroup,
    roles: ["administrador"],
    description: "Adicione garçons e cozinha, com a função certa.",
  },
  {
    href: "/painel/configuracoes",
    label: "Configurações",
    icon: FiSettings,
    roles: ["administrador"],
    description: "Logo, endereço e telefone que aparecem no cardápio.",
  },
];

export function visibleNavItems(roles: string[], slug?: string | null): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.some((role) => roles.includes(role)))
    // Sem slug não dá para montar o link da vitrine, então ele nem aparece.
    .filter((item) => !item.href.includes(SLUG_TOKEN) || Boolean(slug))
    .map((item) =>
      item.href.includes(SLUG_TOKEN)
        ? { ...item, href: item.href.replace(SLUG_TOKEN, slug ?? "") }
        : item,
    );
}
