/* ============================================================
   TextField — ESTILO
   Rótulo + input em pílula. Foco (anel azul) via :focus.
   Sem variantes de estado → não tem .states.ts.
   ============================================================ */

/** Junta classes ignorando valores falsy (sem dependência externa). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const styles = {
  field: "space-y-1.5",
  label: "block text-label text-ink",
  input: cx(
    "h-12 w-full rounded-pill bg-surface-sec px-5",
    "text-body text-ink placeholder:text-ink-muted",
    "outline-none transition-colors",
    "focus:bg-surface focus:ring-2 focus:ring-primary",
    "disabled:opacity-50",
  ),
} as const;
