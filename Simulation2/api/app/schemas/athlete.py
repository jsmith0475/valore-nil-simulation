from pydantic import BaseModel
from typing import List


class BehavioralProfile(BaseModel):
    parasocial_strength: float
    identity_alignment: float
    authenticity_signal: float
    network_multiplier: float
    notes: List[str]


class Athlete(BaseModel):
    id: str
    program_id: str
    name: str
    position: str
    archetype: str
    class_year: str
    behavior: BehavioralProfile
