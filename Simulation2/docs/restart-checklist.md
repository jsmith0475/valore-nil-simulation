# Daily Restart Checklist

Use this runbook to bring VALORE NIL Simulation v2 back online after a shutdown.

## 1. Refresh Context

- Review open tasks in `simulation2-backlog.md` and `synthetic-emulation-plan.md`.
- Check latest updates in `emulation-alignment-assessment.md` for gaps vs. research briefs.
- Skim `docs/README.md` to recall where knowledge artifacts live.

## 2. Environment Variables

Ensure `.env` at `Simulation2/.env` contains current secrets and settings:

```
SIM_OPENAI_API_KEY=sk-...
SIM_OPENAI_MODEL=gpt-5
SIM_OPENAI_MAX_OUTPUT_TOKENS=1200
SIM_OPENAI_REASONING_EFFORT=minimal
SIM_DATA_MODE=emulation
SIM_SYNTHETIC_SEED=4242
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/agents
NEXT_PUBLIC_DATA_MODE=emulation
```

Load them into your shell (`export $(grep -v '^#' .env | xargs)`) or rely on direnv.

## 3. Start Backend (FastAPI)

```bash
cd Simulation2/api
poetry install              # only needed if dependencies changed
poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify log output:
- `INFO:     Uvicorn running on ...`
- `Narrative GPT request...` when you trigger narratives
- `type": "update"` packets when in emulation mode

If Poetry complains about Python version, run `poetry env use 3.13` (or matching interpreter).

## 4. Start Frontend (Next.js)

```bash
cd Simulation2/ui
npm install   # only on dependency changes
npm run dev
```

Open `http://localhost:3000`. Confirm `NEXT_PUBLIC_*` variables point to the running API.

## 5. Smoke Test

1. Confirm the header displays **Emulation** (toggle is disabled by design).
2. Generate a narrative for at least one persona (Athletic Director, Coach, Compliance).
3. Open **Agent Signals** tab; wait for pulse updates every ~15 s.
4. Check **Live Feeds** tab; use “View Explainer →” link to confirm documentation page loads.
5. Visit **Synthetic Data** tab for raw inputs and scenario highlights.
6. (Optional) Hit `http://localhost:8000/health` and `/synthetic/overview` in a browser or curl.

## 6. Test Suite

```bash
cd Simulation2/api
PYTHONPATH=. poetry run pytest
```

Look for `7 passed` and ensure no new warnings beyond the known Pydantic config deprecation.

## 7. Git & Notes

- Run `git status` to review pending changes.
- Capture progress or blockers in `simulation2-backlog.md` or `synthetic-emulation-plan.md` before ending the day.
- If pushing to remote, update README/Docs links as needed.

## 8. Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| GPT responses empty | Increase `SIM_OPENAI_MAX_OUTPUT_TOKENS`; lower `SIM_OPENAI_REASONING_EFFORT`. |
| Live Feeds static | Ensure backend logs show `type": "update"` packets from the synthetic engine. |
| WebSocket errors after closing tab | Restart backend (handled gracefully in latest build). |
| `.env` not loading | Double-check export command or use `direnv allow`. |

## 9. Shut Down Procedure

- Stop Uvicorn (`CTRL+C`), then Next.js dev server.
- Record any anomalies or TODOs in backlog docs.
- Secure API keys (rotate if necessary).

Following these steps brings the stack back to demo-ready state with minimal friction.
