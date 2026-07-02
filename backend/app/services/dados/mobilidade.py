"""Mobilidade — matriz origem→destino por cluster (tensor_od.csv).

Os fluxos já vêm prontos no CSV (506 pares); aqui só limpamos as colunas pro
prompt/mapa e montamos a coluna de busca. Cache em memória no 1º acesso.
"""

from functools import lru_cache

import pandas as pd

from app.services.dados.base import DATASET, filtrar_e_serializar, normalizar

OD_CSV = DATASET / "tensor_od.csv"


def _carregar() -> pd.DataFrame:
    """Lê o OD por cluster e devolve colunas limpas pro prompt/mapa (sem agregar)."""
    od = pd.read_csv(OD_CSV)
    cols = [
        "cluster_origem",
        "municipio_origem",
        "cluster_destino",
        "municipio_destino",
        "mesmo_cluster",
        "n_usuarios",
        "n_viagens",
        "dist_media_km",
        "periodo_predominante",
        "lat_origem",
        "lon_origem",
        "lat_destino",
        "lon_destino",
    ]
    mob = od[cols].round(
        {"dist_media_km": 2, "lat_origem": 4, "lon_origem": 4, "lat_destino": 4, "lon_destino": 4}
    )
    # coluna oculta de busca: casa origem OU destino (município ou cluster), sem acento
    mob["_busca"] = (
        mob["municipio_origem"]
        + " "
        + mob["cluster_origem"]
        + " "
        + mob["municipio_destino"]
        + " "
        + mob["cluster_destino"]
    ).map(normalizar)
    return mob


@lru_cache(maxsize=1)
def _dados() -> pd.DataFrame:
    return _carregar() if OD_CSV.exists() else pd.DataFrame()


def buscar_mobilidade(regiao: str | None = None, limite: int = 80) -> list[dict]:
    """Fluxos origem→destino por cluster.

    Com `regiao`, devolve todos os fluxos que tocam a zona (origem OU destino). Sem
    `regiao`, devolve os `limite` maiores fluxos por nº de viagens — o OD tem 506 pares
    e mandar tudo em toda pergunta pesaria no prompt; os maiores fluxos são o que
    responde "para onde as pessoas mais vão". Trava de segurança em `limite` quando filtrado.
    """
    return filtrar_e_serializar(_dados(), regiao, limite, ordenar_por="n_viagens")
