/* ============================================================
   ENDPOINTS — uma função tipada por endpoint da API.
   Aqui fica o "anti-corruption layer": o backend fala PT
   (consulta/idioma/afirmacao/evidencias...) e a gente mapeia
   pro nosso domínio em EN. As páginas usam os hooks (api/hooks).
   ============================================================ */

import type {
  ConfidenceLevel,
  HealthStatus,
  MapData,
  MapPoint,
  QueryRequest,
  QueryResult,
} from "../types";
import { api } from "./client";

/** GET /api/v1/health — checagem de saúde. */
export function getHealth() {
  return api.get<HealthStatus>("/health");
}

/* ---- Formato bruto do backend (wire) — chaves em PT ---- */

/** Schema `Visualizacao` do backend — usado pelo GET /mapa e pelo
 *  `visualizacao` do POST /dados. */
type VisualizacaoDTO = {
  tipo: string;
  dados: { regiao: string; lat: number; lng: number; valor: number }[];
};

type QueryResponseDTO = {
  afirmacao: string;
  evidencias: { dado: string; valor: string; regiao: string; periodo: string; fonte: string }[];
  fontes: { nome: string; url: string | null; tipo: string }[];
  nivel_confianca: string;
  visualizacao: VisualizacaoDTO | null;
};

function toMapPoints(dados: VisualizacaoDTO["dados"]): MapPoint[] {
  return dados.map((d) => ({ region: d.regiao, lat: d.lat, lng: d.lng, value: d.valor }));
}

/** GET /api/v1/mapa — leituras de concentração por zona monitorada. */
export async function getMapData(): Promise<MapData> {
  const dto = await api.get<VisualizacaoDTO>("/mapa");
  return { type: dto.tipo, points: toMapPoints(dto.dados) };
}

const CONFIDENCE: Record<string, ConfidenceLevel> = {
  alta: "high",
  media: "medium",
  baixa: "low",
};

/** Mapeia a resposta do backend (PT) pro nosso QueryResult (EN). */
function toQueryResult(dto: QueryResponseDTO, responseTime: string): QueryResult {
  return {
    claim: dto.afirmacao,
    evidence: dto.evidencias.map((e) => ({
      label: e.dado,
      value: e.valor,
      region: e.regiao,
      period: e.periodo,
      source: e.fonte,
    })),
    sources: dto.fontes.map((f) => ({ name: f.nome, url: f.url, type: f.tipo })),
    confidence: CONFIDENCE[dto.nivel_confianca] ?? "medium",
    visualization: dto.visualizacao
      ? { type: dto.visualizacao.tipo, points: toMapPoints(dto.visualizacao.dados) }
      : null,
    responseTime,
  };
}

/** POST /api/v1/dados — consulta de IA → resultado ("paper"). */
export async function postQuery(payload: QueryRequest): Promise<QueryResult> {
  const startedAt = performance.now();
  const dto = await api.post<QueryResponseDTO>("/dados", {
    consulta: payload.question,
    idioma: payload.language,
  });
  const responseTime = `${((performance.now() - startedAt) / 1000).toFixed(1)}s`;
  return toQueryResult(dto, responseTime);
}
