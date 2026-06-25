import { cx, styles } from './KpiCard.styles'
import { trendStyles, type TrendDirection } from './KpiCard.states'

export type TrendChipProps = {
  /** Texto exibido (ex.: "+12,4%"). */
  value: string
  /** Direção da tendência — define a cor (verde/vermelho). */
  direction?: TrendDirection
}

/** Pílula de tendência: verde (up) ou vermelha (down). */
export function TrendChip({ value, direction = 'up' }: TrendChipProps) {
  return <span className={cx(styles.chip, trendStyles[direction])}>{value}</span>
}
