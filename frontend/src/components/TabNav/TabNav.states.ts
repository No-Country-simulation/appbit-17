/* ============================================================
   TabNav — ESTADOS (variações visuais do print do DS)
     Padrão -> 'default'  (+ hover automático via :hover = fundo cinza-claro)
     Hover  -> :hover do estado default
     Ativo  -> 'active'   (pílula azul-clara + texto azul)
   (Desabilitado não está no DS, mas é suportado p/ consistência.)
   ============================================================ */

export type TabNavState = 'default' | 'active' | 'disabled'

/** Deriva o estado visual a partir das props. */
export function resolveState({
  active,
  disabled,
}: {
  active?: boolean
  disabled?: boolean
}): TabNavState {
  if (disabled) return 'disabled'
  if (active) return 'active'
  return 'default'
}

/** Classes aplicadas por estado (somadas a styles.tab). */
export const stateStyles: Record<TabNavState, string> = {
  // Padrão: texto neutro; Hover = fundo cinza-claro.
  default: 'cursor-pointer text-ink hover:bg-surface-sec',
  // Ativo: pílula azul-clara, texto azul.
  active: 'bg-primary-soft text-primary',
  // Desabilitado: esmaecido, sem interação.
  disabled: 'cursor-not-allowed text-ink-muted opacity-50',
}
