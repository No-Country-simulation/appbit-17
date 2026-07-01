import type { ReactNode } from "react";
import { Avatar } from "../Avatar";
import { styles } from "./TopAppBar.styles";

export type TopAppBarProps = {
  /** Marca à esquerda — ex.: <Logo variant="dark" />. */
  brand?: ReactNode;
  /** Título da página (centralizado). */
  title?: string;
  /** Ações à direita antes do avatar — ex.: botões de ícone (config, notificações). */
  actions?: ReactNode;
  /** Usuário logado — exibe Avatar à direita. */
  user?: { name: string };
};

/** Barra superior — marca (esq) · título (centro) · ações + avatar (dir). */
export function TopAppBar({ brand, title, actions, user }: TopAppBarProps) {
  return (
    <header className={styles.root}>
      <div className={styles.brand}>{brand}</div>

      <span className={styles.title}>{title}</span>

      <div className={styles.right}>
        {actions}
        {/* Avatar só em telas médias+ — libera espaço no mobile p/ as ações. */}
        {user && (
          <span className="hidden md:inline-flex">
            <Avatar name={user.name} size="md" />
          </span>
        )}
      </div>
    </header>
  );
}
