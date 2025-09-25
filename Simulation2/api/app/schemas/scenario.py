from pydantic import BaseModel
from typing import List


class Scenario(BaseModel):
    id: str
    program_id: str
    opponent: str
    lineup: List[str]
    win_probability: float
    nil_uplift: float
    fan_sentiment: List[float]
