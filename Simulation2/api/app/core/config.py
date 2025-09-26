import os

from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]
load_dotenv(BASE_DIR / ".env", override=False)


class Settings(BaseSettings):
    openai_api_key: str | None = None
    database_url: str | None = None
    redis_url: str | None = None
    openai_model: str | None = "gpt-4o-mini"
    openai_base_url: str | None = None
    openai_reasoning_effort: str | None = None
    openai_text_verbosity: str | None = None
    openai_max_output_tokens: int | None = None
    data_mode: str | None = None
    synthetic_seed: int | None = None

    class Config:
        env_prefix = "SIM_"
        case_sensitive = False


def get_settings() -> Settings:
    settings = Settings()
    if not settings.openai_base_url:
        fallback = os.getenv("SIM_OPENAI_BASE_URL") or os.getenv("OPENAI_API_BASE")
        if fallback:
            settings.openai_base_url = fallback
    if settings.openai_max_output_tokens is None:
        fallback_max = os.getenv("SIM_OPENAI_MAX_OUTPUT_TOKENS") or os.getenv("OPENAI_MAX_OUTPUT_TOKENS")
        if fallback_max:
            try:
                settings.openai_max_output_tokens = int(fallback_max)
            except ValueError:
                pass
    if not settings.data_mode:
        settings.data_mode = os.getenv("SIM_DATA_MODE") or os.getenv("DATA_MODE") or "emulation"
    if settings.synthetic_seed is None:
        seed_value = os.getenv("SIM_SYNTHETIC_SEED") or os.getenv("SYNTHETIC_SEED")
        if seed_value:
            try:
                settings.synthetic_seed = int(seed_value)
            except ValueError:
                pass
    return settings
