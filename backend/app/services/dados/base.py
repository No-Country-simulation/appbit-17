"""Molde comum aos módulos de dados (normalização, filtro e serialização).

Todo conjunto segue o mesmo padrão: carga lazy do CSV (cacheada), coluna oculta
`_busca` (texto normalizado pra filtro por região) e saída em `list[dict]`
JSON-nativa. O que é igual entre eles vive aqui; a regra de cada conjunto vive
no seu módulo (`concentracao.py`, `mobilidade.py`).
"""

import math
import unicodedata
from pathlib import Path

import pandas as pd

DATASET = Path(__file__).resolve().parents[3] / "dataset"


def normalizar(s: str) -> str:
    """minúsculo, sem acento, '_'→' ' — pra casar 'São José' com 'Sao Jose'/'SAO_JOSE_*'."""
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return s.lower().replace("_", " ")


def nativo(v):
    """Converte escalar numpy → Python nativo e NaN → None (serialização segura)."""
    item = v.item() if hasattr(v, "item") else v
    if isinstance(item, float) and math.isnan(item):
        return None
    return item


def filtrar_e_serializar(
    df: pd.DataFrame, regiao: str | None, limite: int, ordenar_por: str | None = None
) -> list[dict]:
    """Final comum dos `buscar*`: filtra por `_busca`, aplica a trava e serializa.

    Com `regiao`, filtra pelo texto normalizado e `limite` é só trava de segurança.
    Sem `regiao`, devolve tudo — ou, se `ordenar_por` for dado, os `limite` maiores
    por essa coluna (caso da mobilidade, onde mandar tudo pesaria no prompt).
    """
    if df.empty:
        return []

    if regiao:
        out = df[df["_busca"].str.contains(normalizar(regiao), regex=False)].head(limite)
    elif ordenar_por:
        out = df.sort_values(ordenar_por, ascending=False).head(limite)
    else:
        out = df

    registros = out.drop(columns=["_busca"]).to_dict("records")
    return [{k: nativo(v) for k, v in r.items()} for r in registros]
