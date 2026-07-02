/* ============================================================
   Coverage — camada "Cobertura de Rede" (tema `network` do filtro).
   Fonte: GET /mapa (via api/useMapData). O payload traz ~4 leituras
   por zona monitorada do Vísent (períodos do dia, SEM rótulo de
   período) com a coordenada da antena que representou a agregação.
   Aqui a página SELECIONA: 1 pin por zona (coordenada mais frequente
   + pico entre as leituras) — mesmo padrão do regionKpis (a api/
   normaliza PT→EN; agregação/adaptação moram na página).
   As zonas são da GRANDE Floripa (São José, Palhoça, Biguaçu...) e
   não cobrem todos os bairros — a ausência de pin é informação
   ("sem cobertura de monitoramento").
   ============================================================ */

import type { MapPoint } from "@/types";

/** Uma zona monitorada (1 pin no mapa). */
export type CoverageZone = {
  /** Chave crua da zona no dataset (ex.: "SAO_JOSE_KOBRASOL"). */
  region: string;
  /** Nome apresentável (ex.: "Sao Jose Kobrasol"). */
  label: string;
  lat: number;
  lng: number;
  /** Maior leitura de usuários entre os períodos da zona. */
  peak: number;
};

/** Siglas do dataset que ficam em caixa alta no rótulo. */
const ACRONYMS = new Set(["CBD", "HLZ", "UFSC", "BR101", "SC401"]);

/** "SAO_JOSE_KOBRASOL" → "Sao Jose Kobrasol" (siglas preservadas). */
export function zoneLabel(region: string): string {
  return region
    .split("_")
    .map((word) => (ACRONYMS.has(word) ? word : word.charAt(0) + word.slice(1).toLowerCase()))
    .join(" ");
}

/**
 * Agrega as leituras por zona: coordenada = a mais frequente entre as
 * linhas (a antena que mais representa a zona; o payload pode variar a
 * coordenada entre períodos) · valor = pico entre as leituras.
 */
export function toCoverageZones(points: MapPoint[]): CoverageZone[] {
  const byRegion = new Map<string, MapPoint[]>();
  for (const point of points) {
    const list = byRegion.get(point.region) ?? [];
    list.push(point);
    byRegion.set(point.region, list);
  }

  return [...byRegion.entries()].map(([region, list]) => {
    const freq = new Map<string, { point: MapPoint; count: number }>();
    for (const point of list) {
      const key = `${point.lat},${point.lng}`;
      const entry = freq.get(key) ?? { point, count: 0 };
      entry.count += 1;
      freq.set(key, entry);
    }
    const anchor = [...freq.values()].sort((a, b) => b.count - a.count)[0].point;

    return {
      region,
      label: zoneLabel(region),
      lat: anchor.lat,
      lng: anchor.lng,
      peak: Math.max(...list.map((point) => point.value)),
    };
  });
}
