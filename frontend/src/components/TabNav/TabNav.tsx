import { cx, styles } from './TabNav.styles'
import { resolveState, stateStyles } from './TabNav.states'

export type TabItem = {
  /** Valor único da aba (usado em value/onChange). */
  value: string
  /** Rótulo exibido (ex.: "Visão Geral"). */
  label: string
  disabled?: boolean
}

export type TabNavProps = {
  items: TabItem[]
  /** Valor da aba ativa. */
  value: string
  onChange?: (value: string) => void
  /** Rótulo acessível do conjunto de abas. */
  'aria-label'?: string
}

/**
 * Abas superiores — pílulas com 3 estados (DS):
 *  - Padrão : texto neutro
 *  - Hover  : fundo cinza-claro (automático)
 *  - Ativo  : pílula azul-clara + texto azul (via `value`)
 */
export function TabNav({ items, value, onChange, 'aria-label': ariaLabel }: TabNavProps) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={styles.list}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange?.(item.value)}
            className={cx(styles.tab, stateStyles[resolveState({ active, disabled: item.disabled })])}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
