"""Concentração + qualidade de rede + renda (tensor_concentracao.csv + assinantes.csv).

No 1º acesso, agrega por município/cluster/período, cruza a renda e cacheia em
memória; `buscar()` filtra esse DataFrame. Quando o `scripts/ingest.py` gerar o
Parquet, basta trocar o `_carregar()` por `pd.read_parquet(...)` — o resto não muda.

O CSV é por (antena, dia, período) e um cluster tem várias antenas (mediana 6,
até 13), então a forma de agregar importa — cada regra vive na sua função.
"""

from functools import lru_cache

import pandas as pd

from app.services.dados.base import DATASET, filtrar_e_serializar, normalizar

CONCENTRACAO_CSV = DATASET / "tensor_concentracao.csv"
ASSINANTES_CSV = DATASET / "assinantes.csv"

_ZONA = ["municipio", "cluster", "periodo"]


def _agregar_rede(conc: pd.DataFrame) -> pd.DataFrame:
    """Taxas (congestionamento, drop) por zona: média PONDERADA por n_usuarios.

    Uma antena quase vazia não pode pesar igual a uma lotada. Vetorizado:
    soma(taxa*usuários)/soma(usuários).
    """
    conc = conc.assign(
        _w_cong=conc["congestionamento_medio"] * conc["n_usuarios"],
        _w_drop=conc["drop_pct_medio"] * conc["n_usuarios"],
    )
    rede = conc.groupby(_ZONA, as_index=False).agg(
        _soma_cong=("_w_cong", "sum"),
        _soma_drop=("_w_drop", "sum"),
        _peso=("n_usuarios", "sum"),
        lat=("lat", "first"),
        lon=("lon", "first"),
    )
    peso = rede["_peso"].replace(0, pd.NA)  # evita divisão por zero (zona sem usuários)
    rede["congestionamento"] = rede["_soma_cong"] / peso
    rede["drop_rede"] = rede["_soma_drop"] / peso
    return rede.drop(columns=["_soma_cong", "_soma_drop", "_peso"])


def _agregar_concentracao(conc: pd.DataFrame) -> pd.DataFrame:
    """Concentração = total de usuários da ZONA (soma entre antenas), média entre dias.

    `mean(n_usuarios)` puro diluía o cluster pelo nº de antenas — subestimava zonas densas.
    """
    por_dia = conc.groupby([*_ZONA, "day_date"], as_index=False).agg(usuarios=("n_usuarios", "sum"))
    return por_dia.groupby(_ZONA, as_index=False).agg(concentracao=("usuarios", "mean"))


def _juntar_renda(agregado: pd.DataFrame) -> pd.DataFrame:
    """Cruza a renda por cluster: % de assinantes nas faixas baixas C+D (A>B>C>D).

    NÃO usar mode(): C é maioria em todo cluster → mode='C' constante, coluna inútil.
    O %C+D é um número real, mas ATENÇÃO: neste dataset a renda é quase uniforme
    (spread ~2 p.p. entre zonas, e ruidoso) — não serve pra ranquear "zonas de baixa
    renda". Ver nota no _SYSTEM do ai_service.
    """
    assinantes = pd.read_csv(ASSINANTES_CSV)
    share = assinantes.groupby("home_cluster")["income_cluster"].value_counts(normalize=True)
    renda = (
        share.unstack()
        .reindex(columns=["A", "B", "C", "D"])
        .fillna(0)
        .assign(renda_baixa_pct=lambda d: ((d["C"] + d["D"]) * 100).round(1))[["renda_baixa_pct"]]
        .reset_index()
    )
    # join normalizado: os CSV divergem em acento (ex. SAO_JOSE_ROÇADO vs SAO_JOSE_ROCADO),
    # então casamos pela chave sem acento em vez do nome cru — senão a renda some silenciosamente.
    renda["_chave"] = renda["home_cluster"].map(normalizar)
    agregado = agregado.assign(_chave=agregado["cluster"].map(normalizar))
    agregado = agregado.merge(renda.drop(columns=["home_cluster"]), on="_chave", how="left")
    return agregado.drop(columns=["_chave"])


def _carregar() -> pd.DataFrame:
    """Lê os CSV e devolve o agregado por município/cluster/período (com renda)."""
    conc = pd.read_csv(CONCENTRACAO_CSV, dtype={"ecgi": str})
    agregado = _agregar_rede(conc).merge(_agregar_concentracao(conc), on=_ZONA, how="left")
    agregado = _juntar_renda(agregado)

    # arredonda pra ficar limpo no prompt/IA e no mapa
    agregado["concentracao"] = agregado["concentracao"].round().astype("int64")
    agregado["congestionamento"] = agregado["congestionamento"].round(3)
    agregado["drop_rede"] = agregado["drop_rede"].round(4)

    # coluna oculta de busca (município + cluster, normalizada)
    agregado["_busca"] = (agregado["municipio"] + " " + agregado["cluster"]).map(normalizar)
    return agregado


@lru_cache(maxsize=1)
def _dados() -> pd.DataFrame:
    return _carregar() if CONCENTRACAO_CSV.exists() else pd.DataFrame()


def buscar(regiao: str | None = None, limite: int = 50) -> list[dict]:
    """Linhas agregadas filtradas por município/cluster.

    Sem `regiao` (pergunta geral, ex. "onde há mais congestionamento?"), devolve o
    agregado completo — são ~96 linhas, cabem folgado no prompt, e dão à IA a visão
    total pra responder qualquer ranking sem o data layer ter que adivinhar a métrica.
    Com `regiao`, o filtro já reduz bastante; `limite` é só uma trava de segurança.
    """
    return filtrar_e_serializar(_dados(), regiao, limite)
