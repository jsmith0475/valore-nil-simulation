from fastapi import APIRouter
from pydantic import BaseModel

from app.services.narrative import generate_story

router = APIRouter(prefix="/narratives", tags=["narratives"])


class NarrativeRequest(BaseModel):
    prompt: str
    context: dict | None = None


@router.post("/story")
async def create_narrative(request: NarrativeRequest):
    return await generate_story(request.prompt, request.context)
