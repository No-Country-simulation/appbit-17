/* ============================================================
   AlertBadge — ESTILO (estrutura fixa)
   Crachá de alerta · pílula com ícone + rótulo. As cores por
   status ficam em ./AlertBadge.states.ts.
   ============================================================ */

/** Junta classes ignorando valores falsy (sem dependência externa). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export const styles = {
  /** Pílula — cor (bg/text) vem do status. */
  badge: cx(
    'inline-flex items-center gap-1.5 rounded-pill px-3 py-1',
    'text-label font-semibold uppercase tracking-wide',
  ),
  /** Ícone — herda a cor do texto (currentColor). */
  icon: 'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center',
} as const
