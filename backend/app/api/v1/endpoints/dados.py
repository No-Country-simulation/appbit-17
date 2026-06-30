from fastapi import APIRouter

from app.api.deps import get_ai_service
from app.schemas.dados import ConsultaRequest, RespostaPaper
from app.services import data_service

router = APIRouter()


@router.post("/dados", response_model=RespostaPaper)
def consultar_dados(body: ConsultaRequest) -> RespostaPaper:
    dados = data_service.buscar(regiao=body.filtros.regiao)

    ai_service = get_ai_service()
    return ai_service.responder(
        consulta=body.consulta,
        dados=dados,
        idioma=body.idioma,
    )
