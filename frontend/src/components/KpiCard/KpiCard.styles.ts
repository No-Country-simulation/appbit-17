/* ============================================================
   KpiCard — ESTILO (estrutura fixa)
   Dois tamanhos: Grande (320×132) e Pequeno (180×80).
   As variações de cor do chip ficam em ./KpiCard.states.ts.
   ============================================================ */

/** Junta classes ignorando valores falsy (sem dependência externa). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export const styles = {
  /** Base comum dos dois cards. */
  cardBase: 'flex flex-col bg-surface rounded-card shadow-elev-3 ring-1 ring-line/70',

  /** Card grande — 320×132 (min, cresce se precisar). */
  large: 'min-h-[132px] w-[320px] gap-2 px-7 py-6',
  valueLarge: 'text-display text-ink tabular-nums leading-none',
  labelLarge: 'text-body-lg text-ink-muted',

  /** Card pequeno — 180×80 (min, cresce se precisar). */
  small: 'min-h-[80px] w-[180px] justify-center gap-1 px-5 py-4',
  valueSmall: 'text-title-2 text-ink tabular-nums leading-none',
  labelSmall: 'text-body text-ink-muted',

  /** Chip de tendência (pílula). A cor vem de KpiCard.states.ts. */
  chip: 'mt-1 inline-flex w-fit items-center rounded-pill px-2 py-0.5 text-label',
} as const
