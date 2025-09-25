from fastapi import APIRouter, Query

from app.schemas.program import Program
from app.services.data_provider import list_programs

router = APIRouter(prefix="/programs", tags=["programs"])


@router.get("/", response_model=list[Program])
async def get_programs(mode: str | None = Query(default=None)) -> list[Program]:
    return list_programs(mode)
