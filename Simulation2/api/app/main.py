import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import programs, athletes, scenarios, narratives, metrics, synthetic
from app.services.data_provider import get_behavioral, list_programs, using_synthetic_mode
from app.services.agent_stream import agent_negotiation_stream

app = FastAPI(title="VALORE Simulation API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(programs.router)
app.include_router(athletes.router)
app.include_router(scenarios.router)
app.include_router(narratives.router)
app.include_router(metrics.router)
app.include_router(synthetic.router)


@app.get("/health")
async def health():
    settings = get_settings()
    return {"status": "ok", "openai_configured": bool(settings.openai_api_key)}


@app.websocket("/ws/agents")
async def agents_ws(websocket: WebSocket):
    await websocket.accept()
    program_id = websocket.query_params.get("program_id")
    override_mode = websocket.query_params.get("mode")
    base_valuation = 620000
    parity = 0.98
    if program_id:
        program_lookup = next((p for p in list_programs(override_mode) if p.id == program_id), None)
        if program_lookup:
            base_valuation = int(program_lookup.metrics.nil_baseline * 0.12)
            parity = 0.98 if program_id.endswith("wbb") else 0.96
            if using_synthetic_mode(override_mode):
                snapshot = get_behavioral(program_id, override_mode)
                if snapshot:
                    parity = snapshot.fairness_index
                    base_valuation = int(snapshot.valuation_projection)
    context = {
        "base_valuation": base_valuation,
        "program_id": program_id,
        "parity": parity,
        "mode": override_mode,
    }
    try:
        async for packet in agent_negotiation_stream(context):
            await websocket.send_json(packet)
            await asyncio.sleep(0.02)
    finally:
        await websocket.close()
