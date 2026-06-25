import { useId, type ReactNode } from 'react'
import { cx, styles } from './AIQueryBar.styles'
import { resolveState, stateStyles } from './AIQueryBar.states'

/** Ícone de busca padrão (lupa). `currentColor` herda a cor do tema. */
function SearchGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" />
      <path d="m17 17-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export type AIQueryBarProps = {
  /** Texto do campo (controlado). */
  value: string
  onChange: (value: string) => void
  /** Disparado ao enviar (Enter). */
  onSubmit?: (value: string) => void
  placeholder?: string
  /** Ícone à esquerda (default: lupa). */
  icon?: ReactNode
  /** Rótulo acessível (label invisível). */
  'aria-label'?: string
}

/**
 * Campo de busca da IA — pílula com 3 estados (DS):
 *  - Vazio     : fundo cinza-claro
 *  - Focado    : fundo branco + anel azul (automático via focus-within)
 *  - Com Valor : fundo branco + borda sutil
 *
 * Slot pronto para plugar sugestões (shadcn Command) abaixo no futuro.
 */
export function AIQueryBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Buscar conjuntos de dados, regiões...',
  icon,
  'aria-label': ariaLabel = 'Busca',
}: AIQueryBarProps) {
  const id = useId()

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(value)
      }}
      className={cx(styles.root, stateStyles[resolveState({ value })])}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon ?? <SearchGlyph />}
      </span>
      <label htmlFor={id} className="sr-only">
        {ariaLabel}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
      />
    </form>
  )
}
