from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    # String separada por vírgula, ex: "http://localhost:3000,https://meusite.com"
    # Use "*" para permitir todas as origens
    cors_origins_str: str = "*"

    @property
    def cors_origins(self) -> list[str]:
        if self.cors_origins_str.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins_str.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()
