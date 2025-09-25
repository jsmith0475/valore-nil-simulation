# VALORE NIL Simulation v2 – Strategy & Architecture Brief

## 1. Purpose & Vision
- Deliver a rich, interactive simulation that embodies the behavioral science and multi-agent intelligence described in the VALORE research (see `Background/multi-agentic NIL.md`, `Background/paper.md`).
- Transition from static HTML to a full-stack system capable of real-time negotiation, scenario building, and GPT-powered narrative for Phase 1 basketball POCs, while readying the platform for football expansion.
- Showcase transparency, bias mitigation, and compliance traceability through dynamic visualizations and explainable agent workflows.

## 2. Experience Goals
- **Immersion**: Provide cinematic, responsive storytelling with dynamic data overlays, 3D/2D animations, and scenario interactivity tailored to athletic directors, coaches, compliance, and athlete perspectives.
- **Interactivity**: Enable users to manipulate roster scenarios, adjust agent weights, explore bias alerts, and trigger “what-if” analyses through real-time UI updates (websockets or streaming APIs).
- **Explainability**: Surface multi-agent dialogue transcripts, consensus rationale, and behavioral metrics with citations to VALORE’s scientific foundations.
- **Scalability**: Architect for future sports verticals and real data ingestion without heavy rework.

## 3. Technical Architecture (Proposed)
### Frontend (Immersive UI)
- **Framework**: React/Next.js or SvelteKit for modular component design, SSR/SSG, and fast iteration.
- **Visualization stack**: Three.js or Babylon.js for 3D scenes; D3/Observable Plot or Deck.gl for behavioral graphs; Framer Motion or GSAP for transitions.
- **State management**: Redux Toolkit/Zustand or Svelte stores to coordinate scenario data, agent states, and websocket updates.
- **UX Considerations**: Role-based dashboards, timeline scrubbing, scenario editors, diff views comparing current vs. alternative agent consensus.

### Backend (Simulation Engine)
- **Framework**: FastAPI (Python) for async APIs, WebSocket support, and Pydantic data models.
- **Services**:
  - `Simulation Controller`: orchestrates scenario inputs/outputs and persists session state.
  - `Agent Orchestrator`: manages agent reasoning flows (psychology, compliance, market, etc.).
  - `Narrative Generator`: calls GPT-5 (or GPT-4.1) to craft contextual storytelling, agent transcripts, and tailored briefings.
  - `Data Layer`: stores program/athlete/metric data in PostgreSQL or SQLite (with SQLAlchemy) and caches GPT results (Redis or SQLite).
- **Inter-service Communication**: Async tasks via Celery/RQ or asyncio; possibility of using Ray for scalable agent execution.

### External Integrations
- **GPT-5 API**: Prompt-engineered using excerpts from the background docs; apply guardrails for deterministic outputs (temperature control, caching).
- **Analytics/Telemetry**: Event logging (e.g., OpenTelemetry) for scenario usage metrics, bias-trigger audit trails, and compliance proof.
- **Future-ready**: Hooks for live data ingestion (social sentiment APIs, compliance feeds) and potential GPU workloads.

## 4. Infrastructure & DevOps
- **Docker**: Multi-stage builds targeting arm64 (Mac M3) with separate images for backend and frontend; optional GPU base image for ML tasks.
- **Docker Compose**: Coordinates services (`api`, `ui`, `redis`, `db`).
- **Environment Management**: `.env` templates for secrets (OpenAI keys, DB credentials); consider using Doppler or 1Password CLI for secure storage.
- **Testing CI**: GitHub Actions or equivalent to run backend pytest suites, frontend lint/test suites, and integration tests (Playwright/Cypress).
- **Deployment**: Local via `docker-compose up`; future options include Fly.io, Render, or AWS ECS/EKS (arm64 nodes) with GPU support as needed.

## 5. Data & Behavioral Modeling
- **Core Datasets**: Phase 1 basketball POCs—program metadata, athlete archetypes, behavioral metrics, compliance rules, revenue models.
- **Behavioral Metrics**: Compute parasocial/identity/authenticity indicators with Python modules; optional ML components (PyTorch, scikit-learn) or precomputed scores.
- **Bias Monitoring**: Integrate fairness metrics (demographic parity, equal opportunity) with live dashboards; trigger alerts in compliance workflows.
- **Agent Negotiation**: Each agent provides evidence + confidence; consensus engine aggregates via weighted negotiation algorithms (e.g., multi-objective optimization, analytic hierarchy process).

## 6. Interaction Scenarios (Initial Scope)
1. **Leadership Prelude**: GPT-guided narrative introducing Tamika, Richard, Sharon, Modus—now with voiceover and interactive overlays.
2. **Program Stellar Map**: 3D constellation of Phase 1 programs with live metrics, timeline playback, and drill-down to athlete dashboards.
3. **Athlete Journey Labs**: Mixed-media panels combining video, sentiment graphs, parasocial gauges, and compliance status; “persona mode” toggles coach/athlete/sponsor views.
4. **Agent Negotiation Theatre**: Real-time display of agent reasoning, GPT-generated transcripts, and bias alert overlays; user-adjustable weighting scenarios.
5. **Matchup War Room**: Game scenario editor with lineup adjustments, fan momentum simulations, and predicted NIL uplift updates in real time.
6. **Value Observatory**: Financial projections, compliance savings, and fairness KPIs with interactive comparisons across programs.

## 7. Security & Ethics
- Ensure GPT outputs undergo validation (content filters) before display.
- Store minimal PII; anonymize athlete data when prototyping.
- Provide transparency controls: ability to export valuation explanations, bias audits, and compliance logs.

## 8. Roadmap Themes
- **Phase A (Foundation)**: Scaffold architecture, mock data pipelines, GPT integration stubs, base UI layouts.
- **Phase B (Interactive Core)**: Implement scenario editor, agent negotiation streams, behavior visualizations.
- **Phase C (Narrative & Analytics)**: Introduce GPT storytelling, bias dashboards, audit exports.
- **Phase D (Performance & Deployment)**: Optimize rendering, load testing, Dockerized distribution, optional cloud deployment.

## 9. Success Criteria
- Stakeholders can manipulate POC scenarios and observe immediate, explainable agent responses.
- GPT-generated narratives reflect the VALORE scientific framework without hallucination or bias regression.
- System runs smoothly via Docker on Mac M3; ready for team demos and iteration.
- Architecture supports easy addition of football programs and real data streams.
## 10. Narrative & Interaction Blueprint
- **Adaptive Narration**: GPT-5-driven scripts that shift tone and detail based on stakeholder persona (e.g., Athletic Director vs. Compliance Officer). Prompt inputs include live agent metrics, behavioral deltas, and compliance status to guarantee grounded outputs.
- **Scene Orchestration**: Each major interaction (Prelude, Stellar Map, Journey Lab, Negotiation Theatre, War Room, Observatory) is represented as a JSON/GraphQL document describing assets, transition logic, and required data feeds. Frontend renders scenes dynamically from these descriptors.
- **Multimedia Layers**: Integrate video snippets, animated sentiment ribbons, and ambient soundscapes. Use signed URLs or local CDN to stream content; prefetch assets based on navigation predictions.
- **User Agency**: Provide timeline scrubbing, draggable scenario nodes, and agent weight sliders. Persist selections in session storage and broadcast updates via WebSockets for collaborative viewing.

## 11. Multi-Agent Orchestration Details
- **Agent Modules**: Each agent exposes methods for `collect_evidence`, `score`, and `explain`. Evidence payloads include source pointers to uphold audit requirements.
- **Consensus Engine**: Implements weighted negotiation (e.g., Bayesian updating or multi-objective optimization) with tunable fairness constraints. Outputs confidence intervals, rationale list, and bias indicators.
- **Streaming Protocol**: Agents emit intermediate thoughts through async generators; frontend displays live reasoning strands to emphasize transparency.
- **Fail-Safe & Guardrails**: If an agent stalls or conflicts exceed thresholds, fall back to consensus fallback rules and surface alerts to compliance observers.

## 12. GPT Prompt & Guardrail Strategy
- **Source Loading**: Embed key excerpts from `Background/multi-agentic NIL.md`, `Background/Context Brief.md`, and `Background/paper.md` in prompt context. Include citations tokens so outputs reference theory names (Parasocial, Social Identity, Authenticity, Compliance).
- **Persona Templates**: Build prompt templates for leadership prelude, agent transcript, stakeholder briefing, risk alert, and demo narration. Store in versioned YAML for easy iteration.
- **Guardrails**: Apply deterministic settings for compliance outputs (temperature ≤ 0.2) and run moderation filters before rendering. Cache GPT responses keyed by scenario hash to ensure reproducibility for demos.

## 13. Data Pipeline & Analytics
- **Data Sources**: Ingest curated NIL datasets, social sentiment feeds (future), and compliance rule updates. Normalize via ETL scripts in `scripts/` folder.
- **Storage**: PostgreSQL for relational data; Redis for session state and GPT cache; object storage (S3-compatible) for media assets.
- **Analytics Layer**: Build dashboards for valuation accuracy, fairness metrics, compliance turnaround time, and scenario usage. Expose metrics via `/metrics` endpoint (Prometheus format) and optional Grafana dashboards.

## 14. Security & Compliance Enhancements
- **Secrets Management**: Load GPT keys and DB credentials via `.env` during local dev; integrate with Secrets Manager (AWS/GCP/Azure) for production.
- **Audit Logging**: Persist every agent recommendation, GPT narrative, and user interaction with timestamps for traceability.
- **PII Handling**: Mask athlete identifiers when exporting or sharing outside trusted stakeholders. Implement role-based access controls in the UI and API.

## 15. Delivery Timeline (Draft)
- **Week 1-2**: Repo scaffold, Docker baseline, FastAPI + React shells, mock data integration.
- **Week 3-4**: Interactive scene prototypes (Stellar Map, Journey Lab), WebSocket negotiation stream, bias monitoring hooks.
- **Week 5-6**: GPT integration, narrative engine, persona-based storytelling, compliance export prototypes.
- **Week 7**: Performance tuning, accessibility audit, automated testing, Dockerized demo package.
- **Week 8**: Stakeholder rehearsal, capture walkthrough video, finalize documentation.
