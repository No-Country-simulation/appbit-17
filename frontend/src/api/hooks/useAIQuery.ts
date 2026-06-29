/* ============================================================
   useAIQuery — envia a pergunta à IA e devolve o resultado ("paper").
   Exemplo de "mutation": NÃO roda ao montar; dispare via submit().
   ============================================================ */

import { useState } from "react";
import type { QueryRequest, QueryResult } from "../../types";
import { postQuery } from "../endpoints";

export function useAIQuery() {
  const [data, setData] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /** Dispara a consulta. Lança o erro também (p/ quem quiser tratar no submit). */
  async function submit(payload: QueryRequest): Promise<QueryResult> {
    setLoading(true);
    setError(null);
    try {
      const result = await postQuery(payload);
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, error, submit };
}
