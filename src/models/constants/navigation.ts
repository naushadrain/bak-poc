import {
  BookOpen,
  FolderKanban,
  House,
  ShoppingCart,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: House },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Asset Management", href: "/asset-management", icon: Wrench },
  { label: "Procurement", href: "/procurement", icon: ShoppingCart },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Definitions", href: "/definitions", icon: BookOpen },
];
