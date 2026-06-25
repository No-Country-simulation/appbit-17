import { cx, styles } from './KpiCard.styles'
import { TrendChip, type TrendChipProps } from './TrendChip'

export type KpiCardLargeProps = {
  /** Valor em destaque (ex.: "1.247.893"). */
  value: string
  /** Descrição (ex.: "Total de Residentes Atendidos"). */
  label: string
  /** Chip de tendência opcional (verde/vermelho). */
  trend?: TrendChipProps
}

/** Cartão KPI grande — 320×132. */
export function KpiCardLarge({ value, label, trend }: KpiCardLargeProps) {
  return (
    <div className={cx(styles.cardBase, styles.large)}>
      <p className={styles.valueLarge}>{value}</p>
      <p className={styles.labelLarge}>{label}</p>
      {trend && <TrendChip {...trend} />}
    </div>
  )
}
