/* ============================================================
   BottomNav — ESTILO
   Barra de navegação fixa no rodapé (só mobile). Compõe botões
   ícone+rótulo. As variações por estado ficam em ./BottomNav.states.ts.
   ============================================================ */

/** Junta classes ignorando valores falsy (sem dependência externa). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const styles = {
  /** Barra no rodapé do app-shell (irmã no fluxo, não `fixed` — evita bugs de
   *  posição no iOS). Borda no topo + safe-area (home indicator). */
  root: cx(
    "flex items-stretch justify-around",
    "border-t border-line bg-surface pb-safe shadow-elev-2",
  ),
  /** Item — alvo de toque >=56px (acima dos 44px mínimos do iOS). */
  item: cx(
    "flex flex-1 flex-col items-center justify-center gap-1 px-1 py-2",
    "min-h-14 transition-colors",
    "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60",
  ),
  /** Caixa do ícone — SVG a 24px. Herda a cor do estado. */
  icon: "inline-flex items-center justify-center [&>svg]:size-6",
  /** Rótulo curto abaixo do ícone. */
  label: "text-caption leading-none",
} as const;
