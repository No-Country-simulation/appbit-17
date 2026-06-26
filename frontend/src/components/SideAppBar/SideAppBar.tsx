import type { ReactNode } from "react";
import { Avatar } from "../Avatar";
import { NavItem } from "../NavItem";
import { styles } from "./SideAppBar.styles";

export type SideNavItem = {
  value: string;
  label: string;
  icon: ReactNode;
};

export type SideAppBarProps = {
  /** Itens de navegação (viram NavItem). */
  items: SideNavItem[];
  /** Valor do item ativo (rota atual). */
  activeValue: string;
  onNavigate?: (value: string) => void;
  /** Usuário logado — exibe Avatar no rodapé (opcional). */
  user?: { name: string };
  /** Marca no topo (opcional) — ex.: <Logo/> num chip. */
  brand?: ReactNode;
};

/** Barra lateral flutuante — NavItems (marca e avatar são opcionais). */
export function SideAppBar({ items, activeValue, onNavigate, user, brand }: SideAppBarProps) {
  return (
    <aside className={styles.root}>
      {brand && <div className={styles.brand}>{brand}</div>}

      <nav className={styles.nav}>
        {items.map((item) => (
          <NavItem
            key={item.value}
            label={item.label}
            icon={item.icon}
            active={item.value === activeValue}
            onClick={() => onNavigate?.(item.value)}
          />
        ))}
      </nav>

      {user && <Avatar name={user.name} size="md" />}
    </aside>
  );
}
