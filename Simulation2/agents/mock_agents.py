import asyncio
from typing import Any

from .base import AgentEvidence


async def psychology_agent(context: dict[str, Any]) -> AgentEvidence:
    await asyncio.sleep(0.1)
    return AgentEvidence(
        agent_name="Psychology",
        confidence=0.88,
        rationale="Parasocial strength and identity alignment remain high",
        data_points=["parasocial_strength:0.86", "identity_alignment:0.81"],
    )


async def compliance_agent(context: dict[str, Any]) -> AgentEvidence:
    await asyncio.sleep(0.15)
    return AgentEvidence(
        agent_name="Compliance",
        confidence=0.92,
        rationale="No outstanding rule conflicts; disclosures current",
        data_points=["risk_level:low", "last_audit:2024-09-15"],
    )


async def market_agent(context: dict[str, Any]) -> AgentEvidence:
    await asyncio.sleep(0.12)
    return AgentEvidence(
        agent_name="Market",
        confidence=0.81,
        rationale="Regional sponsors expanding budgets ahead of tournament",
        data_points=["sponsor_velocity:+14%", "category_fit:high"],
    )


async def gather_all(context: dict[str, Any]):
    tasks = [
        psychology_agent(context),
        compliance_agent(context),
        market_agent(context),
    ]
    for coro in asyncio.as_completed(tasks):
        yield await coro
