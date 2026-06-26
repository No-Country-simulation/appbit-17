/* ============================================================
   SideAppBar — ESTILO
   Barra lateral de navegação (rail). Compõe NavItem + Avatar + Logo.
   Sem variações de estado → não tem .states.ts.
   ============================================================ */

/** Junta classes ignorando valores falsy (sem dependência externa). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const styles = {
  /** Card flutuante arredondado (branco + sombra). Separa do fundo branco só pela sombra. */
  root: "inline-flex flex-col items-center gap-2 rounded-panel bg-surface p-3 shadow-elev-3",
  /** Bloco da marca (opcional) — logo branca sobre chip navy (logo só existe em branco). */
  brand: "mb-1 rounded-card bg-navy px-2.5 py-2",
  /** Lista de itens de navegação. */
  nav: "flex flex-col items-center gap-1",
} as const;
