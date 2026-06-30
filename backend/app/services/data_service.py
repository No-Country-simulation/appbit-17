"""Acesso aos dados (pandas) — loader de CSV com agregação em memória.

No 1º acesso, carrega `tensor_concentracao.csv` (concentração + qualidade de rede) e
`assinantes.csv` (renda), agrega por município/cluster/período e cruza a renda. O
resultado fica cacheado em memória; `buscar()` filtra esse DataFrame.

Interface estável: `buscar(regiao, limite) -> list[dict]`. Quando o `scripts/ingest.py`
gerar o Parquet, basta trocar o `_carregar()` por `pd.read_parquet(...)` — o resto não muda.
"""

import math
import unicodedata
from pathlib import Path

import pandas as pd

DATASET = Path(__file__).resolve().parents[2] / "dataset"
CONCENTRACAO_CSV = DATASET / "tensor_concentracao.csv"
ASSINANTES_CSV = DATASET / "assinantes.csv"

_df: pd.DataFrame | None = None


def _normalizar(s: str) -> str:
    """minúsculo, sem acento, '_'→' ' — pra casar 'São José' com 'Sao Jose'/'SAO_JOSE_*'."""
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return s.lower().replace("_", " ")


def _carregar() -> pd.DataFrame:
    """Lê os CSV e devolve o agregado por município/cluster/período (com renda)."""
    # 1) concentração + qualidade de rede, média dos 15 dias por zona/período
    conc = pd.read_csv(CONCENTRACAO_CSV, dtype={"ecgi": str})
    agregado = conc.groupby(["municipio", "cluster", "periodo"], as_index=False).agg(
        concentracao=("n_usuarios", "mean"),
        congestionamento=("congestionamento_medio", "mean"),
        drop_rede=("drop_pct_medio", "mean"),
        lat=("lat", "first"),
        lon=("lon", "first"),
    )

    # 2) renda predominante por cluster (income_cluster A/B/C/D) — dado real de desigualdade
    assinantes = pd.read_csv(ASSINANTES_CSV)
    renda = (
        assinantes.groupby("home_cluster")["income_cluster"]
        .agg(lambda s: s.mode().iat[0] if not s.mode().empty else None)
        .rename("renda")
        .reset_index()
    )
    agregado = agregado.merge(renda, left_on="cluster", right_on="home_cluster", how="left")
    agregado = agregado.drop(columns=["home_cluster"])

    # 3) arredonda pra ficar limpo no prompt/IA e no mapa
    agregado["concentracao"] = agregado["concentracao"].round().astype("int64")
    agregado["congestionamento"] = agregado["congestionamento"].round(3)
    agregado["drop_rede"] = agregado["drop_rede"].round(4)

    # coluna oculta de busca (município + cluster, normalizada)
    agregado["_busca"] = (agregado["municipio"] + " " + agregado["cluster"]).map(_normalizar)
    return agregado


def _dados() -> pd.DataFrame:
    global _df
    if _df is None:
        _df = _carregar() if CONCENTRACAO_CSV.exists() else pd.DataFrame()
    return _df


def _nativo(v):
    """Converte escalar numpy → Python nativo e NaN → None (serialização segura)."""
    item = v.item() if hasattr(v, "item") else v
    if isinstance(item, float) and math.isnan(item):
        return None
    return item


def buscar(regiao: str | None = None, limite: int = 50) -> list[dict]:
    """Linhas agregadas filtradas por município/cluster.

    Sem `regiao` (pergunta geral, ex. "onde há mais congestionamento?"), devolve o
    agregado completo — são ~96 linhas, cabem folgado no prompt, e dão à IA a visão
    total pra responder qualquer ranking sem o data layer ter que adivinhar a métrica.
    Com `regiao`, o filtro já reduz bastante; `limite` é só uma trava de segurança.
    """
    df = _dados()
    if df.empty:
        return []

    if regiao:
        out = df[df["_busca"].str.contains(_normalizar(regiao), regex=False)].head(limite)
    else:
        out = df

    registros = out.drop(columns=["_busca"]).to_dict("records")
    return [{k: _nativo(v) for k, v in r.items()} for r in registros]
