/* ============================================================
   IconButton — ESTILO (estrutura fixa, igual em todos os estados)
   Botão de ícone · 40×40. Variações por estado em
   ./IconButton.states.ts.
   ============================================================ */

/** Junta classes ignorando valores falsy (sem dependência externa). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export const styles = {
  /** Container 40×40 — ícone centralizado. Cor/raio vêm da variante+estado. */
  root: cx(
    'inline-flex h-10 w-10 items-center justify-center transition-colors',
    'outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
  ),
} as const
