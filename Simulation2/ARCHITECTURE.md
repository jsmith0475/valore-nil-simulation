# Simulation v2 – High-Level Architecture

```mermaid
graph TD
  subgraph Frontend
    UI["Next.js UI"] -->|REST/WebSocket| API
    UI -->|GPT Narratives| NarrStore["Narrative Cache"]
  end

  subgraph Backend
    API["FastAPI Service"] --> Agents
    API --> DB[(PostgreSQL)]
    API --> Cache[(Redis)]
    API --> GPT
  end

  subgraph Agents
    PsychAgent["Psychology Agent"] --> Orchestrator
    MarketAgent["Market Agent"] --> Orchestrator
    SocialAgent["Social Media Agent"] --> Orchestrator
    ComplianceAgent["Compliance Agent"] --> Orchestrator
    EthicsAgent["Ethics Agent"] --> Orchestrator
    Orchestrator["Consensus Engine"] --> API
  end

  GPT["OpenAI GPT-5"] --> API
  Scripts["ETL / Data Pipelines"] --> DB
```

## Component Notes
- **UI**: Renders immersive scenes, connects via WebSocket for live agent updates, fetches REST endpoints for static data.
- **API**: FastAPI app exposes REST+WebSocket, orchestrates agent tasks, persists data, and manages GPT calls.
- **Agents**: Modular Python packages encapsulating domain logic; orchestrator negotiates consensus and fairness guards.
- **Data Layer**: PostgreSQL for structured NIL data; Redis for session state, GPT cache, and streaming coordination.
- **Integrations**: GPT-5 for narrative generation; ETL scripts for ingesting athlete/program metrics.
```
