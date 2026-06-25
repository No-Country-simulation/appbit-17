/* ============================================================
   AIQueryBar — ESTADOS (variações do print do DS)
     Vazio     -> 'empty'  (fundo cinza-claro)
     Focado    -> focus-within (anel azul) — tratado em AIQueryBar.styles.ts
     Com Valor -> 'filled' (fundo branco + borda sutil)
   ============================================================ */

export type AIQueryState = 'empty' | 'filled'

/** Deriva o estado a partir do valor digitado. */
export function resolveState({ value }: { value: string }): AIQueryState {
  return value.trim().length > 0 ? 'filled' : 'empty'
}

/** Classes do estado base (somadas a styles.root; o foco sobrepõe). */
export const stateStyles: Record<AIQueryState, string> = {
  // Vazio: fundo cinza-claro.
  empty: 'bg-surface-sec',
  // Com valor: fundo branco + borda sutil + leve elevação.
  filled: 'bg-surface ring-1 ring-line shadow-elev-1',
}
