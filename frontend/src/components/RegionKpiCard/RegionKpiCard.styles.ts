/* ============================================================
   RegionKpiCard — ESTILO (estrutura fixa)
   Card compacto (valor + rótulo + trend) exibido no hover dos
   bairros no mapa. Sem variações de estado → sem .states.ts.
   ============================================================ */

/** Junta classes ignorando valores falsy (sem dependência externa). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const styles = {
  card: "inline-flex w-fit flex-col gap-1 rounded-card bg-surface p-3 shadow-elev-2 ring-1 ring-line/70",
  value: "text-title-2 font-bold text-ink tabular-nums leading-none",
  label: "text-caption text-ink-muted",
} as const;
