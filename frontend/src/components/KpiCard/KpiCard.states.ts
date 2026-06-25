/* ============================================================
   KpiCard — ESTADOS (variações de cor do chip de tendência)
     up   -> verde   (success)  — tendência positiva
     down -> vermelho (critical) — tendência negativa
   ============================================================ */

export type TrendDirection = 'up' | 'down'

/** Deriva a direção a partir de um número (>= 0 sobe, < 0 desce). */
export function resolveTrend(delta: number): TrendDirection {
  return delta < 0 ? 'down' : 'up'
}

/** Classes do chip por direção (somadas a styles.chip). */
export const trendStyles: Record<TrendDirection, string> = {
  up: 'bg-success-soft text-success',
  down: 'bg-critical-soft text-critical',
}
