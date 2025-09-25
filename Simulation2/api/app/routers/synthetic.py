from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.services.data_provider import using_synthetic_mode
from app.synthetic import overview as synthetic_overview

router = APIRouter(prefix="/synthetic", tags=["synthetic"])


@router.get("/overview")
async def get_synthetic_overview(mode: str | None = Query(default=None)):
    if not using_synthetic_mode(mode):
        raise HTTPException(status_code=400, detail="Synthetic mode is disabled. Enable emulation to access this data.")
    return synthetic_overview()
