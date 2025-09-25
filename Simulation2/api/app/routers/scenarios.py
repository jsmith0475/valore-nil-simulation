from fastapi import APIRouter, Query

from app.schemas.scenario import Scenario
from app.services.data_provider import list_scenarios

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


@router.get("/", response_model=list[Scenario])
async def get_scenarios(
    program_id: str | None = Query(default=None),
    mode: str | None = Query(default=None),
) -> list[Scenario]:
    return list_scenarios(program_id, mode)
