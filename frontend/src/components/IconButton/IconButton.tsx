import type { ReactNode } from "react";
import { cx, styles } from "./IconButton.styles";
import { resolveState, variantStyles, type IconButtonVariant } from "./IconButton.states";

export type IconButtonProps = {
  /** Texto para acessibilidade (lido por leitores de tela). */
  label: string;
  /** Variante visual (default: solid). `ghost` = sem chip (topbar). */
  variant?: IconButtonVariant;
  /** Estado selecionado/ativo (ex.: filtro ligado, aba selecionada). */
  active?: boolean;
  onClick?: () => void;
  /** Ícone. Use `currentColor` para herdar a cor do estado. */
  children: ReactNode;
};

/**
 * Botão de ícone 40×40.
 *  - variant `solid`: fundo branco + sombra (hover cinza); `active` = azul.
 *  - variant `ghost`: transparente (hover cinza); `active` = azul-claro.
 */
export function IconButton({
  label,
  variant = "solid",
  active = false,
  onClick,
  children,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cx(styles.root, variantStyles[variant][resolveState({ active })])}
    >
      {children}
    </button>
  );
}
