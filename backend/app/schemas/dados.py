"""Schemas Pydantic = o contrato da API (ver docs/contrato-integracao.md)."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

Idioma = Literal["pt", "es", "en"]


# ---------- Entrada ----------
class Filtros(BaseModel):
    regiao: str | None = None  # município ou cluster; None = todas
    indicador: str | None = None  # concentracao | qualidade_rede | renda | ...


class ConsultaRequest(BaseModel):
    consulta: str
    filtros: Filtros = Field(default_factory=Filtros)
    idioma: Idioma = "pt"  # pt | es | en (validado)

    @field_validator("idioma", mode="before")
    @classmethod
    def _normalizar_idioma(cls, v: object) -> object:
        # "PT", "pt-BR", "pt_BR" → "pt"; fora de pt/es/en → 422 (validação do Literal)
        if isinstance(v, str):
            return v.strip().lower().replace("_", "-").split("-")[0]
        return v


# ---------- Saída (o "mini-paper") ----------
class Evidencia(BaseModel):
    dado: str
    valor: str  # texto (a IA formata números como string)
    regiao: str | None = None
    periodo: str | None = None
    fonte: str


class Fonte(BaseModel):
    nome: str
    url: str | None = None
    tipo: str = "dataset"  # dataset | publica | enriquecida


class PontoMapa(BaseModel):
    regiao: str
    lat: float | None = None
    lng: float | None = None
    valor: float | None = None


class Visualizacao(BaseModel):
    tipo: str = "nenhuma"  # mapa | barra | nenhuma
    dados: list[PontoMapa] = Field(default_factory=list)


class RespostaPaper(BaseModel):
    afirmacao: str
    evidencias: list[Evidencia] = Field(default_factory=list)
    fontes: list[Fonte] = Field(default_factory=list)
    nivel_confianca: str = "media"  # alta | media | baixa
    visualizacao: Visualizacao | None = None
