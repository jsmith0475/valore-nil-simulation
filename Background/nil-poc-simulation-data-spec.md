# VALORE NIL Simulation – Data & Content Schema v0.1

## 1. Data Domains
- **Programs**: metadata for each Phase 1 institution.
- **Athletes**: archetype-driven profiles linked to programs.
- **Behavioral Indicators**: quantitative/qualitative metrics covering parasocial, social identity, authenticity, network effects.
- **Compliance Signals**: rule references, risk flags, audit notes.
- **Agent Evidence**: structured inputs and rationale outputs for each specialized agent.
- **Scenario Insights**: matchup intelligence, win probability deltas, NIL uplift projections.
- **Revenue Streams**: financial assumptions for licensing, subscription, and expansion.

## 2. JSON Skeletons (Conceptual)

### Program Object
```
{
  "id": "auburn_mbb",
  "name": "Auburn Men’s Basketball",
  "conference": "SEC",
  "tier": "Power 5",
  "phase": "POC",
  "fan_reach": {
    "local_index": 0.78,
    "national_index": 0.62,
    "social_followers": 1250000
  },
  "community_highlights": ["Auburn Family Alumni Network", "Regional Sponsor Ecosystem"],
  "initial_nil_baseline": 4200000,
  "narrative_hook": "High-tempo program with surging digital engagement."
}
```

### Athlete Object
```
{
  "id": "guard_playmaker",
  "program_id": "auburn_mbb",
  "name": "Jalen Carter",
  "class_year": "Sophomore",
  "position": "Guard",
  "archetype": "Playmaker",
  "social_handles": {
    "instagram": "@jalencarter",
    "tiktok": "@jcplaymaker"
  },
  "spotlight_moments": [
    {"type": "highlight", "description": "Clutch three vs. rival", "media_ref": "assets/auburn/highlight1.mp4"},
    {"type": "community", "description": "STEM tutoring initiative", "media_ref": "assets/auburn/community1.jpg"}
  ],
  "behavioral_profile_id": "guard_playmaker_behavioral"
}
```

### Behavioral Profile
```
{
  "id": "guard_playmaker_behavioral",
  "parasocial_strength": 0.86,
  "identity_alignment": 0.81,
  "authenticity_signal": 0.88,
  "network_multiplier": 1.27,
  "qualitative_notes": [
    "Hosts weekly livestream Q&A with fans",
    "Shared hometown roots with 40% of local fanbase"
  ],
  "citations": [
    {"theory": "Parasocial Relationship Theory", "reference": "Horton & Wohl (1956)"},
    {"theory": "Social Identity Theory", "reference": "Tajfel & Turner (1979)"}
  ]
}
```

### Compliance Snapshot
```
{
  "id": "auburn_guard_compliance",
  "program_id": "auburn_mbb",
  "athlete_id": "guard_playmaker",
  "risk_level": "Low",
  "rule_updates": [
    {"source": "NCAA", "title": "2024 NIL Disclosure Update", "effective_date": "2024-07-01"}
  ],
  "flagged_items": [],
  "audit_trail": [
    {"timestamp": "2024-09-15T14:32:00Z", "description": "Contract reviewed by compliance"}
  ]
}
```

### Agent Evidence Bundle
```
{
  "valuation_case_id": "auburn_guard_case",
  "agents": [
    {
      "name": "Social Media Agent",
      "confidence": 0.78,
      "key_signals": ["Engagement velocity +18%", "Sentiment polarity 0.74"],
      "recommendation": "+$85K NIL uplift"
    },
    {
      "name": "Psychology Agent",
      "confidence": 0.84,
      "key_signals": ["Parasocial strength 0.86", "Identity overlap 0.81"],
      "recommendation": "+$120K NIL uplift",
      "bias_checks": ["Demographic parity maintained"]
    }
  ],
  "consensus_outcome": {
    "final_value": 620000,
    "explainability": [
      "Community network multiplier added 12%",
      "Compliance risk low; no deductions"
    ]
  }
}
```

### Matchup Scenario
```
{
  "scenario_id": "auburn_vs_rival",
  "program_id": "auburn_mbb",
  "opponent": "Rival University",
  "lineup": ["guard_playmaker", "forward_wing", "center_rim"],
  "win_probability": 0.68,
  "fan_sentiment_wave": [0.62, 0.71, 0.75, 0.80],
  "nil_uplift_projection": 0.14,
  "coach_notes": "Authenticity-driven campaign boosts road-game turnout."
}
```

### Revenue Model Entry
```
{
  "program_id": "auburn_mbb",
  "licensing_fee": 150000,
  "annual_subscription": 120000,
  "adoption_multiplier": 1.15,
  "football_expansion_flag": false,
  "narrative": "Basketball success primes athletic department for cross-sport rollout."
}
```

## 3. Content Assets Inventory
- **Media**: highlight clips, community imagery, agent icons, ambient loops (placeholder refs until assets produced).
- **Copy Blocks**: intros, theory callouts, compliance explanations, CTA language.
- **Data Sources**: public stats, internal scouting reports, sentiment analyses, compliance databases.

## 4. Governance
- Store JSON data under `data/` directory; media under `assets/`.
- Establish version tags aligned with review milestones (Storyboard Review, Content Lock, Pre-Exec Demo).
- Document data provenance for each metric to support audit and updates.

## 5. Next Data Tasks
1. Finalize program list and confirm baseline NIL estimates.
2. Define 3–4 athlete archetypes per program with narrative hooks.
3. Quantify behavioral metrics (even if provisional) with rationale notes.
4. Collate current NCAA/state rules relevant to featured programs.
5. Draft agent rationale templates to ensure consistent explainability.
