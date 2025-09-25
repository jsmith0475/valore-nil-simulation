from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol


@dataclass
class AgentEvidence:
    agent_name: str
    confidence: float
    rationale: str
    data_points: list[str]


@dataclass
class ConsensusUpdate:
    valuation: float
    confidence: float
    notes: list[str]


class Agent(Protocol):
    name: str

    async def gather(self, context: dict[str, Any]) -> AgentEvidence:
        ...
