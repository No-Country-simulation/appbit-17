/* ============================================================
   AIQueryBar — ESTILO (estrutura fixa)
   Campo de busca da IA · pílula com ícone à esquerda + input.
   O FOCO (anel azul) é tratado aqui via focus-within (pseudo-estado CSS).
   As variações vazio/com-valor ficam em ./AIQueryBar.states.ts.
   ============================================================ */

/** Junta classes ignorando valores falsy (sem dependência externa). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

export const styles = {
  /** Pílula. Focado = fundo branco + anel azul (focus-within sobrepõe o estado base). */
  root: cx(
    'flex h-14 w-full items-center gap-3 rounded-pill px-5',
    'transition-colors',
    'focus-within:bg-surface focus-within:ring-2 focus-within:ring-primary',
  ),
  /** Ícone à esquerda — herda a cor (text-ink-muted). */
  icon: 'inline-flex h-7 w-7 shrink-0 items-center justify-center text-ink-muted',
  /** Input transparente (o fundo/anel é da pílula). */
  input: cx(
    'min-w-0 flex-1 bg-transparent outline-none',
    'text-body-lg font-normal text-ink placeholder:text-ink-muted',
  ),
} as const
