import { TrendChip, type TrendChipProps } from "@/components/KpiCard";
import { cx, styles } from "./RegionKpiCard.styles";

export type RegionKpiCardProps = {
  /** Valor em destaque (ex.: "1.247.893"). */
  value: string;
  /** Descrição (ex.: "Total de Residentes Atendidos"). */
  label: string;
  /** Chip de tendência opcional (verde/vermelho). */
  trend?: TrendChipProps;
  className?: string;
};

/**
 * Card KPI compacto para o hover dos bairros no mapa: valor + rótulo +
 * chip de tendência. Presentacional e SEM hooks — pode ser serializado
 * com renderToStaticMarkup e injetado num tooltip do Leaflet.
 */
export function RegionKpiCard({ value, label, trend, className }: RegionKpiCardProps) {
  return (
    <div className={cx(styles.card, className)}>
      <p className={styles.value}>{value}</p>
      <p className={styles.label}>{label}</p>
      {trend && <TrendChip {...trend} />}
    </div>
  );
}
