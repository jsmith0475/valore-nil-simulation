from __future__ import annotations

import asyncio
import time
from dataclasses import asdict
from functools import lru_cache
from typing import AsyncGenerator, List, Optional, Dict, Any

from app.core.config import get_settings
from app.schemas.metrics import ValidationMetrics
from app.schemas.program import Program
from app.schemas.scenario import Scenario

from .engine import BehavioralSnapshot, SyntheticEngine


def is_enabled() -> bool:
    mode = (get_settings().data_mode or "").lower()
    return mode in {"emulation", "synthetic"}


@lru_cache(maxsize=4)
def _engine_cached(seed_key: int) -> SyntheticEngine:
    seed = None if seed_key == 0 else seed_key
    return SyntheticEngine(seed=seed)


def get_engine() -> SyntheticEngine:
    settings = get_settings()
    seed_key = settings.synthetic_seed or 0
    return _engine_cached(seed_key)


def list_programs() -> List[Program]:
    engine = get_engine()
    return [p.model_copy(deep=True) for p in engine.programs()]


def list_scenarios(program_id: Optional[str] = None) -> List[Scenario]:
    engine = get_engine()
    scenarios = engine.scenarios(program_id)
    return [s.model_copy(deep=True) for s in scenarios]


def get_metrics() -> ValidationMetrics:
    engine = get_engine()
    return engine.metrics().model_copy(deep=True)


def get_behavioral_snapshot(program_id: str) -> Optional[BehavioralSnapshot]:
    engine = get_engine()
    snapshot = engine.behavioral_snapshot(program_id)
    return snapshot


def overview() -> Dict[str, Any]:
    engine = get_engine()
    programs = engine.programs()
    scenarios = engine.scenarios()
    snapshots = {p.id: engine.behavioral_snapshot(p.id) for p in programs}
    scenario_by_program: Dict[str, List[Dict[str, Any]]] = {}
    for scenario in scenarios:
        scenario_by_program.setdefault(scenario.program_id, []).append(
            {
                "id": scenario.id,
                "opponent": scenario.opponent,
                "win_probability": scenario.win_probability,
                "nil_uplift": scenario.nil_uplift,
                "lineup": scenario.lineup,
                "fan_sentiment": scenario.fan_sentiment,
            }
        )

    program_summaries = []
    for program in programs:
        snapshot = snapshots.get(program.id)
        if snapshot:
            scores = {
                "psr_score": snapshot.psr_score,
                "authenticity_score": snapshot.authenticity_score,
                "social_identity_index": snapshot.social_identity_index,
                "fairness_index": snapshot.fairness_index,
                "compliance_risk": snapshot.compliance_risk,
                "valuation_projection": snapshot.valuation_projection,
                "sponsor_velocity": snapshot.sponsor_velocity,
            }
            components = {
                "psr": snapshot.psr_components,
                "authenticity": snapshot.authenticity_components,
            }
            raw_samples = {
                "sentiment_daily": snapshot.raw_series.sentiment_daily[:7],
                "interactions_daily": snapshot.raw_series.interactions_daily[:7],
                "share_rate_daily": snapshot.raw_series.share_rate_daily[:7],
                "retention_monthly": snapshot.raw_series.retention_monthly,
                "churn_events": snapshot.raw_series.churn_events,
            }
            raw_inputs = asdict(snapshot.raw_inputs)
        else:
            scores = None
            components = None
            raw_inputs = None
            raw_samples = None

        program_summaries.append(
            {
                "program": program.model_dump(),
                "scores": scores,
                "components": components,
                "raw_inputs": raw_inputs,
                "raw_samples": raw_samples,
                "scenarios": scenario_by_program.get(program.id, [])[:3],
            }
        )

    return {
        "seed": engine.seed,
        "generated_at": int(time.time()),
        "programs": program_summaries,
        "metrics": engine.metrics().model_dump(),
    }


async def agent_event_stream(context: dict) -> AsyncGenerator[dict, None]:
    engine = get_engine()
    program_id = context.get("program_id") or context.get("programId")
    if not program_id:
        programs = engine.programs()
        program_id = programs[0].id if programs else ""

    timeline = engine.agent_timeline(program_id, base_valuation=context.get("base_valuation"))
    for event in timeline:
        delay = float(event.pop("delay", 0.05))
        await asyncio.sleep(delay)
        yield event


__all__ = [
    "BehavioralSnapshot",
    "SyntheticEngine",
    "agent_event_stream",
    "get_behavioral_snapshot",
    "get_engine",
    "get_metrics",
    "is_enabled",
    "overview",
    "list_programs",
    "list_scenarios",
]
