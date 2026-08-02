import type { IconType } from "react-icons";
import { FaBoxOpen, FaUserGroup } from "react-icons/fa6";
import { FiHome } from "react-icons/fi";
import { MdOutlineCategory, MdOutlineTableRestaurant } from "react-icons/md";

export interface NavItem {
  href: string;
  label: string;
  icon: IconType;
  /** Administrador pode fazer tudo que Garçom/Cozinha também podem — sempre incluído. */
  roles: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/painel", label: "Dashboard", icon: FiHome, roles: ["administrador", "garcom", "cozinha"] },
  {
    href: "/painel/mesas",
    label: "Mesas",
    icon: MdOutlineTableRestaurant,
    roles: ["administrador", "garcom"],
  },
  {
    href: "/painel/cardapio/categorias",
    label: "Categorias",
    icon: MdOutlineCategory,
    roles: ["administrador"],
  },
  {
    href: "/painel/cardapio/produtos",
    label: "Produtos",
    icon: FaBoxOpen,
    roles: ["administrador"],
  },
  { href: "/painel/funcionarios", label: "Funcionários", icon: FaUserGroup, roles: ["administrador"] },
];
