from pydantic import BaseModel
from typing import List


class ProgramMetrics(BaseModel):
    fan_reach: float
    nil_baseline: float
    community_highlights: List[str]


class Program(BaseModel):
    id: str
    name: str
    conference: str
    tier: str
    phase: str
    metrics: ProgramMetrics
