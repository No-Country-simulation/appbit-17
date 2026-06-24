"""Schemas Pydantic = o contrato da API (ver docs/contrato-integracao.md)."""
from pydantic import BaseModel, Field


# ---------- Entrada ----------
class Filtros(BaseModel):
    regiao: str | None = None      # município ou cluster; None = todas
    indicador: str | None = None   # concentracao | qualidade_rede | renda | ...


class ConsultaRequest(BaseModel):
    consulta: str
    filtros: Filtros = Field(default_factory=Filtros)
    idioma: str = "pt"             # pt | es | en


# ---------- Saída (o "mini-paper") ----------
class Evidencia(BaseModel):
    dado: str
    valor: str                     # texto (a IA formata números como string)
    regiao: str | None = None
    periodo: str | None = None
    fonte: str


class Fonte(BaseModel):
    nome: str
    url: str | None = None
    tipo: str = "dataset"          # dataset | publica | enriquecida


class Visualizacao(BaseModel):
    tipo: str = "nenhuma"          # mapa | barra | nenhuma
    dados: list[dict] = Field(default_factory=list)


class RespostaPaper(BaseModel):
    afirmacao: str
    evidencias: list[Evidencia] = Field(default_factory=list)
    fontes: list[Fonte] = Field(default_factory=list)
    nivel_confianca: str = "media"  # alta | media | baixa
    visualizacao: Visualizacao | None = None
