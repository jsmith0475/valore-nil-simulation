import sys
from pathlib import Path
import asyncio
from typing import AsyncGenerator

sys.path.append(str(Path(__file__).resolve().parents[3]))
from agents import mock_agents  # type: ignore

from app.services.data_provider import using_synthetic_mode
from app.synthetic import agent_event_stream


async def agent_negotiation_stream(context: dict) -> AsyncGenerator[dict, None]:
    mode_override = context.get("mode")
    if using_synthetic_mode(mode_override):
        async for packet in agent_event_stream(context):
            yield packet
        return

    valuation = context.get("base_valuation", 520_000)
    cumulative_confidence = 0.0
    count = 0

    async for evidence in mock_agents.gather_all(context):
        count += 1
        cumulative_confidence += evidence.confidence
        yield {
            "type": "evidence",
            "payload": {
                "agent": evidence.agent_name,
                "confidence": evidence.confidence,
                "rationale": evidence.rationale,
                "data_points": evidence.data_points,
            },
        }
        await asyncio.sleep(0.05)

    avg_confidence = cumulative_confidence / max(count, 1)
    final = valuation * (1 + (avg_confidence - 0.75) * 0.1)
    yield {
        "type": "consensus",
        "payload": {
            "valuation": round(final, 2),
            "confidence": round(avg_confidence, 3),
            "notes": [
                "Consensus formed using mock agent data",
                "Replace with real orchestrator once available",
            ],
        },
    }

    parity = context.get("parity", 0.98)
    if parity < 0.97:
        yield {
            "type": "bias_alert",
            "payload": {
                "message": f"Fairness watch: demographic parity at {(parity * 100):.1f}%. Re-run bias mitigation pipeline.",
                "severity": "warning",
            },
        }
    else:
        yield {
            "type": "insight",
            "payload": {
                "message": f"Fairness check complete: demographic parity {(parity * 100):.1f}% with no action required.",
                "severity": "info",
            },
        }
