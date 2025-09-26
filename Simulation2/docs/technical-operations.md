# Technical Operations Guide

## 1. Prerequisites & Tooling

- **Python**: >= 3.11 (Poetry manages virtualenv). Install `poetry` via Homebrew or official installer.
- **Node.js**: >= 18 for Next.js 14.
- **OpenAI Access**: Provide `SIM_OPENAI_API_KEY` and optional overrides (`SIM_OPENAI_MODEL`, `SIM_OPENAI_MAX_OUTPUT_TOKENS`, `SIM_OPENAI_REASONING_EFFORT`).
- **Optional**: Docker (future deployment scripts) and direnv/dotenv for auto-loading environment variables.

## 2. Environment Configuration

Create `Simulation2/.env` with:

```
SIM_OPENAI_API_KEY=sk-...
SIM_OPENAI_MODEL=gpt-5
SIM_OPENAI_MAX_OUTPUT_TOKENS=1200
SIM_OPENAI_REASONING_EFFORT=minimal
SIM_DATA_MODE=simulation
SIM_SYNTHETIC_SEED=4242
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/agents
NEXT_PUBLIC_DATA_MODE=simulation
```

Export for shell sessions (`export $(grep -v '^#' .env | xargs)`) or adopt direnv.

## 3. Local Development Workflow

1. **Backend**
   ```bash
   cd Simulation2/api
   poetry install
   poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - `poetry run poe serve` available via `poethepoet`.
   - Logs show route calls, GPT requests, and synthetic update cadence (`Narrative GPT request`, `type": "update"`).

2. **Frontend**
   ```bash
   cd Simulation2/ui
   npm install
   npm run dev
   ```
   - Access dashboard at `http://localhost:3000`.
   - Mode toggle in header switches between Simulation and Emulation.

3. **Testing**
   - Backend: `cd Simulation2/api && PYTHONPATH=. poetry run pytest`.
   - Future: add UI smoke tests (Playwright/Cypress) once routes stabilize.

## 4. Operating Modes

- **Simulation Mode**: Static mock data (fast demos, deterministic).
- **Emulation Mode**: Synthetic engine runs continuous updates (4–7s) affecting programs, athletes, Live Feeds, and agent signals.
- Switch via UI toggle or query parameter (`?mode=emulation`).

## 5. Troubleshooting

| Symptom | Likely Cause | Resolution |
|---------|--------------|------------|
| `poetry run uvicorn` fails with `BaseSettings` import error | Pydantic v2 moved BaseSettings | Installed `pydantic-settings`; ensure `requirements` align (already configured). |
| GPT returns `[No narrative returned]` | Reasoning tokens consumed | Increase `SIM_OPENAI_MAX_OUTPUT_TOKENS`, lower `SIM_OPENAI_REASONING_EFFORT`, monitor logs. |
| `Narrative GPT empty response raw ... max_output_tokens` | Max tokens too low | Update `.env`, restart backend. |
| Frontend cannot hit API | `NEXT_PUBLIC_*` URLs missing | Confirm `.env` exported and Next.js restarted. |
| Live Feeds static | Still in simulation mode | Switch to Emulation; ensure backend logs show `type": "update"` packets. |
| WebSocket disconnect stack trace | Client navigated away mid-send | Uvicorn now guards with `WebSocketState`; restart if persistent. |

## 6. Observability & Logging

- Logs capture agent evidence, updates, GPT transactions, synthetic overview hits.
- For deeper analysis, consider piping Uvicorn logs into structured logging (roadmap item).
- Synthetic overview: `curl http://localhost:8000/synthetic/overview?mode=emulation` to inspect current seed state.

## 7. Deployment Considerations

- Package mode disabled (FastAPI service is application-only). If packaging required, add `packages` to `pyproject.toml`.
- Infra scaffolding (`infra/`) will house Docker Compose to run API + UI + reverse proxy.
- Railway.app target: expose env variables, set `SIM_DATA_MODE=emulation` or provide admin toggle; ensure API key stored as secret.
- For Mac M3 and Apple Silicon: ensure Poetry virtualenv uses arm64 interpreter; `poetry env use 3.13` aligns with Homebrew Python.

## 8. Future Enhancements

- Capture synthetic session logs for replay/audit.
- Expand automated tests around synthetic diff generation and WebSocket lifecycle.
- Integrate persona-specific dashboards (compliance, coach) using Live Feed traceability docs.
- Containerize stack with health probes and secret management (AWS/GCP/Azure or Railway).

## References

- `README.md`
- `Simulation2/ui/app/feeds-intelligence/page.tsx`
- `synthetic-emulation-plan.md`
- `simulation2-backlog.md`
