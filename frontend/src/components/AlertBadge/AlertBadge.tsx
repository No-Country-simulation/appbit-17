import type { ReactNode } from 'react'
import { cx, styles } from './AlertBadge.styles'
import { statusLabels, statusStyles, type AlertStatus } from './AlertBadge.states'

/* --- Ícones por status (currentColor herda a cor do texto) --- */

function TriangleGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 2 20h20L12 3Z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <path d="M12 17.5h.01" />
    </svg>
  )
}

function CheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  )
}

function InfoGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <path d="M12 7.5h.01" />
    </svg>
  )
}

const statusIcons: Record<AlertStatus, ReactNode> = {
  warning: <TriangleGlyph />,
  critical: <TriangleGlyph />,
  success: <CheckGlyph />,
  info: <InfoGlyph />,
}

export type AlertBadgeProps = {
  /** Status do alerta (define cor, ícone e rótulo padrão). */
  status: AlertStatus
  /** Rótulo customizado (sobrescreve o padrão do status). */
  children?: ReactNode
}

/**
 * Crachá de alerta — pílula com ícone + rótulo, conforme o status:
 *  warning (Aviso) · critical (Crítico) · success (OK) · info (Info)
 */
export function AlertBadge({ status, children }: AlertBadgeProps) {
  return (
    <span className={cx(styles.badge, statusStyles[status])}>
      <span className={styles.icon}>{statusIcons[status]}</span>
      {children ?? statusLabels[status]}
    </span>
  )
}
