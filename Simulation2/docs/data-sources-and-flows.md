# Data Sources & Signal Flows

This document traces how real-world NIL telemetry would map into VALORE, and how the simulation currently emulates each feed.

## 1. Intended Production Inputs

| Domain | Examples | Primary Consumers |
|--------|----------|-------------------|
| Social platforms | Instagram/TikTok engagement logs, share graphs, creator analytics | Social Media Analysis Agent, Psychological Profile Agent |
| Ticketing & CRM | Fan cohorts, churn indicators, donor momentum | Psychology, Brand Alignment, Fairness calibration |
| Athletic tracking | Synergy/Second Spectrum, wearable data, lineup efficiencies | Athletic Performance Agent, Coach persona briefs |
| Market intel | Sponsor inquiries, comparable deal databases, macroeconomic indices | Market Intelligence Agent, Athletic Director persona |
| Compliance systems | Disclosure portals, contract reviews, legal audit logs | Risk & Compliance Agent, Ethics Oversight Agent |
| Community networks | Booster chats, alumni Slack/Discord, community events | Psychology, Brand Alignment |

## 2. Synthetic Substitutes

The emulation engine creates statistically coherent substitutes for each signal:

- **Sentiment Series** — 30-day rolling sentiment with volatility knobs tied to program fan reach.
- **Interaction Velocity** — Daily interaction counts with baseline vs. current ratios to highlight surges.
- **Content Similarity & Share Rate** — Approximates messaging alignment and virality across platforms.
- **Retention/Churn** — Monthly retention cohorts and churn shocks mimic donor pipeline risk.
- **Schedule Volatility** — Models stress periods (back-to-back road games, academic crunch) affecting stability.
- **Feed Entries** — Per-athlete social/news/performance/community/compliance snippets with sentiment/impact tags.

Synthetic feeds refresh whenever agent metrics shift, keeping UI traceable to underlying changes.

## 3. Flow Into Calculus

1. **Raw Signals** from Live Feeds and time-series inputs are normalized (0–1).
2. **Agent Metrics** convert feeds into domain-specific features (e.g., engagement authenticity, audit risk).
3. **Behavioral Scores** update Parasocial (EI/IF/CR/LI/TC), Authenticity (C/VA/BC/CS/TS), Fairness, Compliance.
4. **Valuation Outputs** adjust NIL baseline uplift, sponsor velocity, matchup scenarios, and persona narratives.
5. **Audit Trail** — Live Feeds Tab + `/feeds-intelligence` doc highlight why a metric moved.

## 4. Personas & Evidence Consumption

| Persona | Key Questions | Evidence Surfaced |
|---------|---------------|-------------------|
| Athletic Director | How do we sustain donor energy and fairness? | Market/news feeds, fairness deltas, sponsor velocity |
| Coach | Does NIL momentum align with on-court strategy? | Performance feeds, psychology signals, lineup projections |
| Compliance Officer | Are we audit-ready? | Compliance feed, fairness drift, disclosure health |

Narratives (GPT) use the same metrics and highlight key Live Feed entries in context.

## 5. Extending the Data Layer

- Introduce **preset seeds** (Tournament Surge, Compliance Audit, Viral Spike) for scenario-based demoing.
- Add **session logging** to capture feed → metric → valuation transitions for playback and stakeholder review.
- Integrate **synthetic athlete profiles** with skill progression arcs to test longitudinal fairness.

## References

- `Simulation2/ui/components/ExperienceDashboard.tsx`
- `Simulation2/api/app/synthetic/engine.py`
- `Background/Context Brief.md`
- `Background/multi-agentic NIL.md`
