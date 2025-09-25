from fastapi import APIRouter, Query

from app.schemas.metrics import ValidationMetrics
from app.services.data_provider import get_metrics

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("/", response_model=ValidationMetrics)
async def read_metrics(mode: str | None = Query(default=None)) -> ValidationMetrics:
    return get_metrics(mode)
