from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central application configuration.
    Values are loaded from environment variables / a .env file.
    See .env.example for the full list of expected variables.
    """

    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.1-flash-lite"

    database_url: str = "sqlite:///./assessment.db"

    questions_seed_path: str = "data/questions_seed.json"

    log_level: str = "INFO"

    # Comma-separated list of origins allowed to call this API, e.g.
    # "http://localhost:5173,https://your-app.vercel.app"
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # Shared secret required in the X-Admin-Key header for /admin/* routes.
    # Leave empty to disable admin access entirely (routes return 503).
    admin_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allowed_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    # Cached so we don't re-parse the environment on every request.
    return Settings()