from fastapi import APIRouter

from app.schemas.dados import ConsultaRequest, RespostaPaper
from app.services import data_service

router = APIRouter()


@router.post("/dados", response_model=RespostaPaper)
def consultar_dados(body: ConsultaRequest) -> RespostaPaper:
    dados = data_service.buscar(
        regiao=body.filtros.regiao,
        limite=10,
    )

    return RespostaPaper(
        afirmacao=f"Consulta recebida: '{body.consulta}'. Dados em processamento. {dados}",
        nivel_confianca="media",
    )
