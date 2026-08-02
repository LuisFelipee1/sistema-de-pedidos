import type { IconType } from "react-icons";
import { FaBoxOpen, FaKitchenSet, FaUserGroup } from "react-icons/fa6";
import { FiHome } from "react-icons/fi";
import { MdOutlineCategory, MdOutlineTableRestaurant } from "react-icons/md";

export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  /** Administrador pode fazer tudo que Garçom/Cozinha também podem — sempre incluído. */
  roles: string[];
  /** Texto do atalho no dashboard. O item sem descrição não vira atalho. */
  description?: string;
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
];

export function visibleNavItems(roles: string[]): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.some((role) => roles.includes(role)));
}
