# System Architecture Overview

VALORE NIL Simulation v2 blends synthetic intelligence, REST/WS services, and a Next.js dashboard to emulate multi-agent NIL decisioning.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Background Research & Behavioral Formulas                               │
│  • Context Brief, Multi-agentic NIL Paper, Sharon POC application       │
└──────────────┬───────────────────────────────┬──────────────────────────┘
               │                               │
               ▼                               ▼
        Synthetic Engine                Agents Orchestrator
        (Python, Pydantic,             (async generator emitting
         deterministic seed)            evidence & consensus)
               │                               │
               └────────────┬──────────────────┘
                            ▼
                     FastAPI Service
           REST: /programs, /scenarios, /metrics,
                 /synthetic/overview, /athletes
           POST: /narratives/story (OpenAI GPT-5)
           WS:   /ws/agents (evidence + live updates)
                            │
                            ▼
                      Next.js Dashboard
           Tabs: Experience, Agent Signals, Live Feeds,
                 Synthetic Data, Science, Data Sources, etc.
```

## 1. Synthetic Engine (api/app/synthetic/engine.py)

- Seeds random state (`SIM_SYNTHETIC_SEED`) to generate reproducible behavioral series.
- Produces program-level `BehavioralSnapshot` objects and athlete-level `AthleteSnapshot` objects with PSR/authenticity/fairness components.
- Advances state every 4–7 seconds in emulation mode via `advance_program`, emitting diffs plus updated Live Feed entries per athlete.
- Maintains agent metric dictionaries keyed by the seven specialized agent domains.

## 2. FastAPI Layer (api/app)

- **Routers**: `programs`, `scenarios`, `metrics`, `athletes`, `synthetic`, `narratives`.
- **Narratives**: `app/services/openai_client.py` reads `.env` (`SIM_OPENAI_API_KEY`, `SIM_OPENAI_MODEL`, `SIM_OPENAI_MAX_OUTPUT_TOKENS`, `SIM_OPENAI_REASONING_EFFORT`) and safeguards around reasoning-only responses.
- **WebSocket**: `/ws/agents` streams initial evidence timeline then perpetual updates; handles graceful disconnect via `WebSocketState` checks.
- **Data Provider**: Decides between static mock data vs. synthetic engine based on `SIM_DATA_MODE` or query overrides.

## 3. Agent Stream

- Falls back to mock agent scripts when in simulation (static) mode.
- In emulation mode, leverages synthetic engine to broadcast:
  - `type: evidence` packets from each agent.
  - `type: update` packets with program + athlete snapshots.
  - Bias alerts when fairness thresholds are crossed.

## 4. Front-End (ui/)

- **ExperienceDashboard** orchestrates persona selection, program focus, metrics, narrative panel, and tabbed content.
- **Agent Signals Tab** visualizes agent metric deltas, with pulse indicators for both agent card and athlete card.
- **Live Feeds Tab** groups synthetic social/news/performance/community/compliance stories; source badges link to `/feeds-intelligence`.
- **Synthetic Data Tab** exposes raw inputs, component breakdowns, sample windows, and scenario highlights.
- Environment variables: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_WS_URL`,`NEXT_PUBLIC_DATA_MODE`.

## 5. GPT Integration

- Utilizes `openai` SDK v1.109; requests include persona-specific prompts and verbosity constraints.
- Logs request/response metadata (`Narrative GPT request`/`WARNING: Narrative GPT empty response`) for troubleshooting.
- `.env` values bubbled into Poetry via `python-dotenv` load during settings initialization.

## 6. Persistence & Config

- `.env` at `Simulation2/.env` feeds both backend and frontend (via Next.js runtime env).
- `poetry.lock` anchors dependencies for FastAPI stack; `npm package-lock` for UI.
- Infrastructure scaffolding (`infra/`) includes Docker placeholders for future deployment.

## 7. Primary Data Artefacts

- Program definitions: `app/services/mock_data.py` (Phase 1 roster).
- Athlete archetypes and behaviors: same module supplies baseline behavior coefficients.
- Synthetic feed items: generated and updated inside the engine, enabling traceability between metrics and narrative evidence.

## 8. Observability Hooks

- Logging: Uvicorn logs REST/WS requests, GPT calls, and synthetic engine updates.
- Tests: `PYTHONPATH=. poetry run pytest` covers program endpoints and synthetic paths.
- Future enhancement: capture session logs for replay (see README roadmap).

## References

- `README.md`
- `simulation2-approach.md`
- `synthetic-emulation-plan.md`
- `emulation-alignment-assessment.md`
- `Background/multi-agentic NIL.md`
