/* ============================================================
   TabNav — ESTILO (estrutura fixa, igual em todos os estados)
   Abas superiores · pílula com rótulo. Variações por estado em
   ./TabNav.states.ts.
   ============================================================ */

/** Junta classes ignorando valores falsy (sem dependência externa). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export const styles = {
  /** Container da lista de abas (role=tablist). */
  list: 'inline-flex items-center gap-1',
  /** Cada aba — pílula com Corpo Grande (16px/500). */
  tab: cx(
    'inline-flex items-center justify-center whitespace-nowrap',
    'rounded-pill px-4 py-2 text-body-lg transition-colors',
    'outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
  ),
} as const
