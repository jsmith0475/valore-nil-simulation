'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { NarrativePanel } from './NarrativePanel';
import { AgentStream } from './AgentStream';
import { DashboardTabs } from './DashboardTabs';

type PersonaKey = 'athletic_director' | 'coach' | 'compliance';

const personas: Record<PersonaKey, { label: string; description: string; prompt: string }> = {
  athletic_director: {
    label: 'Athletic Director',
    description: 'Prioritize multi-year roster health, donor energy, and transparency for presidents and boards.',
    prompt: 'Summarize NIL leverage for the athletic director, highlighting recruiting, donor momentum, and compliance posture.',
  },
  coach: {
    label: 'Coach',
    description: 'Focus on game-week matchups, player momentum, and how NIL arcs reinforce leadership in the locker room.',
    prompt: 'Produce a coaching briefing linking NIL momentum to on-court strategy, player psychology, and lineup decisions.',
  },
  compliance: {
    label: 'Compliance Officer',
    description: 'Zero in on disclosure status, fairness metrics, and risk mitigations across conference and state rules.',
    prompt: 'Create a compliance summary explaining risk posture, disclosures, fairness safeguards, and audit readiness.',
  },
};

type Program = {
  id: string;
  name: string;
  conference: string;
  phase: string;
  metrics: { nil_baseline: number; community_highlights: string[] };
};

type Scenario = {
  id: string;
  program_id: string;
  opponent: string;
  win_probability: number;
  nil_uplift: number;
  lineup: string[];
};

type Metrics = {
  valuation_accuracy: number;
  demographic_parity: number;
  athlete_earnings_lift: number;
  compliance_cost_reduction: number;
};

type Props = {
  programs: Program[];
  scenarios: Scenario[];
  metrics: Metrics | null;
  initialMode?: DataMode;
};

type DataMode = 'simulation' | 'emulation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type SyntheticUpdatePayload = {
  program_id: string;
  timestamp: number;
  scores: {
    psr_score: number;
    authenticity_score: number;
    fairness_index: number;
    compliance_risk: number;
    valuation_projection: number;
    sponsor_velocity: number;
  };
  diff?: Record<string, number>;
};

type BehavioralComponents = {
  psr: Record<string, number>;
  authenticity: Record<string, number>;
};

type SyntheticScenarioSummary = {
  id: string;
  opponent: string;
  win_probability: number;
  nil_uplift: number;
  lineup: string[];
  fan_sentiment: number[];
};

type FeedItem = {
  id: string;
  category: string;
  source: string;
  headline: string;
  snippet: string;
  sentiment: number;
  impact_score: number;
  timestamp: number;
  tags: string[];
  athlete_id?: string;
  athlete_name?: string;
};

type FeedDisplayItem = FeedItem & {
  programName: string;
  athleteName: string;
};

type SyntheticAthleteSummary = {
  athlete: {
    id: string;
    name: string;
    position: string;
    archetype: string;
    class_year?: string;
  };
  scores: {
    psr_score: number;
    authenticity_score: number;
    fairness_index: number;
    compliance_risk: number;
    valuation_projection: number;
    engagement_velocity: number;
  };
  components: BehavioralComponents | null;
  raw_inputs: {
    sentiment_mean: number;
    sentiment_volatility: number;
    interactions_weekly: number;
    interactions_baseline: number;
    content_similarity: number;
    share_rate: number;
    retention_rate: number;
    churn_shock: number;
    stability_index: number;
    schedule_volatility: number;
  } | null;
  raw_samples: {
    sentiment_daily: number[];
    interactions_daily: number[];
    share_rate_daily: number[];
  } | null;
  agent_metrics: Record<string, Record<string, number>>;
  feed_items: FeedItem[];
};

type SyntheticProgramSummary = {
  program: Program;
  scores: {
    psr_score: number;
    authenticity_score: number;
    social_identity_index: number;
    fairness_index: number;
    compliance_risk: number;
    valuation_projection: number;
    sponsor_velocity: number;
  } | null;
  components: BehavioralComponents | null;
  raw_inputs: {
    sentiment_mean: number;
    sentiment_volatility: number;
    interactions_weekly: number;
    interactions_baseline: number;
    content_similarity: number;
    share_rate: number;
    retention_rate: number;
    churn_shock: number;
    stability_index: number;
    schedule_volatility: number;
  } | null;
  raw_samples: {
    sentiment_daily: number[];
    interactions_daily: number[];
    share_rate_daily: number[];
    retention_monthly: number[];
    churn_events: number[];
  } | null;
  scenarios: SyntheticScenarioSummary[];
  athletes: SyntheticAthleteSummary[];
};

type SyntheticOverview = {
  seed: number;
  generated_at: number;
  metrics: Metrics;
  programs: SyntheticProgramSummary[];
};

const agentConfigs = [
  {
    id: 'social_media',
    name: 'Social Media Analysis Agent',
    description: 'Separates authentic engagement arcs from short-lived viral noise across platforms.',
    emphasis: 'engagement_authenticity',
    metrics: [
      { key: 'engagement_authenticity', label: 'Engagement Authenticity' },
      { key: 'sentiment_intensity', label: 'Sentiment Intensity' },
      { key: 'virality_potential', label: 'Virality Potential' },
      { key: 'platform_fit', label: 'Platform Fit' },
      { key: 'authenticity_detection', label: 'Authenticity Detection' },
    ],
  },
  {
    id: 'athletic_performance',
    name: 'Athletic Performance Agent',
    description: 'Quantifies contribution within competitive context, durability, and locker-room leadership.',
    emphasis: 'stat_efficiency',
    metrics: [
      { key: 'stat_efficiency', label: 'Stat Efficiency' },
      { key: 'context_adjustment', label: 'Context Adjustment' },
      { key: 'injury_risk', label: 'Injury Risk' },
      { key: 'pro_projection', label: 'Pro Projection' },
      { key: 'leadership_signal', label: 'Leadership Signal' },
    ],
  },
  {
    id: 'market_intelligence',
    name: 'Market Intelligence Agent',
    description: 'Maps comparable deals, sponsor appetite, and economic tailwinds for NIL offers.',
    emphasis: 'comp_deal_alignment',
    metrics: [
      { key: 'comp_deal_alignment', label: 'Comparable Deal Alignment' },
      { key: 'market_timing', label: 'Market Timing' },
      { key: 'brand_demand', label: 'Brand Demand' },
      { key: 'economic_context', label: 'Economic Context' },
      { key: 'competitive_position', label: 'Competitive Position' },
    ],
  },
  {
    id: 'brand_alignment',
    name: 'Brand Alignment Agent',
    description: 'Evaluates values fit, narrative resonance, and activation readiness for partnership briefs.',
    emphasis: 'values_match',
    metrics: [
      { key: 'values_match', label: 'Values Match' },
      { key: 'story_resonance', label: 'Story Resonance' },
      { key: 'activation_readiness', label: 'Activation Readiness' },
    ],
  },
  {
    id: 'psychology',
    name: 'Psychological Profile Agent',
    description: 'Measures fan identity strength, influence mechanics, and trust momentum.',
    emphasis: 'fan_identity_tie',
    metrics: [
      { key: 'fan_identity_tie', label: 'Fan Identity Tie' },
      { key: 'influence_score', label: 'Influence Score' },
      { key: 'trust_velocity', label: 'Trust Velocity' },
    ],
  },
  {
    id: 'risk_compliance',
    name: 'Risk & Compliance Agent',
    description: 'Monitors disclosure cadence, policy changes, and potential audit exposure.',
    emphasis: 'regulatory_score',
    metrics: [
      { key: 'regulatory_score', label: 'Regulatory Score' },
      { key: 'disclosure_health', label: 'Disclosure Health' },
      { key: 'audit_risk', label: 'Audit Risk' },
    ],
  },
  {
    id: 'ethics',
    name: 'Ethics Oversight Agent',
    description: 'Guards against bias drift, monitors fairness, and signals when interventions are needed.',
    emphasis: 'ethics_confidence',
    metrics: [
      { key: 'bias_index', label: 'Bias Index' },
      { key: 'fairness_drift', label: 'Fairness Drift' },
      { key: 'ethics_confidence', label: 'Ethics Confidence' },
    ],
  },
] as const;

const feedSections = [
  {
    title: 'Social & Community',
    description: 'Fan buzz, creator clips, and community touchpoints influencing parasocial strength.',
    categories: ['social', 'community'],
  },
  {
    title: 'News & Market Signals',
    description: 'Media narratives, collective chatter, and agent-triggered signals shaping demand.',
    categories: ['news', 'signal'],
  },
  {
    title: 'Performance & Compliance',
    description: 'On-court analytics and governance updates feeding performance and compliance agents.',
    categories: ['performance', 'compliance'],
  },
] as const;

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#050713',
  color: '#e8ecff',
  padding: '4rem 1.5rem',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const sectionStyle: React.CSSProperties = {
  background: 'rgba(15, 20, 40, 0.8)',
  border: '1px solid rgba(90, 100, 150, 0.2)',
  borderRadius: '18px',
  padding: '2rem',
  boxShadow: '0 20px 60px rgba(2, 6, 23, 0.45)',
};

const cardStyle: React.CSSProperties = {
  borderRadius: '16px',
  border: '1px solid rgba(90, 100, 150, 0.25)',
  background: 'rgba(5, 10, 30, 0.85)',
  padding: '1.2rem',
  display: 'grid',
  gap: '.4rem',
};

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article style={cardStyle}>
      <span style={{ color: '#9aa7d1', fontSize: '.85rem' }}>{label}</span>
      <strong style={{ fontSize: '1.3rem', fontWeight: 600 }}>{value}</strong>
    </article>
  );
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = Math.max(1, now - timestamp);
  if (diff < 60) {
    return `${Math.floor(diff)}s ago`;
  }
  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`;
  }
  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`;
  }
  return `${Math.floor(diff / 86400)}d ago`;
}

export function ExperienceDashboard({ programs, scenarios, metrics, initialMode = 'simulation' }: Props) {
  const [persona, setPersona] = useState<PersonaKey>('athletic_director');
  const [dataMode, setDataMode] = useState<DataMode>(initialMode);
  const [modeLoading, setModeLoading] = useState(false);
  const [modeError, setModeError] = useState<string | null>(null);
  const [programData, setProgramData] = useState<Program[]>(programs);
  const [scenarioData, setScenarioData] = useState<Scenario[]>(scenarios);
  const [metricsData, setMetricsData] = useState<Metrics | null>(metrics);
  const [syntheticOverview, setSyntheticOverview] = useState<SyntheticOverview | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>(programs[0]?.id ?? '');
  const hasFetchedInitialSynthetic = useRef(false);
  const personaConfig = personas[persona];
  const [agentOverlays, setAgentOverlays] = useState<Record<string, { value: number; expiresAt: number }>>({});
  const [agentHighlights, setAgentHighlights] = useState<Record<string, { athleteId: string; metricKey: string; timestamp: number }>>({});

  useEffect(() => {
    if (!programData.length) {
      setSelectedProgram('');
      return;
    }
    const exists = programData.some(program => program.id === selectedProgram);
    if (!exists) {
      setSelectedProgram(programData[0].id);
    }
  }, [programData, selectedProgram]);

  const loadModeData = async (mode: DataMode) => {
    setModeLoading(true);
    setModeError(null);
    try {
      const queryParam = `mode=${mode}`;
      const programRequest = fetch(`${API_BASE}/programs/?${queryParam}`, { cache: 'no-store' }).then(res => {
        if (!res.ok) throw new Error('Programs request failed');
        return res.json();
      });
      const scenarioRequest = fetch(`${API_BASE}/scenarios/?${queryParam}`, { cache: 'no-store' }).then(res => {
        if (!res.ok) throw new Error('Scenarios request failed');
        return res.json();
      });
      const metricsRequest = fetch(`${API_BASE}/metrics/?${queryParam}`, { cache: 'no-store' })
        .then(res => (res.ok ? res.json() : null))
        .catch(() => null);
      const syntheticRequest =
        mode === 'emulation'
          ? fetch(`${API_BASE}/synthetic/overview/?${queryParam}`, { cache: 'no-store' }).then(res => {
              if (!res.ok) throw new Error('Synthetic overview request failed');
              return res.json();
            })
          : Promise.resolve(null);

      const [programResponse, scenarioResponse, metricsResponse, syntheticResponse] = await Promise.all([
        programRequest,
        scenarioRequest,
        metricsRequest,
        syntheticRequest,
      ]);
      setProgramData(programResponse as Program[]);
      setScenarioData(scenarioResponse as Scenario[]);
      setMetricsData((metricsResponse ?? null) as Metrics | null);
      setSyntheticOverview((syntheticResponse ?? null) as SyntheticOverview | null);
      setDataMode(mode);
    } catch (error) {
      setModeError(`Unable to load ${mode} data: ${(error as Error).message}`);
      if (mode !== dataMode) {
        setDataMode(mode);
      }
    } finally {
      setModeLoading(false);
    }
  };

  const handleModeSwitch = (mode: DataMode) => {
    if (mode === dataMode && !modeError) {
      return;
    }
    loadModeData(mode);
  };

  useEffect(() => {
    if (initialMode === 'emulation' && dataMode === 'emulation' && !hasFetchedInitialSynthetic.current) {
      hasFetchedInitialSynthetic.current = true;
      loadModeData('emulation');
    }
  }, [initialMode, dataMode]);

  const personaButtons = useMemo(
    () =>
      (Object.entries(personas) as [PersonaKey, (typeof personas)[PersonaKey]][]).map(([key, value]) => (
        <button
          key={key}
          type="button"
          onClick={() => setPersona(key)}
          style={{
            borderRadius: '999px',
            padding: '.55rem 1.4rem',
            border: key === persona ? '1px solid rgba(89, 131, 255, 0.8)' : '1px solid rgba(90, 100, 150, 0.35)',
            background:
              key === persona ? 'linear-gradient(135deg, rgba(89, 131, 255, 0.35), rgba(25, 211, 255, 0.25))' : 'rgba(5, 10, 30, 0.8)',
            color: '#e8ecff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {value.label}
        </button>
      )),
    [persona]
  );

  const programOptions = useMemo(
    () =>
      programData.map(program => (
        <option key={program.id} value={program.id}>
          {program.name}
        </option>
      )),
    [programData]
  );

  const agentEntriesByAgent = useMemo(() => {
    if (!syntheticOverview) return {} as Record<string, { athleteId: string; programName: string; athlete: SyntheticAthleteSummary['athlete']; metrics: Record<string, number> }[]>;
    const map: Record<string, { athleteId: string; programName: string; athlete: SyntheticAthleteSummary['athlete']; metrics: Record<string, number> }[]> = {};
    syntheticOverview.programs.forEach(programSummary => {
      (programSummary.athletes ?? []).forEach(athleteSummary => {
        const agentMetrics = athleteSummary.agent_metrics ?? {};
        Object.entries(agentMetrics).forEach(([agentId, metrics]) => {
          if (!map[agentId]) {
            map[agentId] = [];
          }
          map[agentId].push({
            athleteId: athleteSummary.athlete.id,
            programName: programSummary.program.name,
            athlete: athleteSummary.athlete,
            metrics: { ...metrics },
          });
        });
      });
    });
    return map;
  }, [syntheticOverview]);

  const feedBuckets = useMemo(() => {
    const buckets: Record<string, FeedDisplayItem[]> = {
      social: [],
      news: [],
      performance: [],
      community: [],
      compliance: [],
      signal: [],
      other: [],
    };
    if (!syntheticOverview) {
      return buckets;
    }
    syntheticOverview.programs.forEach(programSummary => {
      (programSummary.athletes ?? []).forEach(athleteSummary => {
        const athleteName = athleteSummary.athlete.name;
        const programName = programSummary.program.name;
        (athleteSummary.feed_items ?? []).forEach(item => {
          const category = buckets[item.category] ? item.category : 'other';
          buckets[category].push({
            ...item,
            athleteName: item.athlete_name ?? athleteName,
            programName,
          });
        });
      });
    });
    Object.values(buckets).forEach(list => list.sort((a, b) => b.timestamp - a.timestamp));
    return buckets;
  }, [syntheticOverview]);

  const highlightAthleteIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(agentHighlights).forEach(value => {
      if (value?.athleteId) {
        ids.add(value.athleteId);
      }
    });
    return ids;
  }, [agentHighlights]);

  useEffect(() => {
    setAgentOverlays({});
    setAgentHighlights({});
  }, [dataMode, syntheticOverview?.seed]);

  useEffect(() => {
    const cleanupInterval = window.setInterval(() => {
      const now = Date.now();
      setAgentOverlays(prev => {
        let mutated = false;
        const next: typeof prev = {};
        for (const [key, value] of Object.entries(prev)) {
          if (value.expiresAt > now) {
            next[key] = value;
          } else {
            mutated = true;
          }
        }
        return mutated ? next : prev;
      });
      setAgentHighlights(prev => {
        let mutated = false;
        const next: typeof prev = {};
        for (const [agentId, value] of Object.entries(prev)) {
          if (now - value.timestamp < 8000) {
            next[agentId] = value;
          } else {
            mutated = true;
          }
        }
        return mutated ? next : prev;
      });
    }, 5000);
    return () => window.clearInterval(cleanupInterval);
  }, []);

  useEffect(() => {
    if (dataMode !== 'emulation' || !syntheticOverview) {
      return;
    }
    const updateInterval = window.setInterval(() => {
      const playableAgents = Object.entries(agentEntriesByAgent).filter(([, entries]) => entries && entries.length > 0);
      if (!playableAgents.length) {
        return;
      }
      const [agentId, entries] = playableAgents[Math.floor(Math.random() * playableAgents.length)];
      const config = agentConfigs.find(cfg => cfg.id === agentId);
      if (!config || !entries?.length) {
        return;
      }
      const chosenEntry = entries[Math.floor(Math.random() * entries.length)];
      if (!chosenEntry) {
        return;
      }
      const metricOptions = config.metrics;
      if (!metricOptions.length) {
        return;
      }
      const chosenMetric = metricOptions[Math.floor(Math.random() * metricOptions.length)];
      const baseValue = chosenEntry.metrics[chosenMetric.key] ?? 0;
      const delta = (Math.random() - 0.5) * 0.08;
      const newValue = Math.min(1, Math.max(0, baseValue + delta));
      const overlayKey = `${agentId}::${chosenEntry.athleteId}::${chosenMetric.key}`;
      const now = Date.now();
      setAgentOverlays(prev => ({
        ...prev,
        [overlayKey]: { value: newValue, expiresAt: now + 20000 },
      }));
      setAgentHighlights(prev => ({
        ...prev,
        [agentId]: { athleteId: chosenEntry.athleteId, metricKey: chosenMetric.key, timestamp: now },
      }));
    }, 14000 + Math.random() * 4000);
    return () => window.clearInterval(updateInterval);
  }, [dataMode, agentEntriesByAgent, syntheticOverview]);

  const dashboardContent = (
    <>
      <section style={{ ...sectionStyle, display: 'grid', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', justifyContent: 'center' }}>{personaButtons}</div>
        <p style={{ color: '#9aa7d1', textAlign: 'center', fontSize: '.95rem' }}>{personaConfig.description}</p>
        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', alignItems: 'center' }}>
          <label style={{ fontSize: '.9rem', color: '#9aa7d1' }}>Focus program:</label>
          <select
            value={selectedProgram}
            onChange={event => setSelectedProgram(event.target.value)}
            style={{
              background: 'rgba(5, 10, 30, 0.85)',
              color: '#e8ecff',
              border: '1px solid rgba(90, 100, 150, 0.35)',
              borderRadius: '12px',
              padding: '.45rem .75rem',
            }}
          >
            {programOptions}
          </select>
        </div>
      </section>

      <section style={sectionStyle}>
        <NarrativePanel persona={persona} personaPrompt={personaConfig.prompt} mode={dataMode} />
      </section>

      <section style={sectionStyle}>
        {metricsData ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Impact Metrics Preview</h2>
              <p style={{ color: '#9aa7d1' }}>
                Snapshot of Phase 1 validation targets: accuracy, fairness, athlete outcomes, and compliance efficiency.
              </p>
            </div>
            <div
              style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              }}
            >
              <MetricCard label="Valuation Accuracy" value={`${(metricsData.valuation_accuracy * 100).toFixed(1)}%`} />
              <MetricCard label="Demographic Parity" value={`${(metricsData.demographic_parity * 100).toFixed(1)}%`} />
              <MetricCard label="Athlete Earnings Lift" value={`${(metricsData.athlete_earnings_lift * 100).toFixed(1)}%`} />
              <MetricCard label="Compliance Cost Reduction" value={`${(metricsData.compliance_cost_reduction * 100).toFixed(1)}%`} />
            </div>
          </div>
        ) : (
          <p style={{ color: '#9aa7d1', fontSize: '.9rem' }}>
            Metrics unavailable. Ensure the backend `/metrics/` endpoint is reachable.
          </p>
        )}
      </section>

      <section style={sectionStyle}>
        <AgentStream persona={persona} programId={selectedProgram} mode={dataMode} />
      </section>

      <section style={sectionStyle}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Matchup Scenario Preview</h2>
            <p style={{ color: '#9aa7d1' }}>
              {dataMode === 'emulation'
                ? 'Synthetic emulation scenarios with dynamic win probability, lineup blends, and NIL uplift signals.'
                : 'Mock scenario data with win probability, lineup composition, and NIL uplift signals.'}
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {scenarioData.map(scenario => {
              const isFocused = scenario.program_id === selectedProgram;
              return (
                <article
                  key={scenario.id}
                  style={{
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: isFocused
                      ? '1px solid rgba(89, 131, 255, 0.65)'
                      : '1px solid rgba(90, 100, 150, 0.25)',
                    background: isFocused ? 'rgba(25, 211, 255, 0.12)' : 'rgba(5, 10, 30, 0.85)',
                    display: 'grid',
                    gap: '.5rem',
                  }}
                >
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                    {scenario.program_id.replace('_', ' ').toUpperCase()} vs {scenario.opponent}
                  </h3>
                  <p style={{ color: '#9aa7d1', fontSize: '.9rem' }}>
                    Win Probability: {(scenario.win_probability * 100).toFixed(1)}%
                  </p>
                  <p style={{ color: '#9aa7d1', fontSize: '.9rem' }}>
                    NIL Uplift: {(scenario.nil_uplift * 100).toFixed(1)}%
                  </p>
                  <div style={{ color: '#9aa7d1', fontSize: '.85rem' }}>
                    <p>Lineup:</p>
                    <ul style={{ margin: '.4rem 0 0 1rem', padding: 0 }}>
                      {scenario.lineup.map(athlete => (
                        <li key={athlete}>{athlete}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Program Constellation Preview</h2>
            <p style={{ color: '#9aa7d1' }}>
              {dataMode === 'emulation'
                ? 'Synthetic program constellations generated by the behavioral emulation engine.'
                : 'Live data from the FastAPI backend showcasing Phase 1 programs.'}
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {programData.map(program => (
              <article
                key={program.id}
                style={{
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: program.id === selectedProgram
                      ? '1px solid rgba(89, 131, 255, 0.65)'
                      : '1px solid rgba(90, 100, 150, 0.25)',
                  background: program.id === selectedProgram
                      ? 'rgba(25, 211, 255, 0.12)'
                      : 'rgba(5, 10, 30, 0.85)',
                  display: 'grid',
                  gap: '.6rem',
                }}
              >
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{program.name}</h3>
                <p style={{ color: '#9aa7d1', fontSize: '.9rem' }}>Conference: {program.conference}</p>
                <p style={{ color: '#9aa7d1', fontSize: '.9rem' }}>Phase: {program.phase}</p>
                <p style={{ fontSize: '.95rem' }}>
                  {`NIL Baseline: $${program.metrics.nil_baseline.toLocaleString()}`}
                </p>
                <div style={{ color: '#9aa7d1', fontSize: '.85rem' }}>
                  <p>Community Highlights:</p>
                  <ul style={{ margin: '.4rem 0 0 1rem', padding: 0 }}>
                    {program.metrics.community_highlights.map(item => (
                      <li key={item} style={{ marginBottom: '.25rem' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const aboutContent = (
    <section style={{ ...sectionStyle, display: 'grid', gap: '1.4rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>What Is VALORE NIL Simulation?</h2>
      <p style={{ color: '#9aa7d1', lineHeight: 1.7 }}>
        This interactive experience showcases Phase&nbsp;1 of VALORE&apos;s multi-agent NIL intelligence platform. It simulates how our
        behavioral AI stack evaluates men&apos;s and women&apos;s basketball programs (Auburn, Sacramento State, Houston, Gonzaga, Kansas,
        Villanova, South Carolina, Stanford, Louisville) to support athlete, brand, and university decisions.
      </p>
      <article style={cardStyle}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>What Is NIL?</h3>
        <p style={{ color: '#9aa7d1', lineHeight: 1.65 }}>
          NIL stands for Name, Image, and Likeness rights—modern regulations that let NCAA athletes monetize their personal brands while
          maintaining eligibility. Deals range from local sponsorships to national media and creator collaborations, turning fan passion
          into financial opportunity for student-athletes.
        </p>
      </article>
      <article style={cardStyle}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Why NIL Valuation Is Difficult</h3>
        <ul style={{ margin: '.4rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
          <li>Surface metrics (followers, likes) miss emotional depth and loyalty dynamics.</li>
          <li>Regulations shift across states, universities, and conferences, making compliance fragile.</li>
          <li>Deals work only when athlete identity, community culture, and brand objectives align.</li>
          <li>Bias and inequity can emerge without transparent, auditable decision trails.</li>
        </ul>
      </article>
      <article style={cardStyle}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>How This Simulation Responds</h3>
        <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
          VALORE deploys seven collaborating AI agents (social media, market intelligence, brand alignment, psychological profiling,
          risk/compliance, ethics oversight, and consensus orchestration). Together they generate persona-aware narratives, valuation
          snapshots, fairness metrics, and live negotiation evidence anchored in behavioral science.
        </p>
        <ul style={{ margin: '.4rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
          <li>Blends parasocial, authenticity, and social identity modeling with market signals.</li>
          <li>Surfaces demographic parity, compliance posture, and remediation prompts in real time.</li>
          <li>Produces scenario briefs for athletic departments, collectives, and brand partners.</li>
        </ul>
      </article>
      <article style={cardStyle}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Why It Matters</h3>
        <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
          By merging psychology, sociology, economics, and AI governance, Phase&nbsp;1 aims to deliver fairer athlete outcomes, stronger
          sponsor returns, and compliance-ready evidence trails that stakeholders and regulators can trust.
        </p>
      </article>
      <small style={{ color: '#6f7aa5' }}>
        Dive deeper via `Background/Context Brief.md`, `Background/paper.md`, and `Background/multi-agentic NIL.md`.
      </small>
    </section>
  );

  const dataContent = (
    <section style={{ ...sectionStyle, display: 'grid', gap: '1.4rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Behavioral Data Inputs</h2>
      <p style={{ color: '#9aa7d1', lineHeight: 1.7 }}>
        The platform expects human-centered telemetry—both observed and synthetic. Streams (social sentiment, interaction cadence,
        creator content embeddings, retention/loyalty panels, compliance disclosures) are consent-aware, audited, and fused through the
        multi-agent orchestrator to power parasocial, authenticity, and fairness scoring. In Emulation mode these feeds are generated
        statistically so we can stress-test the behavioral stack before live integrations come online.
      </p>
      <article style={cardStyle}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Digital Relationship Signals</h3>
        <ul style={{ margin: '.4rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
          <li>Social graph APIs (public + partner) capturing follower topology, co-engagement, and per-channel interaction cadence.</li>
          <li>Livestream/chat telemetry, Q&amp;A transcripts, and sentiment classifiers that drive EI and IF in the PSR model.</li>
          <li>Creator content embeddings and semantic similarity metrics that shape CR, plus share/quote trains informing LI.</li>
        </ul>
        <small style={{ color: '#6f7aa5' }}>Supports Parasocial Relationship Score (EI, IF, CR, LI, TC).</small>
      </article>
      <article style={cardStyle}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Identity &amp; Sentiment Panels</h3>
        <ul style={{ margin: '.4rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
          <li>Longitudinal fan surveys via NIL collectives and athletic departments to calibrate loyalty + trust baselines.</li>
          <li>Moderator-reviewed community forums, booster channels, and alumni networks for qualitative authenticity cues.</li>
          <li>Compliance-approved psychographic data (e.g., values, passion archetypes) aggregated at cohort level.</li>
        </ul>
        <small style={{ color: '#6f7aa5' }}>Feeds Authenticity and Social Identity dimensions (C, VA, BC, CS, TS).</small>
      </article>
      <article style={cardStyle}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Performance &amp; Market Intelligence</h3>
        <ul style={{ margin: '.4rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
          <li>NCAA and partner stat feeds for player efficiency, trajectory, health/travel context, and availability shocks.</li>
          <li>Sponsorship deal databases, marketplace listings, collective disclosures, and transactional comps for valuation anchoring.</li>
          <li>Macroeconomic and regional spend indicators (Bureau of Labor data, NIL marketplaces, ticketing trends).</li>
        </ul>
        <small style={{ color: '#6f7aa5' }}>Used by Market Intelligence, Brand Alignment, and Scenario agents.</small>
      </article>
      <article style={cardStyle}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Risk, Compliance, &amp; Governance</h3>
        <ul style={{ margin: '.4rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
          <li>State/NCAA policy registries, school-specific contract templates, and disclosure filings.</li>
          <li>Background screening partners for agent/brand vetting and conflict-of-interest detection.</li>
          <li>Bias/fairness telemetry capturing demographic parity, resource allocation, and remediation history.</li>
        </ul>
        <small style={{ color: '#6f7aa5' }}>Guides Ethics Oversight and Compliance agents; logged for audits.</small>
      </article>
      <article style={cardStyle}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Real-Time Activation Data</h3>
        <ul style={{ margin: '.4rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
          <li>Event attendance, QR activations, merch/collective sales, CRM conversions, and donor pledges tied to campaigns.</li>
          <li>Media monitoring (broadcast, podcast, creator collabs) for lift attribution across channels.</li>
          <li>Secure OpenAI/GPT outputs (when enabled) to ground narrative generation and agent evidence trails in the latest insights.</li>
        </ul>
        <small style={{ color: '#6f7aa5' }}>Closes the loop with athlete ROI dashboards and sponsor reporting.</small>
      </article>
      <small style={{ color: '#6f7aa5' }}>
        All data sources adhere to NIL-specific consent agreements, FERPA/GDPR guidance, and VALORE&apos;s ethics charter. Synthetic data powers
        this demo; production deployments integrate partner feeds listed above.
      </small>
    </section>
  );

  const syntheticContent = (
    <section style={{ ...sectionStyle, display: 'grid', gap: '1.4rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Synthetic Emulation Snapshot</h2>
      <p style={{ color: '#9aa7d1', lineHeight: 1.7 }}>
        Synthetic emulation lets us rehearse the valuation pipeline without waiting on production feeds. We fabricate raw behavioral
        signals (sentiment traces, interaction logs, cohort retention, activation lift) and then recompute Parasocial, Authenticity, Fairness,
        and compliance metrics exactly as the live system would. This tab exposes the “why” behind each score so stakeholders unfamiliar with
        the program can inspect the drivers.
      </p>
      {dataMode !== 'emulation' ? (
        <article style={cardStyle}>
          <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
            Switch to Emulation mode to activate synthetic data. The Simulation dataset remains static for quick demos and comparisons.
          </p>
        </article>
      ) : modeLoading ? (
        <article style={cardStyle}>
          <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>Loading synthetic snapshot…</p>
        </article>
      ) : syntheticOverview ? (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <article style={cardStyle}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ color: '#9aa7d1', fontSize: '.9rem' }}>Seed: {syntheticOverview.seed}</span>
              <span style={{ color: '#9aa7d1', fontSize: '.9rem' }}>
                Generated: {new Date(syntheticOverview.generated_at * 1000).toLocaleString()}
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gap: '.8rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                marginTop: '.8rem',
              }}
            >
              <MetricCard
                label="Synthetic Valuation Accuracy"
                value={`${(syntheticOverview.metrics.valuation_accuracy * 100).toFixed(1)}%`}
              />
              <MetricCard
                label="Synthetic Demographic Parity"
                value={`${(syntheticOverview.metrics.demographic_parity * 100).toFixed(1)}%`}
              />
              <MetricCard
                label="Synthetic Earnings Lift"
                value={`${(syntheticOverview.metrics.athlete_earnings_lift * 100).toFixed(1)}%`}
              />
              <MetricCard
                label="Synthetic Compliance Savings"
                value={`${(syntheticOverview.metrics.compliance_cost_reduction * 100).toFixed(1)}%`}
              />
            </div>
          </article>
          <div
            style={{
              display: 'grid',
              gap: '1.2rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            }}
          >
            {syntheticOverview.programs.map(summary => {
              const {
                program,
                scores,
                components,
                raw_inputs: rawInputs,
                raw_samples: rawSamples,
                scenarios: syntheticScenarios,
                athletes: syntheticAthletes = [],
              } = summary;
              return (
                <article key={program.id} style={cardStyle}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{program.name}</h3>
                  <p style={{ color: '#9aa7d1', fontSize: '.9rem' }}>Conference: {program.conference}</p>
                  <p style={{ color: '#9aa7d1', fontSize: '.9rem' }}>NIL Baseline: ${program.metrics.nil_baseline.toLocaleString()}</p>
                  {scores ? (
                    <div style={{ display: 'grid', gap: '.4rem', fontSize: '.85rem', color: '#9aa7d1' }}>
                      <div>
                        <strong style={{ color: '#e8ecff' }}>Parasocial Score:</strong>{' '}
                        {scores.psr_score.toFixed(2)}
                      </div>
                      <div>
                        <strong style={{ color: '#e8ecff' }}>Authenticity Score:</strong>{' '}
                        {scores.authenticity_score.toFixed(2)}
                      </div>
                      <div>
                        <strong style={{ color: '#e8ecff' }}>Fairness Index:</strong>{' '}
                        {(scores.fairness_index * 100).toFixed(1)}%
                      </div>
                      <div>
                        <strong style={{ color: '#e8ecff' }}>Compliance Risk:</strong>{' '}
                        {(scores.compliance_risk * 100).toFixed(1)}%
                      </div>
                      <div>
                        <strong style={{ color: '#e8ecff' }}>Valuation Projection:</strong>{' '}
                        ${scores.valuation_projection.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <p style={{ color: '#9aa7d1', fontSize: '.85rem' }}>Behavioral snapshot unavailable.</p>
                  )}
                  {rawInputs && (
                    <div style={{ marginTop: '.6rem', color: '#9aa7d1', fontSize: '.82rem' }}>
                      <p style={{ color: '#e8ecff', fontSize: '.9rem', marginBottom: '.3rem' }}>Raw Signal Averages</p>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                        <li>
                          Sentiment mean (30d): {rawInputs.sentiment_mean.toFixed(2)} (σ {rawInputs.sentiment_volatility.toFixed(2)})
                        </li>
                        <li>
                          Weekly interactions: {Math.round(rawInputs.interactions_weekly).toLocaleString()} (baseline{' '}
                          {Math.round(rawInputs.interactions_baseline).toLocaleString()})
                        </li>
                        <li>Content resonance: {rawInputs.content_similarity.toFixed(2)}</li>
                        <li>Share rate: {(rawInputs.share_rate * 100).toFixed(1)}%</li>
                        <li>Retention rate: {(rawInputs.retention_rate * 100).toFixed(1)}%</li>
                      </ul>
                    </div>
                  )}
                  {components && (
                    <div style={{ marginTop: '.6rem', color: '#9aa7d1', fontSize: '.82rem' }}>
                      <p style={{ color: '#e8ecff', fontSize: '.9rem', marginBottom: '.3rem' }}>Component Breakdown</p>
                      <p style={{ margin: 0 }}>Parasocial (EI/IF/CR/LI/TC):{' '}
                        {Object.entries(components.psr)
                          .map(([key, value]) => `${key}:${value.toFixed(2)}`)
                          .join(' · ')}
                      </p>
                      <p style={{ margin: 0 }}>Authenticity (C/VA/BC/CS/TS):{' '}
                        {Object.entries(components.authenticity)
                          .map(([key, value]) => `${key}:${value.toFixed(2)}`)
                          .join(' · ')}
                      </p>
                    </div>
                  )}
                  {rawSamples && (
                    <div style={{ marginTop: '.6rem', color: '#9aa7d1', fontSize: '.82rem' }}>
                      <p style={{ color: '#e8ecff', fontSize: '.9rem', marginBottom: '.3rem' }}>Recent Trend Samples</p>
                      <p style={{ margin: 0 }}>
                        Sentiment (7d):{' '}
                        {rawSamples.sentiment_daily.map(v => v.toFixed(2)).join(', ')}
                      </p>
                      <p style={{ margin: 0 }}>
                        Interactions (7d):{' '}
                        {rawSamples.interactions_daily.map(v => v.toLocaleString()).join(', ')}
                      </p>
                      <p style={{ margin: 0 }}>
                        Share Rate (7d):{' '}
                        {rawSamples.share_rate_daily.map(v => (v * 100).toFixed(1) + '%').join(', ')}
                      </p>
                      <p style={{ margin: 0 }}>
                        Retention (monthly):{' '}
                        {rawSamples.retention_monthly.map(v => (v * 100).toFixed(1) + '%').join(', ')}
                      </p>
                      <p style={{ margin: 0 }}>
                        Churn events (synthetic incidents):{' '}
                        {rawSamples.churn_events.map(v => (v * 100).toFixed(1) + '%').join(', ')}
                      </p>
                    </div>
                  )}
                  {syntheticScenarios.length > 0 && (
                    <div style={{ marginTop: '.75rem' }}>
                      <p style={{ color: '#e8ecff', fontSize: '.9rem', marginBottom: '.35rem' }}>Scenario Highlights</p>
                      <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#9aa7d1', fontSize: '.85rem' }}>
                        {syntheticScenarios.map(s => (
                          <li key={s.id} style={{ marginBottom: '.35rem' }}>
                            vs {s.opponent} — Win {(s.win_probability * 100).toFixed(0)}%, NIL uplift {(s.nil_uplift * 100).toFixed(0)}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {syntheticAthletes.length > 0 && (
                    <div style={{ marginTop: '.75rem', color: '#9aa7d1', fontSize: '.82rem', display: 'grid', gap: '.45rem' }}>
                      <p style={{ color: '#e8ecff', fontSize: '.9rem', marginBottom: '.25rem' }}>Individual Signals</p>
                      {syntheticAthletes.map(athleteSummary => (
                        <div
                          key={athleteSummary.athlete.id}
                          style={{
                            borderRadius: '12px',
                            border: '1px solid rgba(56, 189, 248, 0.15)',
                            background: 'rgba(10, 20, 45, 0.7)',
                            padding: '.65rem .75rem',
                            display: 'grid',
                            gap: '.25rem',
                          }}
                        >
                          <p style={{ margin: 0, color: '#e8ecff', fontWeight: 600 }}>
                            {athleteSummary.athlete.name} — {athleteSummary.athlete.position}
                            {athleteSummary.athlete.archetype ? ` · ${athleteSummary.athlete.archetype}` : ''}
                          </p>
                          <p style={{ margin: 0 }}>
                            PSR {athleteSummary.scores.psr_score.toFixed(2)} · Authenticity {athleteSummary.scores.authenticity_score.toFixed(2)} · Engagement{' '}
                            {athleteSummary.scores.engagement_velocity.toFixed(2)}
                          </p>
                          <p style={{ margin: 0 }}>
                            Fairness {(athleteSummary.scores.fairness_index * 100).toFixed(1)}% · Compliance{' '}
                            {(athleteSummary.scores.compliance_risk * 100).toFixed(1)}% · Valuation ${athleteSummary.scores.valuation_projection.toLocaleString()}
                          </p>
                          {athleteSummary.raw_inputs && (
                            <p style={{ margin: 0 }}>
                              Sentiment {athleteSummary.raw_inputs.sentiment_mean.toFixed(2)} · Weekly interactions{' '}
                              {Math.round(athleteSummary.raw_inputs.interactions_weekly).toLocaleString()} · Share rate{' '}
                              {(athleteSummary.raw_inputs.share_rate * 100).toFixed(1)}%
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      ) : (
        <article style={cardStyle}>
          <p style={{ color: '#f87171', lineHeight: 1.6 }}>
                Synthetic overview unavailable. Check the `/synthetic/overview` endpoint or refresh the emulation mode.
              </p>
            </article>
          )}
    </section>
  );

  const agentsContent = (
    <section style={{ ...sectionStyle, display: 'grid', gap: '1.4rem' }}>
      <style>{`
        @keyframes agentPulse {
          0% { transform: scale(0.9); opacity: 0.4; }
          50% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.4; }
        }
      `}</style>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Specialized Agent Signals</h2>
      <p style={{ color: '#9aa7d1', lineHeight: 1.7 }}>
        Each VALORE agent emits synthetic telemetry for the current roster—spanning social graphs, performance context, market appetite,
        branding fit, psychology, compliance posture, and ethics guardrails. Switch to Emulation mode to watch these scores evolve in
        semi-real time.
      </p>
      {dataMode !== 'emulation' || !syntheticOverview ? (
        <article style={cardStyle}>
          <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
            Agent views require Emulation mode. Toggle the data mode above to load synthetic streams.
          </p>
        </article>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '1.2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}
        >
          {agentConfigs.map(config => {
            const now = Date.now();
            const rawEntries = agentEntriesByAgent[config.id] ?? [];
            const enrichedEntries = rawEntries.map(entry => {
              const metricsWithOverlay: Record<string, number> = { ...entry.metrics };
              config.metrics.forEach(metric => {
                const overlayKey = `${config.id}::${entry.athleteId}::${metric.key}`;
                const overlay = agentOverlays[overlayKey];
                if (overlay && overlay.expiresAt > now) {
                  metricsWithOverlay[metric.key] = overlay.value;
                }
              });
              return { ...entry, metrics: metricsWithOverlay };
            });
            const ranked = enrichedEntries
              .filter(entry => Object.keys(entry.metrics).length > 0)
              .sort((a, b) => (b.metrics[config.emphasis] ?? 0) - (a.metrics[config.emphasis] ?? 0))
              .slice(0, 4);

            const activeHighlight = agentHighlights[config.id];
            const highlightActive = activeHighlight && now - activeHighlight.timestamp < 6000;

            return (
              <article
                key={config.id}
                style={{
                  ...cardStyle,
                  border: highlightActive ? '1px solid rgba(34, 197, 94, 0.55)' : cardStyle.border,
                  boxShadow: highlightActive
                    ? '0 0 28px rgba(34, 197, 94, 0.18)'
                    : '0 20px 60px rgba(2, 6, 23, 0.45)',
                  background: highlightActive ? 'rgba(12, 32, 24, 0.88)' : cardStyle.background,
                  transition: 'border 0.4s ease, box-shadow 0.4s ease, background 0.4s ease',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{config.name}</h3>
                  {highlightActive && (
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: '#34d399',
                        boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)',
                        animation: 'agentPulse 1.2s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
                <p style={{ color: '#9aa7d1', fontSize: '.85rem', lineHeight: 1.6 }}>{config.description}</p>
                {ranked.length === 0 ? (
                  <p style={{ color: '#9aa7d1', fontSize: '.85rem' }}>No athlete samples yet. Trigger more emulation updates to populate this agent.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '.55rem' }}>
                    {ranked.map(entry => {
                      const isHighlighted = highlightActive && activeHighlight?.athleteId === entry.athleteId;
                      return (
                        <div
                          key={entry.athleteId}
                          style={{
                            position: 'relative',
                            border: isHighlighted ? '2px solid rgba(34, 197, 94, 0.65)' : '1px solid rgba(89, 131, 255, 0.18)',
                            borderRadius: '14px',
                            background: isHighlighted
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(14, 70, 40, 0.55))'
                              : 'rgba(5, 10, 30, 0.8)',
                            padding: '.8rem .95rem',
                            transition: 'background 0.3s ease, border 0.3s ease, transform 0.3s ease',
                            transform: isHighlighted ? 'scale(1.02)' : 'scale(1)',
                            boxShadow: isHighlighted ? '0 0 26px rgba(34, 197, 94, 0.25)' : 'none',
                          }}
                        >
                          {isHighlighted && (
                            <span
                              style={{
                                position: 'absolute',
                                top: 12,
                                right: 14,
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                background: '#34d399',
                                boxShadow: '0 0 10px rgba(52, 211, 153, 0.7)',
                                animation: 'agentPulse 1.5s ease-in-out infinite',
                              }}
                            />
                          )}
                          <p style={{ margin: 0, color: '#e8ecff', fontWeight: 600, fontSize: '.9rem' }}>
                            {entry.athlete.name} — {entry.athlete.position} · {entry.programName}
                          </p>
                          <p
                            style={{
                              margin: '.2rem 0',
                              color: isHighlighted ? '#bbf7d0' : '#88b4ff',
                              fontSize: '.82rem',
                              fontWeight: isHighlighted ? 600 : 500,
                            }}
                          >
                            {config.metrics.find(metric => metric.key === config.emphasis)?.label}:{' '}
                            {(entry.metrics[config.emphasis] ?? 0).toFixed(2)}
                          </p>
                          <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#9aa7d1', fontSize: '.8rem', display: 'grid', gap: '.15rem' }}>
                            {config.metrics
                              .filter(metric => metric.key !== config.emphasis)
                              .map(metric => {
                                const value = entry.metrics[metric.key] ?? 0;
                                return (
                                  <li key={metric.key}>
                                    <span
                                      style={{
                                        color: isHighlighted ? '#d1fae5' : '#9aa7d1',
                                        fontWeight: isHighlighted ? 600 : 400,
                                      }}
                                    >
                                      {metric.label}: {value.toFixed(2)}
                                    </span>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );

  const feedsContent = (
    <section style={{ ...sectionStyle, display: 'grid', gap: '1.4rem' }}>
      <style>{`
        @keyframes agentPulse {
          0% { transform: scale(0.9); opacity: 0.4; }
          50% { transform: scale(1.25); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.4; }
        }
      `}</style>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Live Intelligence Feeds</h2>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '.6rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(25, 45, 95, 0.45)',
          border: '1px solid rgba(89, 131, 255, 0.35)',
          borderRadius: '12px',
          padding: '.65rem .9rem',
        }}
      >
        <span style={{ color: '#9aa7d1', fontSize: '.85rem' }}>
          Need the full mapping of Live Feed signals to agent calculus?
        </span>
        <Link
          href="/feeds-intelligence"
          prefetch={false}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.35rem',
            borderRadius: '999px',
            padding: '.35rem .85rem',
            border: '1px solid rgba(89, 131, 255, 0.55)',
            background: 'linear-gradient(135deg, rgba(89, 131, 255, 0.25), rgba(25, 211, 255, 0.2))',
            color: '#e8ecff',
            fontSize: '.8rem',
            fontWeight: 600,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          View Explainer →
        </Link>
      </div>
      <p style={{ color: '#9aa7d1', lineHeight: 1.7 }}>
        Synthetic social, news, performance, and compliance signals illustrate the raw evidence streams each agent ingests. Entries update
        alongside agent pulses to mirror how VALORE synthesizes incoming NIL telemetry.
      </p>
      {dataMode !== 'emulation' || !syntheticOverview ? (
        <article style={cardStyle}>
          <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
            Switch to Emulation mode to animate the live feeds and watch agent highlights sync with new evidence drops.
          </p>
        </article>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '1.25rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}
        >
          {feedSections.map(section => {
            const items = section.categories.flatMap(category => feedBuckets[category] ?? []);
            const topItems = items.slice(0, 6);
            return (
              <article key={section.title} style={{ ...cardStyle, gap: '.8rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{section.title}</h3>
                  <p style={{ color: '#9aa7d1', fontSize: '.85rem', lineHeight: 1.6 }}>{section.description}</p>
                </div>
                {topItems.length === 0 ? (
                  <p style={{ color: '#9aa7d1', fontSize: '.85rem' }}>No recent entries. Trigger more emulation updates to populate this stream.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '.75rem' }}>
                    {topItems.map(item => {
                      const highlighted = item.athlete_id ? highlightAthleteIds.has(item.athlete_id) : false;
                      return (
                        <div
                          key={item.id}
                          style={{
                            borderRadius: '14px',
                            border: highlighted ? '1px solid rgba(34, 197, 94, 0.55)' : '1px solid rgba(90, 110, 160, 0.25)',
                            background: highlighted
                              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(12, 32, 24, 0.6))'
                              : 'rgba(5, 10, 35, 0.85)',
                            padding: '.85rem 1rem',
                            boxShadow: highlighted ? '0 0 24px rgba(34, 197, 94, 0.2)' : 'none',
                            transition: 'background 0.3s ease, border 0.3s ease',
                            position: 'relative',
                          }}
                        >
                          {highlighted && (
                            <span
                              style={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: '#34d399',
                                boxShadow: '0 0 10px rgba(52, 211, 153, 0.6)',
                                animation: 'agentPulse 1.4s ease-in-out infinite',
                              }}
                            />
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.35rem' }}>
                            <Link
                              href="/feeds-intelligence"
                              prefetch={false}
                              title="See how agent calculus converts Live Feed signals"
                              style={{
                                fontSize: '.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '.08em',
                                padding: '.15rem .45rem',
                                borderRadius: '999px',
                                background: 'rgba(89, 131, 255, 0.18)',
                                color: '#c7d2fe',
                                textDecoration: 'none',
                              }}
                            >
                              {item.source}
                            </Link>
                            <span style={{ color: '#9aa7d1', fontSize: '.75rem' }}>{formatTimeAgo(item.timestamp)}</span>
                          </div>
                          <h4 style={{ margin: 0, fontSize: '.95rem', color: highlighted ? '#f0fdf4' : '#e8ecff' }}>{item.headline}</h4>
                          <p style={{ margin: '.35rem 0', color: '#9aa7d1', fontSize: '.85rem', lineHeight: 1.5 }}>{item.snippet}</p>
                          <p style={{ margin: 0, color: '#9aa7d1', fontSize: '.8rem' }}>
                            {item.athleteName} · {item.programName}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginTop: '.45rem' }}>
                            <span style={{ color: '#9aa7d1', fontSize: '.75rem' }}>Sentiment {(item.sentiment * 100).toFixed(0)}%</span>
                            <span style={{ color: '#9aa7d1', fontSize: '.75rem' }}>Impact {(item.impact_score * 100).toFixed(0)}%</span>
                            {item.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                style={{
                                  fontSize: '.7rem',
                                  color: '#7dd3fc',
                                  background: 'rgba(125, 211, 252, 0.15)',
                                  padding: '.12rem .4rem',
                                  borderRadius: '999px',
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );

  const howToContent = (
    <section style={{ ...sectionStyle, display: 'grid', gap: '1.4rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>How to Use This Simulation</h2>
      <p style={{ color: '#9aa7d1', lineHeight: 1.7 }}>
        Move through each module to experience how VALORE&apos;s multi-agent system surfaces NIL intelligence. Start with the controls at the
        top of the Experience tab, then progress through narratives, live evidence, scenarios, and validation metrics.
      </p>
      <div style={{ display: 'grid', gap: '1.1rem' }}>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>1. Switch Modes</h3>
          <ul style={{ margin: '.35rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
            <li>Use the Simulation/Emulation toggle to move between static mocks and synthetic stress tests.</li>
            <li>Emulation pulls from behavioral generators, streaming fresh agent evidence and fairness outcomes.</li>
          </ul>
        </article>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>2. Persona &amp; Program Focus</h3>
          <ul style={{ margin: '.35rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
            <li>Choose a stakeholder persona (e.g., AD, Collective, Brand) to shift tone, KPIs, and agent priorities.</li>
            <li>Set the primary program to align downstream scenarios, valuation baselines, and fairness callouts.</li>
          </ul>
        </article>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>3. Narrative Generator</h3>
          <ul style={{ margin: '.35rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
            <li>With an OpenAI key in `.env`, generate persona-aware briefings anchored in current evidence.</li>
            <li>Without a key, review the stub output to understand the storyline structure and data hooks.</li>
          </ul>
        </article>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>4. Agent Negotiation Stream</h3>
          <ul style={{ margin: '.35rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
            <li>Watch evidence packets arrive from the social, market, risk, and ethics agents via WebSocket.</li>
            <li>Note consensus summaries, confidence scores, and bias/compliance alerts when the Ethics agent intervenes.</li>
          </ul>
        </article>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>5. Impact Metrics Panel</h3>
          <ul style={{ margin: '.35rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
            <li>Track valuation accuracy, demographic parity, athlete earnings lift, and compliance efficiency targets.</li>
            <li>Use these KPIs to validate negotiation decisions or identify where remediation work is required.</li>
          </ul>
        </article>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>6. Scenario Explorer</h3>
          <ul style={{ margin: '.35rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
            <li>Review matchup briefs with win probability, NIL uplift, and blended rosters across Phase&nbsp;1 programs.</li>
            <li>Use scenario data to illustrate how multi-program collaboration boosts cross-market reach.</li>
          </ul>
        </article>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>7. Program Constellation</h3>
          <ul style={{ margin: '.35rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.6 }}>
            <li>Scan baseline valuations, conference context, and community highlights for each men&apos;s and women&apos;s program.</li>
            <li>Toggle programs to align the live dashboard with recruiting, donor, or sponsor conversations.</li>
          </ul>
        </article>
      </div>
      <small style={{ color: '#6f7aa5' }}>
        Local setup: export variables from `.env`, run `poetry run uvicorn app.main:app --port 8000`, then `npm run dev` inside `/Simulation2/ui`.
      </small>
    </section>
  );

  const theoryContent = (
    <section style={{ ...sectionStyle, display: 'grid', gap: '1.4rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 600 }}>Behavioral Science Foundations</h2>
      <p style={{ color: '#9aa7d1', lineHeight: 1.7 }}>
        VALORE grounds NIL valuation in peer-reviewed research spanning psychology, sociology, economics, and AI governance.
        Each agent blends these theories to deliver fair, explainable results.
      </p>
      <div style={{ display: 'grid', gap: '1.2rem' }}>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Parasocial Relationship Theory</h3>
          <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
            Horton &amp; Wohl showed that fans form one-sided emotional bonds with public figures. VALORE translates livestream cadence,
            comment reciprocity, and sentiment stability into EI, IF, CR, LI, and TC components which together form the Parasocial Score.
            Synthetic emulation backfills those signals so we can stress-test the scoring pipeline without waiting on production data.
          </p>
          <pre
            style={{
              background: 'rgba(10, 20, 45, 0.9)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: '#c4d0ff',
              fontSize: '.85rem',
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {`PSR_score = alpha1*EI + alpha2*IF + alpha3*CR + alpha4*LI + alpha5*TC`}
          </pre>
          <ul style={{ margin: '.5rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.5 }}>
            <li>EI (Emotional Intensity): sentiment-derived strength of fan feelings.</li>
            <li>IF (Interaction Frequency): cadence of direct fan touch points across channels.</li>
            <li>CR (Content Resonance): alignment between athlete messaging and fan narratives.</li>
            <li>LI (Loyalty Indicators): stickiness signals during controversy or performance dips.</li>
            <li>TC (Temporal Consistency): durability of engagement trajectories over time.</li>
          </ul>
        </article>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Social Identity Dynamics</h3>
          <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
            Tajfel &amp; Turner demonstrated that belonging and group pride drive participation. The system tracks how athlete stories
            reinforce campus culture, alumni identity, and regional pride so sponsorships resonate with their core tribes.
          </p>
        </article>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Authenticity &amp; Branding</h3>
          <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
            Beverland&apos;s authenticity research tells us that consistent voice and purpose sustain ROI. VALORE&apos;s agents analyze tone shifts,
            mission alignment, cause partnerships, and temporal stability to differentiate durable influence from manufactured hype. The
            synthetic engine populates these features (Consistency, Value Alignment, Behavioral Congruence, Communication Style, Temporal
            Stability) from raw interaction and retention series.
          </p>
          <pre
            style={{
              background: 'rgba(10, 20, 45, 0.9)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              color: '#c4d0ff',
              fontSize: '.85rem',
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {`Authenticity = beta1*C + beta2*VA + beta3*BC + beta4*CS + beta5*TS`}
          </pre>
          <ul style={{ margin: '.5rem 0 0 1.2rem', color: '#9aa7d1', lineHeight: 1.5 }}>
            <li>C (Consistency): cross-platform alignment of values, visuals, and claims.</li>
            <li>VA (Value Alignment): overlap between athlete statements and demonstrated actions.</li>
            <li>BC (Behavioral Congruence): coherence between on- and off-court personas.</li>
            <li>CS (Communication Style): natural language cadence relative to audience expectations.</li>
            <li>TS (Temporal Stability): persistence of truthfulness across campaign cycles.</li>
          </ul>
        </article>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Network &amp; Community Effects</h3>
          <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
            Evolving NIL value depends on fan-to-fan amplification. The consensus engine models network multipliers, community nodes,
            and crossover audiences so valuations capture exponential reach, not just first-order impressions.
          </p>
        </article>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Multi-Agent Accountability</h3>
          <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
            As described in the VALORE whitepaper, seven specialized agents debate valuations using structured evidence exchanges.
            Their consensus log supports NCAA/State compliance audits, fairness monitoring, and scenario replay.
          </p>
        </article>
        <article style={cardStyle}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Fairness &amp; Compliance</h3>
          <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
            Bias detection is coupled with compliance updates, legal disclosure checks, and transparency reports. The simulation exposes
            demographic parity scores, bias alerts, and remediation prompts so teams can prove equitable treatment in real time.
          </p>
        </article>
      </div>
      <small style={{ color: '#6f7aa5' }}>
        Sources: `Background/multi-agentic NIL.md`, `Background/Context Brief.md`, and `Background/paper.md` (Multi-Agentic Behavioral Intelligence for NIL Valuation).
      </small>
    </section>
  );

  return (
    <main style={containerStyle}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: '2.5rem' }}>
        <header style={{ textAlign: 'center', display: 'grid', gap: '.8rem' }}>
          <p style={{ color: '#5a8bff', letterSpacing: '.2rem', textTransform: 'uppercase', fontWeight: 600 }}>Modus Create</p>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 700 }}>VALORE NIL</h1>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 500, color: '#9aa7d1', textTransform: 'uppercase', letterSpacing: '.18rem' }}>
            {dataMode === 'emulation' ? 'Emulation' : 'Simulation'}
          </h2>
          <p style={{ color: '#8f9bbc' }}>
            Immersive behavioral intelligence experience for Phase 1 basketball proofs-of-concept.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '.6rem',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: '#9aa7d1', fontSize: '.85rem' }}>Mode:</span>
            {(['simulation', 'emulation'] as DataMode[]).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeSwitch(mode)}
                disabled={modeLoading}
                style={{
                  borderRadius: '999px',
                  padding: '.45rem 1.1rem',
                  border:
                    mode === dataMode
                      ? '1px solid rgba(89, 131, 255, 0.8)'
                      : '1px solid rgba(90, 100, 150, 0.35)',
                  background:
                    mode === dataMode
                      ? 'linear-gradient(135deg, rgba(89, 131, 255, 0.45), rgba(25, 211, 255, 0.3))'
                      : 'rgba(5, 10, 30, 0.8)',
                  color: '#e8ecff',
                  fontWeight: 600,
                  cursor: modeLoading ? 'wait' : 'pointer',
                  opacity: modeLoading ? 0.6 : 1,
                }}
              >
                {mode === 'simulation' ? 'Simulation' : 'Emulation'}
              </button>
            ))}
            {modeLoading && (
              <span style={{ color: '#5a8bff', fontSize: '.85rem' }}>Refreshing…</span>
            )}
            {modeError && !modeLoading && (
              <span style={{ color: '#f87171', fontSize: '.85rem' }}>{modeError}</span>
            )}
          </div>
        </header>

        <DashboardTabs
          renderDashboard={() => dashboardContent}
          renderAbout={() => aboutContent}
          renderData={() => dataContent}
          renderSynthetic={() => syntheticContent}
          renderAgents={() => agentsContent}
          renderFeeds={() => feedsContent}
          renderHowTo={() => howToContent}
          renderTheory={() => theoryContent}
        />
      </div>
    </main>
  );
}
