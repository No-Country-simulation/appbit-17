/* ============================================================
   TIPOS DE DOMÍNIO — App BiT (Equipo 17)
   👉 ESQUELETO: ajustar conforme o contrato real
      (docs/contrato-integracao.md). Campos marcados com TODO.
   ============================================================ */

/** GET /health — checagem de saúde da API. */
export type HealthStatus = {
  status: "ok" | "degraded";
  // TODO: versão, uptime, etc.
};

/** Uma região do mapa. */
export type Region = {
  id: string;
  name: string;
  // TODO: coordenadas/geometria + indicador(es)
};

/** GET /mapa — dados para renderizar o mapa. */
export type MapData = {
  regions: Region[];
  // TODO: indicador selecionado, legenda, etc.
};

/** POST /dados — payload da consulta de IA. */
export type QueryRequest = {
  question: string;
  // TODO: filtros (região, período...)
};

/** Mini-paper (ADR-005): afirmação → evidências → fontes → confiança. */
export type Paper = {
  claim: string;
  evidence: string[];
  sources: string[];
  confidence: "high" | "medium" | "low";
  // TODO: alinhar com contrato-integracao.md
};
