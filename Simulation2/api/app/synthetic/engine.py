from __future__ import annotations

import random
import time
import statistics
from dataclasses import dataclass
from typing import Dict, Iterable, List, Optional

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


class SyntheticEngine:
    """Generates reproducible synthetic data for NIL emulation."""

    def __init__(self, seed: Optional[int] = None) -> None:
        self.seed = seed or int(time.time())
        self.random = random.Random(self.seed)
        self._programs = self._generate_programs()
        self._scenarios = self._generate_scenarios()
        self._metrics = self._generate_metrics()
        self._behavioral_map = self._generate_behavioral_snapshots(self._programs)

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
            authenticity_score = sum(authenticity_components[k] * authenticity_weights[k] for k in authenticity_components)

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

            snapshots[program.id] = BehavioralSnapshot(
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
        return snapshots

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
    "BehavioralRawInputs",
    "BehavioralRawSeries",
]
