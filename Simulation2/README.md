# VALORE NIL Simulation v2

An interactive NIL valuation experience that combines a FastAPI backend, multi-agent negotiation stream, GPT‑powered narratives, and a Next.js dashboard. The application runs in two modes:

- **Simulation** – static mock data for quick demos.
- **Emulation** – synthetic raw signals are generated on the fly, then processed to recompute parasocial/authenticity/fairness scores, compliance risk, and scenario outcomes.

The goal is to stress-test behavioral science models (parasocial relationships, authenticity, social identity, fairness) and expose their inputs and outputs for stakeholders before live integrations come online.

## Repository Structure

| Path | Description |
|------|-------------|
| `api/` | FastAPI service, GPT narrative endpoint, REST/WS data feeds, synthetic engine |
| `agents/` | Mock agent definitions used for the negotiation stream |
| `ui/` | Next.js front-end (dashboard, tabs, narrative panel, agent stream) |
| `infra/` | Docker files / compose scaffolding (WIP) |
| `scripts/` | Misc. utility scripts (placeholder) |
| `simulation2-approach.md` | Architecture brief and design context |
| `simulation2-backlog.md` | Task backlog |
| `synthetic-emulation-plan.md` | Plan + progress for the emulation workstream |

## Prerequisites

- Python 3.11/3.12+ with Poetry
- Node.js 18+
- (Optional) Docker if you prefer containerized runs
- OpenAI API key for GPT narratives (`SIM_OPENAI_API_KEY`)

## Environment Variables

Create `Simulation2/.env` (or update the existing one) with at least:

```
SIM_OPENAI_API_KEY=sk-...
SIM_OPENAI_MODEL=gpt-5
SIM_OPENAI_MAX_OUTPUT_TOKENS=1200       # adjust as needed
SIM_OPENAI_REASONING_EFFORT=minimal     # helps avoid reasoning-only responses
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/agents
SIM_DATA_MODE=simulation                # default mode at backend start
SIM_SYNTHETIC_SEED=4242                 # reproducible emulation runs
NEXT_PUBLIC_DATA_MODE=simulation        # initial mode for UI
```

You can switch modes at runtime via the UI toggle or by hitting REST endpoints with `?mode=simulation|emulation`.

## Running Locally

### Backend (FastAPI)

```
cd Simulation2/api
poetry install
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (Next.js)

```
cd Simulation2/ui
npm install
npm run dev
```

The dashboard is served at `http://localhost:3000`. It reads API/WS URLs from `NEXT_PUBLIC_*` variables.

## Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /programs/?mode=` | Program metrics (mock or synthetic) |
| `GET /scenarios/?mode=` | NIL matchup scenarios |
| `GET /metrics/?mode=` | Aggregate validation KPIs |
| `POST /narratives/story` | GPT narrative using `prompt` + optional `context` |
| `WS /ws/agents?program_id=&mode=` | Streaming evidence + consensus packets |
| `GET /synthetic/overview/?mode=emulation` | Exposes synthetic raw inputs, computed scores, and scenario highlights |

## Front-End Tabs

- **Experience** – Core dashboard: persona selector, program focus, GPT narrative, impact metrics, negotiation stream, scenarios, and program constellation.
- **About** – Plain-language overview of NIL, VALORE’s architecture, and why multi-agent behavioral intelligence matters.
- **Data Sources** – Explains required telemetry (sentiment, interactions, retention, compliance) and how emulation mirrors those feeds.
- **Synthetic Data** – Shows the synthetic seed, summarized scores, raw signal averages, component breakdowns, sample windows, and scenario highlights.
- **How to Use** – Step-by-step walkthrough (toggle modes, pick persona, generate narratives, watch the agent stream, inspect metrics/scenarios).
- **Science** – Summaries of parasocial/authenticity models (with formula references) and how the synthetic engine backfills their inputs.

## Synthetic Emulation Overview

When in **Emulation** mode the backend:

1. Generates raw behavioral series (30-day sentiment, interaction counts, share rate, retention cohorts, churn events, schedule volatility).
2. Aggregates them into the PSR components (EI/IF/CR/LI/TC) and authenticity components (C/VA/BC/CS/TS) using the research formulas.
3. Computes fairness index, compliance risk, sponsor velocity, valuation projection, and multi-agent evidence packets.
4. Streams these results to the UI tabs and WebSocket, so every displayed score has traceable underlying signals.

You can change the seed (`SIM_SYNTHETIC_SEED`) to explore alternate stress scenarios. Future enhancements will add named presets (e.g., Tournament Surge, Compliance Audit).

## GPT Narratives

- Provide `SIM_OPENAI_API_KEY` and (optionally) tune `SIM_OPENAI_REASONING_EFFORT` and `SIM_OPENAI_MAX_OUTPUT_TOKENS`.
- The narrative endpoint logs each request/response under the Uvicorn logger. If the model spends all tokens on reasoning, lower the reasoning effort or raise the max output tokens.

## Testing & Validation

- Backend tests (placeholder): `cd Simulation2/api && poetry run pytest`
- Synthetic overview API: `curl http://localhost:8000/synthetic/overview?mode=emulation`
- UI smoke tests: switch modes, generate narratives per persona, verify agent stream packets and Synthetic Data tab contents.

## Troubleshooting

- **Narrative returns `[No narrative returned]`** – Increase `SIM_OPENAI_MAX_OUTPUT_TOKENS` and/or lower `SIM_OPENAI_REASONING_EFFORT` to free tokens for the final answer.
- **Synthetic tab empty** – Ensure mode is `emulation`, backend restarted with the new env vars, and API logs show the `/synthetic/overview` call succeeding.
- **WebSocket stale** – The agent stream resets on persona/program/mode changes; refresh the page or restart backend to clear cached state.

## Roadmap

- Add synthetic scenario presets (e.g., Tournament Surge, Compliance Audit).
- Surface fairness/bias audit logs and compliance playbooks in the UI.
- Expand test coverage for synthetic generators and WebSocket streams.
- Containerize backend/frontend (infra/ docker-compose).

For deeper architectural notes refer to `simulation2-approach.md`, `synthetic-emulation-plan.md`, and the research briefs in `Background/`.
