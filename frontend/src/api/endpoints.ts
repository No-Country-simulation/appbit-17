/* ============================================================
   ENDPOINTS — uma função tipada por endpoint da API.
   As páginas NÃO chamam isto direto; usam os hooks (api/hooks).
   ============================================================ */

import type { HealthStatus, MapData, QueryRequest, QueryResult } from "../types";
import { api } from "./client";

/** GET /api/v1/health — checagem de saúde. */
export function getHealth() {
  return api.get<HealthStatus>("/health");
}

/** GET /api/v1/mapa — regiões + indicadores do mapa. */
export function getMapData() {
  return api.get<MapData>("/mapa");
}

/* ---- MOCK temporário do backend (consulta de IA) ----
   Enquanto o endpoint /dados não existe, devolvemos um resultado fixo após
   um delay (simula a análise). TODO: trocar por `api.post<QueryResult>("/dados", payload)`. */
const MOCK_RESULT: QueryResult = {
  claim:
    "As regiões Leste e Sudoeste da Grande Florianópolis concentram 78% das lacunas de cobertura 4G e possuem menos de 12% de acesso a programas de formação tecnológica, segundo dados do Vísent CDRView cruzados com IBGE 2023.",
  evidence: [
    { region: "Leste", coverage4g: "18%", techTraining: "8%", status: "critical" },
    { region: "Sudoeste", coverage4g: "31%", techTraining: "15%", status: "warning" },
    { region: "Centro", coverage4g: "87%", techTraining: "54%", status: "success" },
  ],
  sources: [
    "[1] Vísent CDRView — Cobertura de rede e mobilidade por região, Jun 2026",
    "[2] IBGE Censo 2023 — Indicadores socioeconômicos municipais",
    "[3] Anatel — Mapa de ERBs e cobertura 4G/5G, Mai 2026",
  ],
  responseTime: "4.2s",
  sourceCount: 3,
};

/** POST /api/v1/dados — consulta de IA → resultado ("paper"). */
export function postQuery(_payload: QueryRequest): Promise<QueryResult> {
  // TODO: return api.post<QueryResult>("/dados", _payload);
  return new Promise((resolve) => setTimeout(() => resolve(MOCK_RESULT), 2200));
}
