/* ============================================================
   useMapData — carrega os dados do mapa ao montar.
   Exemplo de hook de leitura (GET) usando o genérico useApi.
   ============================================================ */

import { getMapData } from "../endpoints";
import { useApi } from "./useApi";

/** @returns { data, loading, error, refetch } com os dados do mapa. */
export function useMapData() {
  return useApi(() => getMapData(), []);
}
