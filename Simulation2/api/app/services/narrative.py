from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, Tuple, Iterable

from openai import AsyncOpenAI, APIError

from app.core.config import get_settings


_cache: Dict[Tuple[str, Tuple[Tuple[str, Any], ...]], Dict[str, Any]] = {}
_client: AsyncOpenAI | None = None
_client_lock = asyncio.Lock()
logger = logging.getLogger("uvicorn.error")


async def _get_client(api_key: str, base_url: str | None = None) -> AsyncOpenAI:
    global _client
    if _client is None:
        async with _client_lock:
            if _client is None:
                _client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    return _client


def _cache_key(prompt: str, context: dict[str, Any] | None) -> Tuple[str, Tuple[Tuple[str, Any], ...]]:
    if not context:
        return (prompt, tuple())
    items = tuple(sorted(context.items()))
    return (prompt, items)


async def generate_story(prompt: str, context: dict[str, Any] | None = None) -> dict[str, Any]:
    settings = get_settings()
    key = _cache_key(prompt, context)

    if key in _cache:
        return {**_cache[key], "source": "cache"}

    if not settings.openai_api_key:
        return {
            "narrative": "[Stubbed GPT output] The VALORE council converges on a balanced NIL valuation, highlighting parasocial resonance and compliance readiness.",
            "source": "stub",
        }

    try:
        client = await _get_client(settings.openai_api_key, settings.openai_base_url)
        persona = context.get("persona") if context else None
        system_prompt = (
            "You are VALORE's narrative analyst. Blend NIL valuation results with behavioral science insights, "
            "bias monitoring, and compliance transparency. Keep answers under 120 words."
        )
        user_prompt = prompt
        if persona:
            user_prompt += f"\nPersona: {persona}."
        request_kwargs: dict[str, Any] = {
            "model": settings.openai_model or "gpt-4o-mini",
            "input": [
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": user_prompt,
                },
            ],
            "max_output_tokens": settings.openai_max_output_tokens or 250,
        }

        if settings.openai_reasoning_effort:
            request_kwargs["reasoning"] = {"effort": settings.openai_reasoning_effort}

        if settings.openai_text_verbosity:
            request_kwargs["text"] = {"verbosity": settings.openai_text_verbosity}

        logger.info(
            "Narrative GPT request: model=%s persona=%s payload=%s",
            request_kwargs["model"],
            persona or "",
            {k: v for k, v in request_kwargs.items() if k != "input"},
        )
        logger.info(
            "Narrative GPT input messages=%s",
            request_kwargs["input"],
        )

        response = await client.responses.create(**request_kwargs)
        narrative_text = _extract_text(response)
        payload: dict[str, Any] = {"narrative": narrative_text or "[No narrative returned]", "source": "openai"}

        if not narrative_text:
            payload["warning"] = "openai_response_empty"
            if hasattr(response, "model_dump"):
                raw_payload = response.model_dump()
                payload["raw"] = raw_payload
                logger.warning("Narrative GPT empty response raw=%s", raw_payload)
            else:
                payload["raw"] = response
                logger.warning("Narrative GPT empty response raw=%s", response)
        else:
            logger.info(
                "Narrative GPT response chars=%d text=%s",
                len(narrative_text),
                narrative_text,
            )
        _cache[key] = payload
        return payload
    except (APIError, Exception) as exc:
        logger.exception("Narrative GPT call failed")
        return {
            "narrative": "[Fallback narrative] Unable to contact GPT service; using resilient storyline placeholder.",
            "source": "fallback",
            "error": str(exc),
        }
def _extract_text(response: Any) -> str:
    """Return concatenated text from a Responses API payload."""

    if not response:
        return ""

    raw = response.model_dump() if hasattr(response, "model_dump") else response

    if isinstance(raw, str):
        return raw.strip()

    if not isinstance(raw, dict):
        return str(raw).strip()

    text = raw.get("output_text")
    if text:
        return text.strip()

    output_items: Iterable[Any] = raw.get("output", []) or []
    collected: list[str] = []

    for item in output_items:
        item_type = (item or {}).get("type")
        if item_type != "message":
            continue

        for content in (item or {}).get("content", []) or []:
            content_type = (content or {}).get("type")
            if content_type in {"output_text", "text"}:
                text_value = (content or {}).get("text", "")
                if text_value:
                    collected.append(text_value)
            elif content_type == "refusal":
                refusal_text = (content or {}).get("reason", "")
                if refusal_text:
                    collected.append(f"[Model refusal] {refusal_text}")

    return "".join(collected).strip()
