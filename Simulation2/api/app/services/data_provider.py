from __future__ import annotations

from typing import List, Optional

from app.schemas.metrics import ValidationMetrics
from app.schemas.program import Program
from app.schemas.scenario import Scenario
from app.services import mock_data
from app.synthetic import get_behavioral_snapshot, get_metrics as synthetic_metrics
from app.synthetic import list_athletes as synthetic_athletes
from app.synthetic import list_programs as synthetic_programs
from app.synthetic import list_scenarios as synthetic_scenarios
from app.synthetic import is_enabled


def using_synthetic_mode(mode_override: Optional[str] = None) -> bool:
    if mode_override:
        return mode_override.lower() in {"emulation", "synthetic"}
    return is_enabled()


def list_programs(mode_override: Optional[str] = None) -> List[Program]:
    if using_synthetic_mode(mode_override):
        return synthetic_programs()
    return mock_data.list_programs()


def list_scenarios(program_id: Optional[str] = None, mode_override: Optional[str] = None) -> List[Scenario]:
    if using_synthetic_mode(mode_override):
        return synthetic_scenarios(program_id)
    return mock_data.list_scenarios(program_id)


def get_metrics(mode_override: Optional[str] = None) -> ValidationMetrics:
    if using_synthetic_mode(mode_override):
        return synthetic_metrics()
    return mock_data.get_metrics()


def get_behavioral(program_id: str, mode_override: Optional[str] = None):
    if using_synthetic_mode(mode_override):
        return get_behavioral_snapshot(program_id)
    return None


def list_athletes(program_id: Optional[str] = None, mode_override: Optional[str] = None):
    if using_synthetic_mode(mode_override):
        return synthetic_athletes(program_id)
    return mock_data.list_athletes(program_id)
