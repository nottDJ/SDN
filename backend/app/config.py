"""
SDN AI Traffic Management — Application Configuration
Centralized settings loaded from environment variables.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ── Application ──
    APP_NAME: str = "SDN AI Traffic Manager"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # ── Database ──
    POSTGRES_USER: str = "sdn_admin"
    POSTGRES_PASSWORD: str = "sdn_secure_pass_2024"
    POSTGRES_DB: str = "sdn_traffic_db"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def database_url_sync(self) -> str:
        """Synchronous URL for Alembic migrations."""
        return self.database_url.replace("postgresql+asyncpg", "postgresql+psycopg2")

    # ── Security ──
    SECRET_KEY: str = "your-super-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Ryu Controller ──
    RYU_HOST: str = "localhost"
    RYU_PORT: int = 8080
    RYU_API_URL: Optional[str] = None

    @property
    def ryu_api_url(self) -> str:
        if self.RYU_API_URL:
            return self.RYU_API_URL
        return f"http://{self.RYU_HOST}:{self.RYU_PORT}"

    # ── ML ──
    MODEL_SAVE_PATH: str = "./models"
    PREDICTION_INTERVAL: int = 5  # seconds
    CONGESTION_THRESHOLD: float = 0.8

    # ── Simulation ──
    SIMULATION_MODE: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
