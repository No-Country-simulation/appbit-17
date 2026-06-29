/* ============================================================
   IconButton — VARIANTES × ESTADOS
     variante: 'solid' (chip + sombra)  ·  'ghost' (transparente, p/ topbar)
     estado:   'default' (+ hover)      ·  'active' (azul, controlado por `active`)
   ============================================================ */

export type IconButtonVariant = "solid" | "ghost";
export type IconButtonState = "default" | "active";

/** Deriva o estado visual a partir das props. */
export function resolveState({ active }: { active?: boolean }): IconButtonState {
  return active ? "active" : "default";
}

/** Classes por variante e estado (somadas a styles.root). */
export const variantStyles: Record<IconButtonVariant, Record<IconButtonState, string>> = {
  // Sólido: fundo branco + sombra (ex.: filtros no mapa).
  solid: {
    default:
      "rounded-btn-sm bg-surface text-ink-muted shadow-elev-1 ring-1 ring-line hover:bg-surface-sec hover:text-ink",
    active: "rounded-btn-sm bg-primary-soft text-primary ring-2 ring-primary",
  },
  // Ghost: sem chip (ex.: ações da TopAppBar).
  ghost: {
    default: "rounded-pill text-ink-muted hover:bg-surface-sec hover:text-ink",
    active: "rounded-pill bg-primary-soft text-primary",
  },
};
