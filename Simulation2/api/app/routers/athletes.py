from fastapi import APIRouter, Query

from app.schemas.athlete import Athlete
from app.services.data_provider import list_athletes

router = APIRouter(prefix="/athletes", tags=["athletes"])


@router.get("/", response_model=list[Athlete])
async def get_athletes(program_id: str | None = Query(None)) -> list[Athlete]:
    return list_athletes(program_id)
