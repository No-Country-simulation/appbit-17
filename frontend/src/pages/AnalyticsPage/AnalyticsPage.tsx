import { useTranslation } from "react-i18next";
import { ArrowUpDown, Binoculars, Newspaper, Paperclip } from "lucide-react";
import { AgentSummaryCard } from "@/components/AgentSummaryCard";
import { GroupedBarChartCard } from "@/components/GroupedBarChartCard";
import { LineChartCard } from "@/components/LineChartCard";
import { MetricCard } from "@/components/MetricCard";
import { OpportunityListCard } from "@/components/OpportunityListCard";
import {
  buildAgentSummary,
  buildCoverageMetric,
  buildFederalOpportunities,
  buildRegionIndicators,
  regionTrend,
} from "./mocks";

/**
 * Dashboard de Dados (rota /app/analytics) — grade dos cards do agente,
 * métricas, gráficos e editais. Tudo MOCKADO (ver ./mocks.ts), sem API.
 * Textos via i18n (namespace `analytics`).
 */
export function AnalyticsPage() {
  const { t } = useTranslation("analytics");

  const chartActions = [
    { icon: <Paperclip size={18} />, label: t("lineChart.actions.attach") },
    { icon: <Newspaper size={18} />, label: t("lineChart.actions.report") },
    { icon: <Binoculars size={18} />, label: t("lineChart.actions.inspect") },
    { icon: <ArrowUpDown size={18} />, label: t("lineChart.actions.compare") },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* Fileira 1 — agente (largo) · métrica · gráfico de linha (mesma altura) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.8fr_1fr_1fr]">
          <AgentSummaryCard {...buildAgentSummary(t)} />
          <MetricCard {...buildCoverageMetric(t)} />
          <LineChartCard
            title={t("lineChart.title")}
            subtitle={t("lineChart.subtitle")}
            data={regionTrend}
            actions={chartActions}
          />
        </div>

        {/* Fileira 2 — barras por região (largo) · editais (mesma altura) */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
          <GroupedBarChartCard {...buildRegionIndicators(t)} />
          <OpportunityListCard {...buildFederalOpportunities(t)} />
        </div>
      </div>
    </div>
  );
}
