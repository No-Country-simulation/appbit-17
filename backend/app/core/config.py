from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuração lida de variáveis de ambiente / arquivo .env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ai_api_key: str = ""  # chave do Gemini (plugar pra ativar a IA)
    ai_model: str = "gemini-3.5-flash"
    frontend_origin: str = "http://localhost:5173"
    port: int = 8000


settings = Settings()
