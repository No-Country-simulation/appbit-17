from fastapi import APIRouter, Query

from app.schemas.dados import PontoMapa, Visualizacao
from app.services.dados import buscar

router = APIRouter()


@router.get("/mapa", response_model=Visualizacao)
def dados_mapa(regiao: str | None = Query(default=None)):
    registros = buscar(regiao=regiao, limite=100)

    pontos = [
        PontoMapa(
            regiao=r.get("cluster", ""),
            lat=r.get("lat"),
            lng=r.get("lon"),
            valor=r.get("concentracao"),
        )
        for r in registros
    ]
    return Visualizacao(tipo="mapa", dados=pontos)
