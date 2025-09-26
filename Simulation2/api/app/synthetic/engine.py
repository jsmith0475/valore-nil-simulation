from __future__ import annotations

import copy
import random
import time
import statistics
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Optional, Tuple

from app.schemas.athlete import Athlete
from app.schemas.metrics import ValidationMetrics
from app.schemas.program import Program, ProgramMetrics
from app.schemas.scenario import Scenario
from app.services import mock_data


def _clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(maximum, value))


def _round_dollars(value: float) -> float:
    return round(value / 10_000) * 10_000


@dataclass
class BehavioralRawInputs:
    sentiment_mean: float
    sentiment_volatility: float
    interactions_weekly: float
    interactions_baseline: float
    content_similarity: float
    share_rate: float
    retention_rate: float
    churn_shock: float
    stability_index: float
    schedule_volatility: float


@dataclass
class BehavioralRawSeries:
    sentiment_daily: List[float]
    interactions_daily: List[int]
    content_similarity_daily: List[float]
    share_rate_daily: List[float]
    retention_monthly: List[float]
    churn_events: List[float]
    schedule_volatility_daily: List[float]


@dataclass
class BehavioralSnapshot:
    program_id: str
    psr_components: Dict[str, float]
    authenticity_components: Dict[str, float]
    psr_score: float
    authenticity_score: float
    social_identity_index: float
    fairness_index: float
    compliance_risk: float
    valuation_projection: float
    sponsor_velocity: float
    raw_inputs: BehavioralRawInputs
    raw_series: BehavioralRawSeries


@dataclass
class AthleteSnapshot:
    athlete_id: str
    program_id: str
    name: str
    position: str
    archetype: str
    psr_components: Dict[str, float]
    authenticity_components: Dict[str, float]
    psr_score: float
    authenticity_score: float
    fairness_index: float
    compliance_risk: float
    valuation_projection: float
    engagement_velocity: float
    agent_metrics: Dict[str, Dict[str, float]]
    feed_items: List[Dict[str, Any]]
    raw_inputs: BehavioralRawInputs
    raw_series: BehavioralRawSeries


# Agent scopes and their headline metric keys used across visualization layers.
AGENT_METRIC_DEFINITIONS: Dict[str, Dict[str, List[str] | str]] = {
    "social_media": {
        "display_name": "Social Media Analysis Agent",
        "primary_metric": "engagement_authenticity",
        "metrics": [
            "engagement_authenticity",
            "sentiment_intensity",
            "virality_potential",
            "platform_fit",
            "authenticity_detection",
        ],
    },
    "athletic_performance": {
        "display_name": "Athletic Performance Agent",
        "primary_metric": "stat_efficiency",
        "metrics": [
            "stat_efficiency",
            "context_adjustment",
            "injury_risk",
            "pro_projection",
            "leadership_signal",
        ],
    },
    "market_intelligence": {
        "display_name": "Market Intelligence Agent",
        "primary_metric": "comp_deal_alignment",
        "metrics": [
            "comp_deal_alignment",
            "market_timing",
            "brand_demand",
            "economic_context",
            "competitive_position",
        ],
    },
    "brand_alignment": {
        "display_name": "Brand Alignment Agent",
        "primary_metric": "values_match",
        "metrics": [
            "values_match",
            "story_resonance",
            "activation_readiness",
        ],
    },
    "psychology": {
        "display_name": "Psychological Profile Agent",
        "primary_metric": "fan_identity_tie",
        "metrics": [
            "fan_identity_tie",
            "influence_score",
            "trust_velocity",
        ],
    },
    "risk_compliance": {
        "display_name": "Risk & Compliance Agent",
        "primary_metric": "regulatory_score",
        "metrics": [
            "regulatory_score",
            "disclosure_health",
            "audit_risk",
        ],
    },
    "ethics": {
        "display_name": "Ethics Oversight Agent",
        "primary_metric": "ethics_confidence",
        "metrics": [
            "bias_index",
            "fairness_drift",
            "ethics_confidence",
        ],
    },
}

SOCIAL_PLATFORMS = [
    "TikTok",
    "Instagram",
    "YouTube Shorts",
    "Twitter/X",
    "Twitch",
]

NEWS_OUTLETS = [
    "ESPN Insider",
    "The Athletic",
    "CampusHQ",
    "Sports Business Journal",
    "College Hoops Report",
]

PERFORMANCE_TRACKERS = [
    "Synergy Analytics",
    "Second Spectrum",
    "HustleBoard",
    "CourtVision AI",
]


class SyntheticEngine:
    """Generates reproducible synthetic data for NIL emulation."""

    def __init__(self, seed: Optional[int] = None) -> None:
        self.seed = seed or int(time.time())
        self.random = random.Random(self.seed)
        self._programs = self._generate_programs()
        self._scenarios = self._generate_scenarios()
        self._metrics = self._generate_metrics()
        self._behavioral_map = self._generate_behavioral_snapshots(self._programs)
        self._athletes = self._generate_athletes()
        self._athlete_index = {athlete.id: athlete for athlete in self._athletes}
        self._athletes_by_program: Dict[str, List[str]] = {}
        for athlete in self._athletes:
            self._athletes_by_program.setdefault(athlete.program_id, []).append(athlete.id)
        self._athlete_baselines: Dict[str, float] = {}
        self._athlete_feeds: Dict[str, List[Dict[str, Any]]] = {}
        self._athlete_snapshots = self._generate_athlete_snapshots()

    # ---------------------------------------------------------------------
    # Public accessors
    # ------------------------------------------------------------------
    def programs(self) -> List[Program]:
        return self._programs

    def scenarios(self, program_id: Optional[str] = None) -> List[Scenario]:
        if program_id:
            return [s for s in self._scenarios if s.program_id == program_id]
        return self._scenarios

    def metrics(self) -> ValidationMetrics:
        return self._metrics

    def behavioral_snapshot(self, program_id: str) -> Optional[BehavioralSnapshot]:
        return self._behavioral_map.get(program_id)

    def athletes(self, program_id: Optional[str] = None) -> List[Athlete]:
        if program_id:
            athlete_ids = self._athletes_by_program.get(program_id, [])
            return [self._athlete_index[athlete_id] for athlete_id in athlete_ids]
        return list(self._athletes)

    def athlete_snapshot(self, athlete_id: str) -> Optional[AthleteSnapshot]:
        return self._athlete_snapshots.get(athlete_id)

    def athlete_snapshots(self, program_id: Optional[str] = None) -> List[AthleteSnapshot]:
        if program_id:
            return [
                snapshot
                for snapshot in self._athlete_snapshots.values()
                if snapshot.program_id == program_id
            ]
        return list(self._athlete_snapshots.values())

    def agent_timeline(self, program_id: str, base_valuation: Optional[float] = None) -> List[Dict]:
        snapshot = self.behavioral_snapshot(program_id)
        program = next((p for p in self._programs if p.id == program_id), None)
        if not snapshot or not program:
            return []

        valuation_anchor = base_valuation or snapshot.valuation_projection
        valuation_anchor = _round_dollars(valuation_anchor)

        evidence_events: List[Dict] = []
        # Psychology evidence
        evidence_events.append(
            {
                "type": "evidence",
                "delay": self.random.uniform(0.05, 0.15),
                "payload": {
                    "agent": "Psychology",
                    "confidence": round(snapshot.psr_score, 2),
                    "rationale": "Parasocial and identity signals show resilient fan attachment",
                    "data_points": [
                        f"EI:{snapshot.psr_components['EI']:.2f}",
                        f"IF:{snapshot.psr_components['IF']:.2f}",
                        f"CR:{snapshot.psr_components['CR']:.2f}",
                    ],
                },
            }
        )

        # Authenticity / branding
        evidence_events.append(
            {
                "type": "evidence",
                "delay": self.random.uniform(0.08, 0.18),
                "payload": {
                    "agent": "Brand Alignment",
                    "confidence": round(snapshot.authenticity_score, 2),
                    "rationale": "Messaging consistency and value alignment remain above threshold",
                    "data_points": [
                        f"Consistency:{snapshot.authenticity_components['C']:.2f}",
                        f"ValueAlignment:{snapshot.authenticity_components['VA']:.2f}",
                    ],
                },
            }
        )

        # Market / sponsor lens
        evidence_events.append(
            {
                "type": "evidence",
                "delay": self.random.uniform(0.05, 0.14),
                "payload": {
                    "agent": "Market Intelligence",
                    "confidence": round(_clamp(0.72 + snapshot.sponsor_velocity * 0.1, 0.4, 0.97), 2),
                    "rationale": "Sponsor velocity and collective funding outlook support uplift",
                    "data_points": [
                        f"sponsor_velocity:+{snapshot.sponsor_velocity * 100:.1f}%",
                        f"valuation_projection:${snapshot.valuation_projection:,.0f}",
                    ],
                },
            }
        )

        # Compliance / fairness
        evidence_events.append(
            {
                "type": "evidence",
                "delay": self.random.uniform(0.06, 0.12),
                "payload": {
                    "agent": "Compliance",
                    "confidence": round(1 - snapshot.compliance_risk, 2),
                    "rationale": "Disclosure cadence and audit posture meet NIL policy benchmarks",
                    "data_points": [
                        f"compliance_risk:{snapshot.compliance_risk:.2f}",
                        f"fairness_index:{snapshot.fairness_index:.2f}",
                    ],
                },
            }
        )

        # Consensus event
        fairness_adjustment = (snapshot.fairness_index - 0.95) * 0.05
        psr_adjustment = (snapshot.psr_score - 0.8) * 0.08
        consensus_confidence = _clamp(0.78 + fairness_adjustment + psr_adjustment, 0.55, 0.98)
        valuation = _round_dollars(valuation_anchor * (1 + psr_adjustment + snapshot.sponsor_velocity * 0.12))
        evidence_events.append(
            {
                "type": "consensus",
                "delay": self.random.uniform(0.05, 0.1),
                "payload": {
                    "valuation": float(valuation),
                    "confidence": round(consensus_confidence, 3),
                    "notes": [
                        "Consensus formed using synthetic agent emulation",
                        "Adjust scenario knobs to explore alternative negotiations",
                    ],
                },
            }
        )

        # Fairness insight / alert
        if snapshot.fairness_index < 0.94:
            evidence_events.append(
                {
                    "type": "bias_alert",
                    "delay": self.random.uniform(0.04, 0.08),
                    "payload": {
                        "message": f"Fairness watch: demographic parity at {snapshot.fairness_index * 100:.1f}%.",
                        "severity": "warning",
                    },
                }
            )
        else:
            evidence_events.append(
                {
                    "type": "insight",
                    "delay": self.random.uniform(0.04, 0.08),
                    "payload": {
                        "message": f"Fairness check complete: demographic parity {snapshot.fairness_index * 100:.1f}%.",
                        "severity": "info",
                    },
                }
            )

        return evidence_events

    # ------------------------------------------------------------------
    # Generation helpers
    # ------------------------------------------------------------------
    def _generate_programs(self) -> List[Program]:
        programs: List[Program] = []
        highlight_pool = [
            "Immersive XR fan showcases",
            "Collective-funded mental health concierge",
            "AI-personalized alumni outreach",
            "Women's sports equity campaign",
            "Regional brand accelerator studio",
        ]
        for base_program in mock_data.list_programs():
            metrics = base_program.metrics
            reach_delta = self.random.uniform(-0.05, 0.06)
            new_reach = _clamp(metrics.fan_reach + reach_delta, 0.42, 0.96)
            baseline_delta = self.random.uniform(-0.12, 0.2)
            new_baseline = _round_dollars(metrics.nil_baseline * (1 + baseline_delta))
            highlights = list(metrics.community_highlights)
            new_highlight = self.random.choice(highlight_pool)
            if new_highlight not in highlights:
                highlights.append(new_highlight)

            programs.append(
                Program(
                    id=base_program.id,
                    name=base_program.name,
                    conference=base_program.conference,
                    tier=base_program.tier,
                    phase=base_program.phase,
                    metrics=ProgramMetrics(
                        fan_reach=new_reach,
                        nil_baseline=new_baseline,
                        community_highlights=highlights,
                    ),
                )
            )
        return programs

    def _generate_scenarios(self) -> List[Scenario]:
        scenarios: List[Scenario] = []
        base_scenarios = mock_data.list_scenarios()
        athletes = mock_data.list_athletes()
        athletes_by_program: Dict[str, List[str]] = {}
        for athlete in athletes:
            athletes_by_program.setdefault(athlete.program_id, []).append(athlete.id)

        for base in base_scenarios:
            win_delta = self.random.uniform(-0.08, 0.08)
            nil_delta = self.random.uniform(-0.05, 0.06)
            win_probability = _clamp(base.win_probability + win_delta, 0.35, 0.92)
            nil_uplift = _clamp(base.nil_uplift + nil_delta, 0.05, 0.28)
            sentiment_trend = self._generate_sentiment_curve(win_probability)
            lineup = self._generate_lineup(base.program_id, athletes_by_program)
            scenario_id = f"{base.program_id}_{int(self.seed % 10_000):04d}_{base.opponent.lower().replace(' ', '')}"
            scenarios.append(
                Scenario(
                    id=scenario_id,
                    program_id=base.program_id,
                    opponent=base.opponent,
                    lineup=lineup,
                    win_probability=win_probability,
                    nil_uplift=nil_uplift,
                    fan_sentiment=sentiment_trend,
                )
            )
        return scenarios

    def _generate_metrics(self) -> ValidationMetrics:
        return ValidationMetrics(
            valuation_accuracy=_clamp(self.random.gauss(0.91, 0.03), 0.82, 0.98),
            demographic_parity=_clamp(self.random.gauss(0.965, 0.015), 0.9, 0.995),
            athlete_earnings_lift=_clamp(self.random.gauss(0.29, 0.05), 0.15, 0.45),
            compliance_cost_reduction=_clamp(self.random.gauss(0.58, 0.07), 0.32, 0.82),
        )

    def _generate_raw_observations(
        self, program: Program
    ) -> tuple[BehavioralRawInputs, BehavioralRawSeries]:
        days = 30
        sentiment_base = _clamp(
            self.random.gauss(0.72 + program.metrics.fan_reach * 0.12, 0.05),
            0.35,
            0.98,
        )
        sentiment_daily = [
            _clamp(self.random.gauss(sentiment_base, 0.045), 0.15, 0.99) for _ in range(days)
        ]
        sentiment_mean = statistics.mean(sentiment_daily)
        sentiment_volatility = statistics.pstdev(sentiment_daily) if len(sentiment_daily) > 1 else 0.0

        base_interactions = max(
            25_000,
            int(
                self.random.gauss(
                    80_000 * (0.8 + program.metrics.fan_reach),
                    12_000,
                )
            ),
        )
        interactions_daily = [
            max(8_000, int(self.random.gauss(base_interactions, base_interactions * 0.2)))
            for _ in range(days)
        ]
        interactions_baseline = statistics.mean(interactions_daily[:7])
        interactions_weekly = statistics.mean(interactions_daily[-7:])

        content_similarity_daily = [
            _clamp(self.random.gauss(0.7 + program.metrics.fan_reach * 0.1, 0.05), 0.3, 0.99)
            for _ in range(days)
        ]
        share_rate_daily = [
            _clamp(self.random.gauss(0.2 + program.metrics.fan_reach * 0.04, 0.04), 0.04, 0.55)
            for _ in range(days)
        ]
        content_similarity = statistics.mean(content_similarity_daily)
        share_rate = statistics.mean(share_rate_daily)

        retention_monthly = [
            _clamp(self.random.gauss(0.78 + program.metrics.fan_reach * 0.05, 0.035), 0.55, 0.98)
            for _ in range(4)
        ]
        churn_events = [
            _clamp(self.random.gauss(0.08, 0.02), 0.015, 0.22)
            for _ in range(3)
        ]
        retention_rate = statistics.mean(retention_monthly)
        churn_shock = statistics.mean(churn_events)
        stability_index = _clamp(
            0.55 + 0.45 * (1 - statistics.pstdev(retention_monthly) if len(retention_monthly) > 1 else 0.0),
            0.5,
            0.99,
        )

        schedule_volatility_daily = [
            _clamp(self.random.gauss(0.12, 0.035), 0.02, 0.32)
            for _ in range(days)
        ]
        schedule_volatility = statistics.mean(schedule_volatility_daily)

        raw_inputs = BehavioralRawInputs(
            sentiment_mean=sentiment_mean,
            sentiment_volatility=sentiment_volatility,
            interactions_weekly=interactions_weekly,
            interactions_baseline=interactions_baseline,
            content_similarity=content_similarity,
            share_rate=share_rate,
            retention_rate=retention_rate,
            churn_shock=churn_shock,
            stability_index=stability_index,
            schedule_volatility=schedule_volatility,
        )

        raw_series = BehavioralRawSeries(
            sentiment_daily=sentiment_daily,
            interactions_daily=interactions_daily,
            content_similarity_daily=content_similarity_daily,
            share_rate_daily=share_rate_daily,
            retention_monthly=retention_monthly,
            churn_events=churn_events,
            schedule_volatility_daily=schedule_volatility_daily,
        )

        return raw_inputs, raw_series

    def _generate_behavioral_snapshots(self, programs: Iterable[Program]) -> Dict[str, BehavioralSnapshot]:
        snapshots: Dict[str, BehavioralSnapshot] = {}
        for program in programs:
            raw_inputs, raw_series = self._generate_raw_observations(program)
            snapshots[program.id] = self._build_snapshot_from_raw(program, raw_inputs, raw_series)
        return snapshots

    def _generate_athletes(self) -> List[Athlete]:
        athletes: List[Athlete] = []
        for base in mock_data.list_athletes():
            athlete = base.model_copy(deep=True)
            behavior = athlete.behavior
            behavior.parasocial_strength = _clamp(
                behavior.parasocial_strength + self.random.uniform(-0.03, 0.03),
                0.6,
                0.95,
            )
            behavior.identity_alignment = _clamp(
                behavior.identity_alignment + self.random.uniform(-0.025, 0.025),
                0.6,
                0.94,
            )
            behavior.authenticity_signal = _clamp(
                behavior.authenticity_signal + self.random.uniform(-0.02, 0.02),
                0.62,
                0.96,
            )
            behavior.network_multiplier = _clamp(
                behavior.network_multiplier + self.random.uniform(-0.08, 0.08),
                0.9,
                1.45,
            )
            athletes.append(athlete)
        return athletes

    def _generate_athlete_snapshots(self) -> Dict[str, AthleteSnapshot]:
        snapshots: Dict[str, AthleteSnapshot] = {}
        for athlete in self._athletes:
            program_snapshot = self._behavioral_map.get(athlete.program_id)
            if not program_snapshot:
                continue
            raw_inputs, raw_series = self._generate_athlete_observations(program_snapshot, athlete)
            snapshot = self._build_athlete_snapshot(program_snapshot, athlete, raw_inputs, raw_series)
            snapshots[athlete.id] = snapshot
        return snapshots

    def _compute_inputs_from_series(self, raw_series: BehavioralRawSeries) -> BehavioralRawInputs:
        sentiment_mean = statistics.mean(raw_series.sentiment_daily)
        sentiment_volatility = (
            statistics.pstdev(raw_series.sentiment_daily)
            if len(raw_series.sentiment_daily) > 1
            else 0.0
        )

        interactions_baseline = (
            statistics.mean(raw_series.interactions_daily[:7]) if raw_series.interactions_daily else 0.0
        )
        interactions_weekly = (
            statistics.mean(raw_series.interactions_daily[-7:]) if raw_series.interactions_daily else 0.0
        )

        content_similarity = (
            statistics.mean(raw_series.content_similarity_daily)
            if raw_series.content_similarity_daily
            else 0.0
        )
        share_rate = (
            statistics.mean(raw_series.share_rate_daily) if raw_series.share_rate_daily else 0.0
        )

        retention_rate = (
            statistics.mean(raw_series.retention_monthly) if raw_series.retention_monthly else 0.0
        )
        churn_shock = (
            statistics.mean(raw_series.churn_events) if raw_series.churn_events else 0.0
        )

        stability_index = _clamp(
            0.55
            + 0.45
            * (
                1
                - (
                    statistics.pstdev(raw_series.retention_monthly)
                    if len(raw_series.retention_monthly) > 1
                    else 0.0
                )
            ),
            0.5,
            0.99,
        )

        schedule_volatility = (
            statistics.mean(raw_series.schedule_volatility_daily)
            if raw_series.schedule_volatility_daily
            else 0.0
        )

        return BehavioralRawInputs(
            sentiment_mean=sentiment_mean,
            sentiment_volatility=sentiment_volatility,
            interactions_weekly=interactions_weekly,
            interactions_baseline=interactions_baseline,
            content_similarity=content_similarity,
            share_rate=share_rate,
            retention_rate=retention_rate,
            churn_shock=churn_shock,
            stability_index=stability_index,
            schedule_volatility=schedule_volatility,
        )

    def _generate_athlete_observations(
        self,
        program_snapshot: BehavioralSnapshot,
        athlete: Athlete,
    ) -> Tuple[BehavioralRawInputs, BehavioralRawSeries]:
        days = 30
        program_inputs = program_snapshot.raw_inputs
        behavior = athlete.behavior

        sentiment_anchor = _clamp(
            program_inputs.sentiment_mean * (0.88 + 0.25 * (behavior.parasocial_strength - 0.8)),
            0.2,
            0.99,
        )
        sentiment_daily = [
            _clamp(self.random.gauss(sentiment_anchor, 0.05), 0.15, 0.99)
            for _ in range(days)
        ]

        interaction_anchor = max(
            9_500.0,
            program_inputs.interactions_weekly * (0.12 + 0.42 * behavior.network_multiplier),
        )
        interactions_daily = [
            max(2_800, int(self.random.gauss(interaction_anchor, interaction_anchor * 0.22)))
            for _ in range(days)
        ]

        content_anchor = _clamp(
            program_inputs.content_similarity * (0.9 + 0.22 * (behavior.identity_alignment - 0.75)),
            0.3,
            0.99,
        )
        content_similarity_daily = [
            _clamp(self.random.gauss(content_anchor, 0.045), 0.25, 0.99)
            for _ in range(days)
        ]

        share_anchor = _clamp(
            program_inputs.share_rate * (0.92 + 0.25 * (behavior.network_multiplier - 1.0)),
            0.05,
            0.62,
        )
        share_rate_daily = [
            _clamp(self.random.gauss(share_anchor, 0.035), 0.03, 0.6)
            for _ in range(days)
        ]

        retention_anchor = _clamp(
            program_inputs.retention_rate * (0.9 + 0.22 * behavior.identity_alignment),
            0.55,
            0.99,
        )
        retention_monthly = [
            _clamp(self.random.gauss(retention_anchor, 0.03), 0.5, 0.995)
            for _ in range(4)
        ]

        churn_anchor = _clamp(
            program_inputs.churn_shock * (0.85 + 0.28 * (1 - behavior.identity_alignment)),
            0.01,
            0.25,
        )
        churn_events = [
            _clamp(self.random.gauss(churn_anchor, 0.012), 0.005, 0.24)
            for _ in range(3)
        ]

        schedule_anchor = _clamp(
            program_inputs.schedule_volatility * (1.0 + 0.15 * (1.05 - behavior.authenticity_signal)),
            0.02,
            0.34,
        )
        schedule_volatility_daily = [
            _clamp(self.random.gauss(schedule_anchor, 0.018), 0.015, 0.35)
            for _ in range(days)
        ]

        raw_series = BehavioralRawSeries(
            sentiment_daily=sentiment_daily,
            interactions_daily=interactions_daily,
            content_similarity_daily=content_similarity_daily,
            share_rate_daily=share_rate_daily,
            retention_monthly=retention_monthly,
            churn_events=churn_events,
            schedule_volatility_daily=schedule_volatility_daily,
        )
        raw_inputs = self._compute_inputs_from_series(raw_series)
        return raw_inputs, raw_series

    def _build_athlete_snapshot(
        self,
        program_snapshot: BehavioralSnapshot,
        athlete: Athlete,
        raw_inputs: BehavioralRawInputs,
        raw_series: BehavioralRawSeries,
        feed_items: Optional[List[Dict[str, Any]]] = None,
    ) -> AthleteSnapshot:
        behavior = athlete.behavior
        interaction_ratio = raw_inputs.interactions_weekly / (raw_inputs.interactions_baseline + 1e-6)

        ei_multiplier = 0.9 + 0.25 * (behavior.parasocial_strength - 0.8)
        psr_components = {
            "EI": _clamp(
                0.32
                + 0.55 * raw_inputs.sentiment_mean * ei_multiplier
                - 0.18 * raw_inputs.sentiment_volatility,
                0.0,
                1.0,
            ),
            "IF": _clamp(
                0.5 + 0.28 * (interaction_ratio - 1.0) * behavior.network_multiplier,
                0.0,
                1.0,
            ),
            "CR": _clamp(
                0.34 * raw_inputs.content_similarity
                + 0.6 * (raw_inputs.share_rate / 0.5) * behavior.authenticity_signal,
                0.0,
                1.0,
            ),
            "LI": _clamp(
                raw_inputs.retention_rate * behavior.identity_alignment - 0.35 * raw_inputs.churn_shock,
                0.0,
                1.0,
            ),
            "TC": _clamp(
                0.46
                + 0.38 * raw_inputs.stability_index
                - 0.27 * raw_inputs.schedule_volatility,
                0.0,
                1.0,
            ),
        }
        psr_weights = {
            "EI": 0.3,
            "IF": 0.2,
            "CR": 0.18,
            "LI": 0.16,
            "TC": 0.16,
        }
        psr_score = sum(psr_components[key] * psr_weights[key] for key in psr_components)

        authenticity_components = {
            "C": _clamp(
                0.46
                + 0.5 * raw_inputs.stability_index * behavior.authenticity_signal
                - 0.24 * raw_inputs.schedule_volatility,
                0.0,
                1.0,
            ),
            "VA": _clamp(
                0.4
                + 0.45 * raw_inputs.retention_rate * behavior.identity_alignment
                + 0.18 * raw_inputs.sentiment_mean,
                0.0,
                1.0,
            ),
            "BC": _clamp(
                0.44
                + 0.44 * raw_inputs.stability_index
                - 0.18 * raw_inputs.churn_shock,
                0.0,
                1.0,
            ),
            "CS": _clamp(
                0.38
                + 0.48 * raw_inputs.sentiment_mean * behavior.authenticity_signal
                - 0.18 * raw_inputs.sentiment_volatility,
                0.0,
                1.0,
            ),
            "TS": _clamp(
                0.49
                + 0.4 * raw_inputs.stability_index
                - 0.28 * raw_inputs.schedule_volatility,
                0.0,
                1.0,
            ),
        }
        authenticity_weights = {
            "C": 0.24,
            "VA": 0.22,
            "BC": 0.18,
            "CS": 0.18,
            "TS": 0.18,
        }
        authenticity_score = sum(
            authenticity_components[key] * authenticity_weights[key]
            for key in authenticity_components
        )

        engagement_velocity = _clamp(
            0.05
            + 0.26 * (raw_inputs.share_rate / 0.5) * behavior.network_multiplier
            + 0.18 * (interaction_ratio - 1.0),
            0.01,
            0.45,
        )

        fairness_index = _clamp(
            program_snapshot.fairness_index
            + 0.018 * (behavior.identity_alignment - 0.8)
            - 0.03 * raw_inputs.churn_shock
            + 0.02 * (raw_inputs.stability_index - 0.75),
            0.85,
            1.02,
        )

        compliance_risk = _clamp(
            program_snapshot.compliance_risk
            + 0.05 * raw_inputs.schedule_volatility
            + 0.04 * raw_inputs.churn_shock
            - 0.05 * behavior.authenticity_signal,
            0.01,
            0.35,
        )

        base_value = self._athlete_baselines.get(athlete.id)
        if base_value is None:
            base_value = _round_dollars(
                max(60_000.0, program_snapshot.valuation_projection * 0.085 * behavior.network_multiplier)
            )
            self._athlete_baselines[athlete.id] = base_value

        valuation_multiplier = (
            0.4 * (psr_score - 0.75)
            + 0.32 * (authenticity_score - 0.77)
            + 0.18 * (engagement_velocity - 0.12)
            - 0.25 * compliance_risk
        )
        valuation_projection = _round_dollars(base_value * (1 + valuation_multiplier))
        valuation_projection = max(40_000.0, valuation_projection)

        agent_metrics = self._derive_agent_metrics(
            athlete,
            raw_inputs,
            program_snapshot,
        )
        if feed_items is None:
            feed_items = self._generate_feed_items(athlete, raw_inputs, agent_metrics)
            self._athlete_feeds[athlete.id] = feed_items
        else:
            self._athlete_feeds[athlete.id] = feed_items

        snapshot = AthleteSnapshot(
            athlete_id=athlete.id,
            program_id=athlete.program_id,
            name=athlete.name,
            position=athlete.position,
            archetype=athlete.archetype,
            psr_components=psr_components,
            authenticity_components=authenticity_components,
            psr_score=psr_score,
            authenticity_score=authenticity_score,
            fairness_index=fairness_index,
            compliance_risk=compliance_risk,
            valuation_projection=float(valuation_projection),
            engagement_velocity=engagement_velocity,
            agent_metrics=agent_metrics,
            feed_items=list(feed_items),
            raw_inputs=raw_inputs,
            raw_series=raw_series,
        )
        return snapshot

    def _derive_agent_metrics(
        self,
        athlete: Athlete,
        raw_inputs: BehavioralRawInputs,
        program_snapshot: BehavioralSnapshot,
    ) -> Dict[str, Dict[str, float]]:
        behavior = athlete.behavior

        social_media = {
            "engagement_authenticity": _clamp(
                0.45
                + 0.35 * behavior.parasocial_strength
                + 0.25 * (raw_inputs.share_rate / 0.6)
                - 0.25 * raw_inputs.churn_shock,
                0.0,
                1.0,
            ),
            "sentiment_intensity": _clamp(
                0.3 + 0.6 * raw_inputs.sentiment_mean + 0.1 * (1 - raw_inputs.sentiment_volatility * 1.6),
                0.0,
                1.0,
            ),
            "virality_potential": _clamp(
                0.35 + 0.55 * (raw_inputs.share_rate / 0.55) + 0.1 * (behavior.network_multiplier - 1.0),
                0.0,
                1.0,
            ),
            "platform_fit": _clamp(
                0.45 + 0.25 * behavior.network_multiplier + 0.2 * behavior.authenticity_signal - 0.15 * raw_inputs.churn_shock,
                0.0,
                1.0,
            ),
            "authenticity_detection": _clamp(
                0.5 + 0.3 * behavior.authenticity_signal - 0.25 * raw_inputs.churn_shock + 0.1 * raw_inputs.sentiment_mean,
                0.0,
                1.0,
            ),
        }

        athletic_performance = {
            "stat_efficiency": _clamp(
                0.5 + 0.25 * behavior.parasocial_strength + 0.2 * (raw_inputs.sentiment_mean - 0.6),
                0.0,
                1.0,
            ),
            "context_adjustment": _clamp(
                0.48 + 0.28 * behavior.identity_alignment + 0.18 * (program_snapshot.social_identity_index - 0.75),
                0.0,
                1.0,
            ),
            "injury_risk": _clamp(
                0.2 + 0.35 * raw_inputs.schedule_volatility + 0.25 * raw_inputs.churn_shock - 0.25 * behavior.authenticity_signal,
                0.0,
                1.0,
            ),
            "pro_projection": _clamp(
                0.42 + 0.32 * behavior.network_multiplier + 0.2 * behavior.identity_alignment,
                0.0,
                1.0,
            ),
            "leadership_signal": _clamp(
                0.4 + 0.3 * behavior.authenticity_signal + 0.2 * behavior.identity_alignment - 0.15 * raw_inputs.churn_shock,
                0.0,
                1.0,
            ),
        }

        market_intelligence = {
            "comp_deal_alignment": _clamp(
                0.4 + 0.35 * behavior.network_multiplier + 0.25 * (raw_inputs.share_rate / 0.55),
                0.0,
                1.0,
            ),
            "market_timing": _clamp(
                0.45 + 0.3 * raw_inputs.stability_index + 0.15 * (program_snapshot.sponsor_velocity * 2.0),
                0.0,
                1.0,
            ),
            "brand_demand": _clamp(
                0.42 + 0.28 * behavior.identity_alignment + 0.25 * raw_inputs.sentiment_mean,
                0.0,
                1.0,
            ),
            "economic_context": _clamp(
                0.5 + 0.2 * program_snapshot.sponsor_velocity + 0.15 * (program_snapshot.social_identity_index - 0.75),
                0.0,
                1.0,
            ),
            "competitive_position": _clamp(
                0.38 + 0.3 * behavior.network_multiplier + 0.2 * behavior.authenticity_signal,
                0.0,
                1.0,
            ),
        }

        brand_alignment = {
            "values_match": _clamp(
                0.48 + 0.32 * behavior.identity_alignment + 0.2 * behavior.authenticity_signal,
                0.0,
                1.0,
            ),
            "story_resonance": _clamp(
                0.45 + 0.3 * behavior.parasocial_strength + 0.2 * raw_inputs.sentiment_mean,
                0.0,
                1.0,
            ),
            "activation_readiness": _clamp(
                0.4 + 0.3 * behavior.network_multiplier + 0.2 * (1 - raw_inputs.churn_shock) + 0.1 * raw_inputs.share_rate * 2.0,
                0.0,
                1.0,
            ),
        }

        psychology = {
            "fan_identity_tie": _clamp(
                0.5 + 0.35 * behavior.identity_alignment + 0.2 * (program_snapshot.social_identity_index - 0.75),
                0.0,
                1.0,
            ),
            "influence_score": _clamp(
                0.45 + 0.3 * behavior.parasocial_strength + 0.2 * behavior.network_multiplier,
                0.0,
                1.0,
            ),
            "trust_velocity": _clamp(
                0.42 + 0.32 * behavior.authenticity_signal - 0.2 * raw_inputs.churn_shock + 0.15 * raw_inputs.retention_rate,
                0.0,
                1.0,
            ),
        }

        risk_compliance = {
            "regulatory_score": _clamp(
                0.6 + 0.25 * behavior.authenticity_signal - 0.3 * program_snapshot.compliance_risk,
                0.0,
                1.0,
            ),
            "disclosure_health": _clamp(
                0.55 + 0.25 * raw_inputs.stability_index - 0.25 * raw_inputs.schedule_volatility,
                0.0,
                1.0,
            ),
            "audit_risk": _clamp(
                0.25 + 0.35 * raw_inputs.schedule_volatility + 0.25 * raw_inputs.churn_shock - 0.25 * behavior.authenticity_signal,
                0.0,
                1.0,
            ),
        }

        ethics = {
            "bias_index": _clamp(
                0.35 - 0.15 * (program_snapshot.fairness_index - 0.95) + 0.25 * raw_inputs.churn_shock,
                0.0,
                1.0,
            ),
            "fairness_drift": _clamp(
                0.3 - 0.25 * (program_snapshot.fairness_index - 0.95) + 0.2 * raw_inputs.schedule_volatility,
                0.0,
                1.0,
            ),
            "ethics_confidence": _clamp(
                0.6 + 0.25 * behavior.authenticity_signal - 0.2 * raw_inputs.churn_shock,
                0.0,
                1.0,
            ),
        }

        return {
            "social_media": social_media,
            "athletic_performance": athletic_performance,
            "market_intelligence": market_intelligence,
            "brand_alignment": brand_alignment,
            "psychology": psychology,
            "risk_compliance": risk_compliance,
            "ethics": ethics,
        }

    def _generate_feed_items(
        self,
        athlete: Athlete,
        raw_inputs: BehavioralRawInputs,
        agent_metrics: Dict[str, Dict[str, float]],
    ) -> List[Dict[str, Any]]:
        now = int(time.time())
        items: List[Dict[str, Any]] = []
        social_metrics = agent_metrics.get("social_media", {})
        platform = self.random.choice(SOCIAL_PLATFORMS)
        sentiment = social_metrics.get("sentiment_intensity", 0.58)
        engagement = social_metrics.get("engagement_authenticity", 0.55)
        items.append(
            self._make_feed_entry(
                athlete_id=athlete.id,
                athlete_name=athlete.name,
                category="social",
                source=platform,
                headline=f"{platform} clip pushes {athlete.name.split()[0]} into trending NIL lane",
                snippet=f"{platform} fans amplified a behind-the-scenes moment — engagement authenticity spikes to {engagement:.2f} as supporters share team-first messaging.",
                sentiment=sentiment,
                impact=min(1.0, 0.4 + engagement * 0.5),
                timestamp=now - self.random.randint(1800, 7200),
                tags=["fan-reaction", "social"],
            )
        )

        market_metrics = agent_metrics.get("market_intelligence", {})
        outlet = self.random.choice(NEWS_OUTLETS)
        comp_alignment = market_metrics.get("comp_deal_alignment", 0.52)
        items.append(
            self._make_feed_entry(
                athlete_id=athlete.id,
                athlete_name=athlete.name,
                category="news",
                source=outlet,
                headline=f"{outlet}: Collectives circle {athlete.name} after showcase weekend",
                snippet=f"Insiders cite NIL comps aligning at {comp_alignment:.2f} with national guard campaigns. Brand demand rising as locker room leadership narrative solidifies.",
                sentiment=0.55 + comp_alignment * 0.3,
                impact=min(1.0, 0.45 + comp_alignment * 0.4),
                timestamp=now - self.random.randint(3600, 14400),
                tags=["market", "collective"],
            )
        )

        performance_metrics = agent_metrics.get("athletic_performance", {})
        tracker = self.random.choice(PERFORMANCE_TRACKERS)
        efficiency = performance_metrics.get("stat_efficiency", 0.5)
        items.append(
            self._make_feed_entry(
                athlete_id=athlete.id,
                athlete_name=athlete.name,
                category="performance",
                source=tracker,
                headline=f"{tracker} grades {athlete.name.split()[0]} top {int(efficiency * 100)} percentile in clutch possessions",
                snippet=f"Adjusted efficiency at {efficiency:.2f} with contextual bump for late-game runs. Coaching staff experimenting with lineup that maximizes spacing and NIL storytelling.",
                sentiment=0.5 + efficiency * 0.35,
                impact=min(1.0, 0.4 + efficiency * 0.45),
                timestamp=now - self.random.randint(900, 5400),
                tags=["performance", "analytics"],
            )
        )

        psychology_metrics = agent_metrics.get("psychology", {})
        trust = psychology_metrics.get("trust_velocity", 0.5)
        items.append(
            self._make_feed_entry(
                athlete_id=athlete.id,
                athlete_name=athlete.name,
                category="community",
                source="Booster Slack",
                headline=f"Community AMA boosts trust velocity for {athlete.name.split()[0]}",
                snippet=f"Local collective hosted a mental health roundtable. Fan trust velocity now {trust:.2f}; alumni push for expanded mentorship activations.",
                sentiment=0.55 + trust * 0.3,
                impact=min(1.0, 0.35 + trust * 0.5),
                timestamp=now - self.random.randint(1200, 9600),
                tags=["community", "psychology"],
            )
        )

        compliance_metrics = agent_metrics.get("risk_compliance", {})
        audit_risk = compliance_metrics.get("audit_risk", 0.2)
        items.append(
            self._make_feed_entry(
                athlete_id=athlete.id,
                athlete_name=athlete.name,
                category="compliance",
                source="Disclosure Portal",
                headline=f"Disclosure update processed for {athlete.name.split()[0]} brand collaboration",
                snippet=f"Compliance audit risk steady at {audit_risk:.2f}; RACA recommends maintaining weekly disclosure cadence to protect collective partnerships.",
                sentiment=0.5 - audit_risk * 0.2,
                impact=max(0.1, 0.3 + (0.3 - audit_risk) * 0.4),
                timestamp=now - self.random.randint(600, 4200),
                tags=["compliance", "ethics"],
            )
        )

        return items[:8]

    def _make_feed_entry(
        self,
        athlete_id: str,
        athlete_name: str,
        category: str,
        source: str,
        headline: str,
        snippet: str,
        sentiment: float,
        impact: float,
        timestamp: int,
        tags: List[str],
    ) -> Dict[str, Any]:
        sentiment_clamped = _clamp(sentiment, 0.0, 1.0)
        impact_clamped = _clamp(impact, 0.0, 1.0)
        return {
            "id": f"{athlete_id}-{category}-{int(timestamp)}-{self.random.randint(100, 999)}",
            "category": category,
            "source": source,
            "headline": headline,
            "snippet": snippet,
            "sentiment": round(sentiment_clamped, 3),
            "impact_score": round(impact_clamped, 3),
            "timestamp": timestamp,
            "tags": tags,
            "athlete_id": athlete_id,
            "athlete_name": athlete_name,
        }

    def _update_feed_items(
        self,
        athlete: Athlete,
        snapshot: AthleteSnapshot,
        diff: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        feed_items = list(self._athlete_feeds.get(athlete.id, []))
        agent_delta = diff.get("agent_metrics", {})
        if agent_delta:
            best_agent = None
            best_metric = None
            best_delta = 0.0
            for agent_id, metrics in agent_delta.items():
                for metric_key, delta in metrics.items():
                    if abs(delta) > abs(best_delta):
                        best_delta = delta
                        best_agent = agent_id
                        best_metric = metric_key
            if best_agent and best_metric and abs(best_delta) > 0.015:
                agent_metrics = snapshot.agent_metrics.get(best_agent, {})
                metric_value = agent_metrics.get(best_metric, 0.5)
                headline = f"{snapshot.name} registers {best_metric.replace('_', ' ')} shift"
                snippet = (
                    f"Agent {best_agent.replace('_', ' ').title()} flags metric change of {best_delta:+.3f}."
                    f" Current value {metric_value:.2f} signals evolving opportunity for collectives."
                )
                category = "signal"
                source = best_agent.replace('_', ' ').title()
                feed_items.insert(
                    0,
                    self._make_feed_entry(
                        athlete_id=snapshot.athlete_id,
                        athlete_name=snapshot.name,
                        category=category,
                        source=source,
                        headline=headline,
                        snippet=snippet,
                        sentiment=0.5 + metric_value * 0.2,
                        impact=0.4 + min(0.4, abs(best_delta) * 4.0),
                        timestamp=int(time.time()),
                        tags=["agent-signal", best_agent],
                    ),
                )
        if len(feed_items) > 10:
            feed_items = feed_items[:10]
        return feed_items

    def _advance_athletes(
        self,
        program_id: str,
        program_snapshot: BehavioralSnapshot,
    ) -> List[Dict[str, Any]]:
        candidates: List[Dict[str, Any]] = []
        for athlete_id in self._athletes_by_program.get(program_id, []):
            snapshot, diff = self._advance_single_athlete(athlete_id, program_snapshot)
            athlete = self._athlete_index.get(athlete_id)
            if not athlete:
                continue
            impact = (
                abs(diff.get("psr_score", 0.0)) * 3.0
                + abs(diff.get("authenticity_score", 0.0)) * 2.0
                + abs(diff.get("valuation_projection", 0.0)) / 50_000.0
                + abs(diff.get("engagement_velocity", 0.0)) * 2.5
            )
            agent_delta = diff.get("agent_metrics", {})  # type: ignore[arg-type]
            impact += (
                abs(agent_delta.get("social_media", {}).get("engagement_authenticity", 0.0)) * 2.5
                + abs(agent_delta.get("market_intelligence", {}).get("comp_deal_alignment", 0.0)) * 2.0
                + abs(agent_delta.get("risk_compliance", {}).get("audit_risk", 0.0)) * 1.5
            )
            candidates.append(
                {
                    "athlete": athlete,
                    "snapshot": snapshot,
                    "diff": diff,
                    "impact": impact,
                }
            )
        candidates.sort(key=lambda item: item["impact"], reverse=True)
        return candidates[:2]

    def _advance_single_athlete(
        self,
        athlete_id: str,
        program_snapshot: BehavioralSnapshot,
    ) -> Tuple[AthleteSnapshot, Dict[str, float]]:
        previous_snapshot = self._athlete_snapshots.get(athlete_id)
        athlete = self._athlete_index.get(athlete_id)
        if not previous_snapshot or not athlete:
            raise ValueError(f"Unknown athlete id {athlete_id}")

        raw_series = copy.deepcopy(previous_snapshot.raw_series)
        behavior = athlete.behavior

        def _rolling(series: List, value):
            if not series:
                return
            series.pop(0)
            series.append(value)

        sentiment_new = _clamp(
            self.random.gauss(previous_snapshot.raw_inputs.sentiment_mean, 0.045),
            0.12,
            0.99,
        )
        _rolling(raw_series.sentiment_daily, sentiment_new)

        interaction_mu = max(
            3_500.0,
            previous_snapshot.raw_inputs.interactions_weekly * (0.92 + 0.18 * (behavior.network_multiplier - 1.0)),
        )
        interactions_new = max(
            2_500,
            int(self.random.gauss(interaction_mu, interaction_mu * 0.2)),
        )
        _rolling(raw_series.interactions_daily, interactions_new)

        similarity_mu = _clamp(
            previous_snapshot.raw_inputs.content_similarity * (0.96 + 0.15 * (behavior.identity_alignment - 0.75)),
            0.25,
            0.99,
        )
        _rolling(
            raw_series.content_similarity_daily,
            _clamp(self.random.gauss(similarity_mu, 0.035), 0.2, 0.99),
        )

        share_mu = _clamp(
            previous_snapshot.raw_inputs.share_rate * (0.95 + 0.18 * (behavior.network_multiplier - 1.0)),
            0.04,
            0.62,
        )
        _rolling(
            raw_series.share_rate_daily,
            _clamp(self.random.gauss(share_mu, 0.028), 0.02, 0.6),
        )

        if raw_series.retention_monthly:
            retention_mu = _clamp(
                previous_snapshot.raw_inputs.retention_rate * (0.95 + 0.15 * behavior.identity_alignment),
                0.55,
                0.995,
            )
            raw_series.retention_monthly.pop(0)
            raw_series.retention_monthly.append(
                _clamp(self.random.gauss(retention_mu, 0.025), 0.5, 0.995)
            )

        if raw_series.churn_events:
            churn_mu = _clamp(
                previous_snapshot.raw_inputs.churn_shock * (0.95 + 0.22 * (1 - behavior.identity_alignment)),
                0.01,
                0.28,
            )
            raw_series.churn_events.pop(0)
            raw_series.churn_events.append(
                _clamp(self.random.gauss(churn_mu, 0.01), 0.005, 0.27)
            )

        schedule_mu = _clamp(
            previous_snapshot.raw_inputs.schedule_volatility * (0.98 + 0.15 * (1.05 - behavior.authenticity_signal)),
            0.02,
            0.34,
        )
        _rolling(
            raw_series.schedule_volatility_daily,
            _clamp(self.random.gauss(schedule_mu, 0.016), 0.015, 0.35),
        )

        raw_inputs = self._compute_inputs_from_series(raw_series)
        existing_feed = self._athlete_feeds.get(athlete_id)
        snapshot = self._build_athlete_snapshot(
            program_snapshot,
            athlete,
            raw_inputs,
            raw_series,
            existing_feed,
        )
        self._athlete_snapshots[athlete_id] = snapshot

        diff = {
            "psr_score": snapshot.psr_score - previous_snapshot.psr_score,
            "authenticity_score": snapshot.authenticity_score - previous_snapshot.authenticity_score,
            "fairness_index": snapshot.fairness_index - previous_snapshot.fairness_index,
            "compliance_risk": snapshot.compliance_risk - previous_snapshot.compliance_risk,
            "valuation_projection": snapshot.valuation_projection - previous_snapshot.valuation_projection,
            "engagement_velocity": snapshot.engagement_velocity - previous_snapshot.engagement_velocity,
            "sentiment_mean": snapshot.raw_inputs.sentiment_mean - previous_snapshot.raw_inputs.sentiment_mean,
            "interactions_weekly": snapshot.raw_inputs.interactions_weekly - previous_snapshot.raw_inputs.interactions_weekly,
            "share_rate": snapshot.raw_inputs.share_rate - previous_snapshot.raw_inputs.share_rate,
        }

        agent_diff: Dict[str, Dict[str, float]] = {}
        for agent_id, metrics in snapshot.agent_metrics.items():
            prev_metrics = previous_snapshot.agent_metrics.get(agent_id, {})
            agent_diff[agent_id] = {
                metric: metrics.get(metric, 0.0) - prev_metrics.get(metric, 0.0)
                for metric in metrics.keys()
            }
        diff["agent_metrics"] = agent_diff

        updated_feed = self._update_feed_items(athlete, snapshot, diff)
        self._athlete_feeds[athlete_id] = updated_feed
        snapshot.feed_items = list(updated_feed)

        return snapshot, diff

    def advance_program(self, program_id: str) -> Optional[Dict[str, Any]]:
        program = next((p for p in self._programs if p.id == program_id), None)
        previous_snapshot = self._behavioral_map.get(program_id)
        if not program or not previous_snapshot:
            return None

        raw_series = copy.deepcopy(previous_snapshot.raw_series)

        def _rolling_update(series: List, new_value):
            if not series:
                return
            series.pop(0)
            series.append(new_value)

        new_sentiment = _clamp(
            self.random.gauss(previous_snapshot.raw_inputs.sentiment_mean, 0.04), 0.15, 0.99
        )
        _rolling_update(raw_series.sentiment_daily, new_sentiment)

        new_interactions = max(
            8_000,
            int(
                self.random.gauss(
                    previous_snapshot.raw_inputs.interactions_weekly,
                    previous_snapshot.raw_inputs.interactions_weekly * 0.18,
                )
            ),
        )
        _rolling_update(raw_series.interactions_daily, new_interactions)

        new_similarity = _clamp(
            self.random.gauss(previous_snapshot.raw_inputs.content_similarity, 0.035), 0.3, 0.99
        )
        _rolling_update(raw_series.content_similarity_daily, new_similarity)

        new_share = _clamp(
            self.random.gauss(previous_snapshot.raw_inputs.share_rate, 0.03), 0.04, 0.55
        )
        _rolling_update(raw_series.share_rate_daily, new_share)

        retention_update = _clamp(
            self.random.gauss(previous_snapshot.raw_inputs.retention_rate, 0.02), 0.55, 0.99
        )
        if raw_series.retention_monthly:
            raw_series.retention_monthly.pop(0)
            raw_series.retention_monthly.append(retention_update)

        churn_update = _clamp(
            self.random.gauss(previous_snapshot.raw_inputs.churn_shock, 0.015), 0.01, 0.25
        )
        if raw_series.churn_events:
            raw_series.churn_events.pop(0)
            raw_series.churn_events.append(churn_update)

        schedule_update = _clamp(
            self.random.gauss(previous_snapshot.raw_inputs.schedule_volatility, 0.02), 0.02, 0.32
        )
        _rolling_update(raw_series.schedule_volatility_daily, schedule_update)

        raw_inputs = self._compute_inputs_from_series(raw_series)
        snapshot = self._build_snapshot_from_raw(program, raw_inputs, raw_series)
        self._behavioral_map[program_id] = snapshot

        diff = {
            "psr_score": snapshot.psr_score - previous_snapshot.psr_score,
            "authenticity_score": snapshot.authenticity_score - previous_snapshot.authenticity_score,
            "fairness_index": snapshot.fairness_index - previous_snapshot.fairness_index,
            "compliance_risk": snapshot.compliance_risk - previous_snapshot.compliance_risk,
            "valuation_projection": snapshot.valuation_projection - previous_snapshot.valuation_projection,
            "sponsor_velocity": snapshot.sponsor_velocity - previous_snapshot.sponsor_velocity,
            "sentiment_mean": raw_inputs.sentiment_mean - previous_snapshot.raw_inputs.sentiment_mean,
            "interactions_weekly": raw_inputs.interactions_weekly - previous_snapshot.raw_inputs.interactions_weekly,
            "share_rate": raw_inputs.share_rate - previous_snapshot.raw_inputs.share_rate,
            "retention_rate": raw_inputs.retention_rate - previous_snapshot.raw_inputs.retention_rate,
        }

        athlete_updates = self._advance_athletes(program_id, snapshot)

        return {
            "program_id": program_id,
            "snapshot": snapshot,
            "diff": diff,
            "athletes": athlete_updates,
        }

    def _build_snapshot_from_raw(
        self,
        program: Program,
        raw_inputs: BehavioralRawInputs,
        raw_series: BehavioralRawSeries,
    ) -> BehavioralSnapshot:
        interaction_ratio = raw_inputs.interactions_weekly / (raw_inputs.interactions_baseline + 1e-6)

        psr_components = {
            "EI": _clamp(0.35 + 0.55 * raw_inputs.sentiment_mean - 0.25 * raw_inputs.sentiment_volatility, 0.0, 1.0),
            "IF": _clamp(0.55 + 0.25 * (interaction_ratio - 1.0), 0.0, 1.0),
            "CR": _clamp(0.42 * raw_inputs.content_similarity + 0.58 * (raw_inputs.share_rate / 0.45), 0.0, 1.0),
            "LI": _clamp(raw_inputs.retention_rate - 0.4 * raw_inputs.churn_shock, 0.0, 1.0),
            "TC": _clamp(0.48 + 0.38 * raw_inputs.stability_index - 0.3 * raw_inputs.schedule_volatility, 0.0, 1.0),
        }
        psr_weights = {
            "EI": 0.28,
            "IF": 0.22,
            "CR": 0.2,
            "LI": 0.16,
            "TC": 0.14,
        }
        psr_score = sum(psr_components[k] * psr_weights[k] for k in psr_components)

        authenticity_components = {
            "C": _clamp(0.4 + 0.55 * raw_inputs.stability_index - 0.25 * raw_inputs.schedule_volatility, 0.0, 1.0),
            "VA": _clamp(0.35 + 0.5 * raw_inputs.retention_rate + 0.15 * raw_inputs.sentiment_mean, 0.0, 1.0),
            "BC": _clamp(0.45 + 0.45 * raw_inputs.stability_index - 0.2 * raw_inputs.churn_shock, 0.0, 1.0),
            "CS": _clamp(0.4 + 0.5 * raw_inputs.sentiment_mean - 0.2 * raw_inputs.sentiment_volatility, 0.0, 1.0),
            "TS": _clamp(0.5 + 0.42 * raw_inputs.stability_index - 0.3 * raw_inputs.schedule_volatility, 0.0, 1.0),
        }
        authenticity_weights = {
            "C": 0.24,
            "VA": 0.2,
            "BC": 0.2,
            "CS": 0.18,
            "TS": 0.18,
        }
        authenticity_score = sum(
            authenticity_components[k] * authenticity_weights[k] for k in authenticity_components
        )

        social_identity_index = _clamp(
            0.55
            + 0.2 * raw_inputs.retention_rate
            + 0.15 * (raw_inputs.share_rate / 0.45)
            + 0.1 * psr_score,
            0.5,
            0.98,
        )

        fairness_index = _clamp(
            0.9
            + 0.04 * raw_inputs.retention_rate
            - 0.035 * raw_inputs.churn_shock
            + 0.03 * raw_inputs.stability_index
            - 0.02 * raw_inputs.schedule_volatility,
            0.88,
            0.995,
        )

        compliance_risk = _clamp(
            0.05
            + 0.4 * raw_inputs.schedule_volatility
            + 0.25 * raw_inputs.churn_shock
            - 0.3 * raw_inputs.stability_index,
            0.02,
            0.35,
        )

        sponsor_velocity = _clamp(
            0.06
            + 0.25 * (raw_inputs.share_rate / 0.45)
            + 0.2 * (raw_inputs.content_similarity - 0.7)
            + 0.1 * (interaction_ratio - 1.0),
            0.02,
            0.35,
        )

        valuation_multiplier = (
            0.35 * (psr_score - 0.75)
            + 0.25 * (authenticity_score - 0.75)
            + 0.15 * (social_identity_index - 0.8)
            + 0.4 * sponsor_velocity
        )
        valuation_projection = _round_dollars(program.metrics.nil_baseline * (1 + valuation_multiplier))

        return BehavioralSnapshot(
            program_id=program.id,
            psr_components=psr_components,
            authenticity_components=authenticity_components,
            psr_score=psr_score,
            authenticity_score=authenticity_score,
            social_identity_index=social_identity_index,
            fairness_index=fairness_index,
            compliance_risk=compliance_risk,
            valuation_projection=float(valuation_projection),
            sponsor_velocity=sponsor_velocity,
            raw_inputs=raw_inputs,
            raw_series=raw_series,
        )

    def _generate_lineup(self, program_id: str, athletes_by_program: Dict[str, List[str]]) -> List[str]:
        lineup: List[str] = []
        primary_pool = athletes_by_program.get(program_id, [])
        if primary_pool:
            lineup.append(self.random.choice(primary_pool))
        other_programs = [pid for pid in athletes_by_program.keys() if pid != program_id]
        self.random.shuffle(other_programs)
        for pid in other_programs[:2]:
            lineup.append(self.random.choice(athletes_by_program[pid]))
        while len(lineup) < 3 and primary_pool:
            lineup.append(self.random.choice(primary_pool))
        return lineup

    def _generate_sentiment_curve(self, win_probability: float) -> List[float]:
        base = _clamp(0.45 + (win_probability - 0.5) * 0.6, 0.3, 0.95)
        curve = []
        momentum = self.random.uniform(0.02, 0.08)
        for i in range(5):
            noise = self.random.uniform(-0.04, 0.04)
            value = _clamp(base + momentum * i + noise, 0.25, 0.99)
            curve.append(round(value, 3))
        return curve

    def _normalized_weights(self, keys: Iterable[str]) -> Dict[str, float]:
        raw = [self.random.uniform(0.5, 1.5) for _ in keys]
        total = sum(raw)
        return {k: v / total for k, v in zip(keys, raw)}


__all__ = [
    "SyntheticEngine",
    "BehavioralSnapshot",
    "AthleteSnapshot",
    "BehavioralRawInputs",
    "BehavioralRawSeries",
]
