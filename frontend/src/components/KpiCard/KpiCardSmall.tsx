import { cx, styles } from './KpiCard.styles'
import { TrendChip, type TrendChipProps } from './TrendChip'

export type KpiCardSmallProps = {
  /** Valor em destaque (ex.: "48,2%"). */
  value: string
  /** Descrição (ex.: "Taxa de Emprego"). */
  label: string
  /** Chip de tendência opcional (verde/vermelho). */
  trend?: TrendChipProps
}

/** Cartão KPI pequeno — 180×80. */
export function KpiCardSmall({ value, label, trend }: KpiCardSmallProps) {
  return (
    <div className={cx(styles.cardBase, styles.small)}>
      <p className={styles.valueSmall}>{value}</p>
      <p className={styles.labelSmall}>{label}</p>
      {trend && <TrendChip {...trend} />}
    </div>
  )
}
