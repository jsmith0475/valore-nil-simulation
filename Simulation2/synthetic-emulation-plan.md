# Synthetic Emulation Implementation Plan

## Objectives
- Stress test parasocial, authenticity, and fairness models across Phase 1 basketball programs using synthetic data.
- Exercise multi-agent negotiation streams with evolving evidence and consensus behavior.
- Allow demo toggles between existing mock data and live synthetic emulation mode.

## Workstreams & Tasks

### 1. Design & Requirements
- [ ] Confirm scope of behavioral metrics to emulate (PSR components, authenticity factors, compliance, market comps).
- [x] Define synthetic data schema aligned with existing backend models (programs, scenarios, metrics, agent packets).
- [x] Establish configuration knobs (seed, intensity, volatility, scenario themes) and documentation expectations.

### 2. Synthetic Data Generator Module
- [x] Scaffold `app/synthetic` module with base generator interfaces and seeding utilities.
- [x] Implement program profiles generator (baseline NIL, community highlights, audience segments).
- [x] Build parasocial score generator (EI, IF, CR, LI, TC) with variability per persona/program.
- [x] Build authenticity trajectory generator (C, VA, BC, CS, TS) including “shock” events.
- [x] Generate market/commercial signals (deal comps, sponsor budgets, macro trend factors).
- [x] Generate compliance and fairness scenarios (audits, parity metrics, risk flags).
- [x] Compose multi-agent evidence packets with evolving timestamps and consensus outcomes.
- [x] Generate raw synthetic signals (sentiment, interactions, retention, share rates) that feed PSR/auth computations.
- [ ] Add reproducible seeding and scenario presets (e.g., “Tournament Surge”, “Compliance Audit”).

### 3. Backend Integration
- [x] Add configuration toggles (env flag, query param, or admin endpoint) to enable synthetic mode.
- [x] Wire REST endpoints (`/programs`, `/scenarios`, `/metrics`) to call synthetic generators when enabled.
- [x] Enhance WebSocket stream to publish synthetic evidence packets on an interval loop.
- [ ] Instrument logging/metrics to validate generator outputs and track run metadata.
- [ ] Provide test fixtures or scripts for snapshot comparisons of synthetic runs.

### 4. Frontend Support
- [x] Introduce UI mode selector (Simulation vs Emulation) with descriptive copy.
- [x] Refresh landing callouts and tooltips to clarify synthetic nature of data.
- [x] Adjust dashboards to react to live updates (e.g., highlight narrative prompts triggered by synthetic events).
- [x] Add Synthetic Data tab exposing behavioral snapshots and scenario summaries.
- [ ] Optional: add user controls for scenario intensity or preset selection.

### 5. Validation & Testing
- [ ] Create automated/unit tests for generator output ranges and schema compliance.
- [ ] Run manual stress tests covering edge cases (extreme parasocial spikes, authenticity dips, compliance violations).
- [ ] Document a checklist for demo rehearsal (seed values, sequences, expected behaviors).

### 6. Documentation & Ops
- [ ] Draft `Synthetic Emulation` section in README/architecture docs explaining design and usage.
- [ ] Provide runbooks for enabling/disabling synthetic mode and seeding reproducible demos.
- [ ] Capture sample outputs and narrative transcripts for stakeholder review.

## Dependencies & Considerations
- Align generator outputs with theoretical frameworks in `Background/multi-agentic NIL.md` and `Background/paper.md`.
- Ensure synthetic datasets remain clearly labeled to avoid confusion with future real data integrations.
- Monitor API costs if synthetic runs trigger GPT narratives at higher frequency.
- Maintain extensibility for additional sports/phases in future iterations.
