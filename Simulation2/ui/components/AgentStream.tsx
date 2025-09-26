'use client';

import React, { useEffect, useRef, useState } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws/agents';
const MAX_MESSAGES = 120;

type AgentPacket = {
  type: 'evidence' | 'consensus' | 'insight' | 'bias_alert' | 'update';
  payload: any;
};

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
  components?: {
    psr: Record<string, number>;
    authenticity: Record<string, number>;
  };
  raw_inputs?: Record<string, number>;
  diff?: Record<string, number>;
  individuals?: SyntheticIndividualUpdate[];
};

type SyntheticIndividualUpdate = {
  athlete_id: string;
  name: string;
  position: string;
  archetype: string;
  scores: {
    psr_score: number;
    authenticity_score: number;
    fairness_index: number;
    compliance_risk: number;
    valuation_projection: number;
    engagement_velocity: number;
  };
  components?: {
    psr: Record<string, number>;
    authenticity: Record<string, number>;
  };
  raw_inputs?: Record<string, number>;
  diff?: Record<string, number>;
  agent_metrics?: Record<string, Record<string, number>>;
  agent_metrics_delta?: Record<string, Record<string, number>>;
  feed_items?: FeedItem[];
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

type Status = 'connecting' | 'open' | 'complete' | 'error';

function formatDiff(value: number, isPercent = false) {
  const scaled = isPercent ? value * 100 : value;
  if (Math.abs(scaled) < (isPercent ? 0.05 : 0.0005)) {
    return '±0';
  }
  const formatted = isPercent ? scaled.toFixed(1) : scaled.toFixed(3);
  return `${scaled >= 0 ? '+' : ''}${formatted}${isPercent ? '%' : ''}`;
}

function formatCurrencyDiff(value: number) {
  if (Math.abs(value) < 250) {
    return '±$0';
  }
  const sign = value >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(Math.round(value)).toLocaleString()}`;
}

export function AgentStream({
  persona,
  programId,
  mode,
  onUpdate,
}: {
  persona: string;
  programId: string;
  mode: 'simulation' | 'emulation';
  onUpdate?: (payload: SyntheticUpdatePayload) => void;
}) {
  const [messages, setMessages] = useState<AgentPacket[]>([]);
  const [status, setStatus] = useState<Status>('connecting');
  const [livePulse, setLivePulse] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const pulseTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setMessages([]);
    setStatus('connecting');
    const params = new URLSearchParams();
    if (programId) {
      params.set('program_id', programId);
    }
    if (mode) {
      params.set('mode', mode);
    }
    const url = params.toString() ? `${WS_URL}?${params.toString()}` : WS_URL;
    const socket = new WebSocket(url);

    socket.onopen = () => setStatus('open');
    socket.onclose = () => setStatus(prev => (prev === 'error' ? prev : 'complete'));
    socket.onerror = () => setStatus('error');
    socket.onmessage = event => {
      try {
        const data = JSON.parse(event.data) as AgentPacket;
        setMessages(prev => {
          const next = [...prev, data];
          if (next.length > MAX_MESSAGES) {
            next.splice(0, next.length - MAX_MESSAGES);
          }
          return next;
        });
        if (data.type === 'update' && data.payload && onUpdate) {
          onUpdate(data.payload as SyntheticUpdatePayload);
        }
        if (data.type === 'update') {
          if (pulseTimeoutRef.current) {
            window.clearTimeout(pulseTimeoutRef.current);
          }
          setLivePulse(true);
          const payload = data.payload as SyntheticUpdatePayload;
          if (payload?.timestamp) {
            setLastUpdateTime(new Date(payload.timestamp * 1000).toLocaleTimeString());
          } else {
            setLastUpdateTime(new Date().toLocaleTimeString());
          }
          pulseTimeoutRef.current = window.setTimeout(() => setLivePulse(false), 1600);
        }
      } catch (error) {
        console.warn('Invalid packet', error);
      }
    };

    return () => {
      socket.close();
      if (pulseTimeoutRef.current) {
        window.clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, [programId, mode, onUpdate]);

  return (
    <section
      style={{
        background: 'rgba(15, 20, 40, 0.8)',
        border: '1px solid rgba(90, 100, 150, 0.2)',
        borderRadius: '18px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(2, 6, 23, 0.45)',
        display: 'grid',
        gap: '1.25rem',
      }}
    >
      <header style={{ display: 'grid', gap: '.4rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Agent Negotiation Stream</h2>
        <p style={{ color: '#9aa7d1', fontSize: '.95rem' }}>
          Live packets from the FastAPI WebSocket showcase the multi-agent negotiation flow.
        </p>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.5rem',
            fontSize: '.85rem',
            color:
              status === 'open'
                ? '#4ade80'
                : status === 'connecting'
                ? '#facc15'
                : status === 'error'
                ? '#f87171'
                : '#9aa7d1',
          }}
        >
          • Stream status: {status}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.35rem',
            fontSize: '.82rem',
            color: '#38bdf8',
            background: livePulse ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            padding: livePulse ? '.15rem .6rem' : '.15rem .6rem',
            borderRadius: '999px',
            border: livePulse ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid rgba(56, 189, 248, 0.0)',
            opacity: livePulse ? 1 : 0,
            transition: 'opacity 0.3s ease, border 0.3s ease',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#38bdf8',
              boxShadow: livePulse ? '0 0 8px rgba(56, 189, 248, 0.7)' : 'none',
            }}
          />
          Live update{lastUpdateTime ? ` · ${lastUpdateTime}` : ''}
        </span>
        <span style={{ color: '#9aa7d1', fontSize: '.85rem' }}>
          Persona focus: {persona.replace(/_/g, ' ')}
        </span>
        <span style={{ color: '#9aa7d1', fontSize: '.85rem' }}>Data mode: {mode}</span>
      </header>

      <div
        style={{
          maxHeight: 260,
          overflowY: 'auto',
          display: 'grid',
          gap: '.9rem',
          paddingRight: '.5rem',
        }}
      >
        {messages.map((packet, idx) => {
          const background =
            packet.type === 'consensus'
              ? 'rgba(35, 80, 120, 0.65)'
              : packet.type === 'bias_alert'
              ? 'rgba(248, 113, 113, 0.18)'
              : packet.type === 'insight'
              ? 'rgba(34, 197, 94, 0.12)'
              : packet.type === 'update'
              ? 'rgba(89, 131, 255, 0.18)'
              : 'rgba(5, 10, 30, 0.85)';
          return (
            <article
              key={idx}
              style={{
                borderRadius: '14px',
                border: '1px solid rgba(90, 100, 150, 0.25)',
                background,
                padding: '1rem 1.2rem',
                display: 'grid',
                gap: '.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', color: '#9aa7d1' }}>
                <span>Type: {packet.type}</span>
                {packet.type === 'evidence' && packet.payload.confidence && (
                  <span>Confidence: {packet.payload.confidence.toFixed(2)}</span>
                )}
                {packet.type === 'consensus' && packet.payload.confidence && (
                  <span>Final Confidence: {packet.payload.confidence}</span>
                )}
                {packet.type === 'update' && packet.payload?.timestamp && (
                  <span>{new Date(packet.payload.timestamp * 1000).toLocaleTimeString()}</span>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '.95rem' }}>
                {packet.type === 'evidence'
                  ? packet.payload.rationale
                  : packet.type === 'consensus'
                  ? `Valuation: $${packet.payload.valuation.toLocaleString()}`
                  : packet.type === 'update'
                  ? 'Live synthetic update'
                  : packet.payload.message ?? packet.payload.notes?.join(' ')}
              </p>
              {packet.type === 'evidence' && (
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#9aa7d1', fontSize: '.85rem' }}>
                  {packet.payload.data_points.map((point: string) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
              {packet.type === 'consensus' && (
                <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#9aa7d1', fontSize: '.85rem' }}>
                  {packet.payload.notes.map((note: string) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              )}
              {packet.type === 'update' && packet.payload?.scores && (
                <div style={{ color: '#9aa7d1', fontSize: '.82rem', display: 'grid', gap: '.2rem' }}>
                  <p style={{ margin: 0 }}>
                    PSR {packet.payload.scores.psr_score.toFixed(2)} ({formatDiff(packet.payload.diff?.psr_score ?? 0)}) ·
                    Authenticity {packet.payload.scores.authenticity_score.toFixed(2)} (
                    {formatDiff(packet.payload.diff?.authenticity_score ?? 0)})
                  </p>
                  <p style={{ margin: 0 }}>
                    Fairness {(packet.payload.scores.fairness_index * 100).toFixed(1)}% (
                    {formatDiff(packet.payload.diff?.fairness_index ?? 0, true)}) · Compliance{' '}
                    {(packet.payload.scores.compliance_risk * 100).toFixed(1)}% (
                    {formatDiff(packet.payload.diff?.compliance_risk ?? 0, true)})
                  </p>
                  <p style={{ margin: 0 }}>
                    Valuation ${packet.payload.scores.valuation_projection.toLocaleString()} (
                    {formatCurrencyDiff(packet.payload.diff?.valuation_projection ?? 0)})
                  </p>
                  <p style={{ margin: 0 }}>
                    Sentiment {packet.payload.raw_inputs?.sentiment_mean?.toFixed(2)} (
                    {formatDiff(packet.payload.diff?.sentiment_mean ?? 0)}) · Weekly interactions{' '}
                    {Math.round(packet.payload.raw_inputs?.interactions_weekly ?? 0).toLocaleString()} (
                    {formatDiff(packet.payload.diff?.interactions_weekly ?? 0)})
                  </p>
                  {packet.payload.individuals?.length ? (
                    <div style={{ marginTop: '.45rem', display: 'grid', gap: '.35rem' }}>
                      {packet.payload.individuals.map(individual => (
                        <div
                          key={individual.athlete_id}
                          style={{
                            background: 'rgba(15, 23, 42, 0.55)',
                            borderRadius: '10px',
                            padding: '.6rem .75rem',
                            border: '1px solid rgba(56, 189, 248, 0.18)',
                          }}
                        >
                          <p style={{ margin: 0, color: '#e0f2ff', fontSize: '.85rem', fontWeight: 600 }}>
                            {individual.name} &mdash; {individual.position} · {individual.archetype}
                          </p>
                          <p style={{ margin: '.2rem 0 0 0' }}>
                            PSR {individual.scores.psr_score.toFixed(2)} ({formatDiff(individual.diff?.psr_score ?? 0)}) · Authenticity{' '}
                            {individual.scores.authenticity_score.toFixed(2)} ({formatDiff(individual.diff?.authenticity_score ?? 0)})
                          </p>
                          <p style={{ margin: 0 }}>
                            Fairness {(individual.scores.fairness_index * 100).toFixed(1)}% (
                            {formatDiff(individual.diff?.fairness_index ?? 0, true)}) · Compliance{' '}
                            {(individual.scores.compliance_risk * 100).toFixed(1)}% (
                            {formatDiff(individual.diff?.compliance_risk ?? 0, true)})
                          </p>
                          <p style={{ margin: 0 }}>
                            Valuation ${individual.scores.valuation_projection.toLocaleString()} (
                            {formatCurrencyDiff(individual.diff?.valuation_projection ?? 0)}) · Engagement velocity{' '}
                            {individual.scores.engagement_velocity.toFixed(2)} ({formatDiff(individual.diff?.engagement_velocity ?? 0)})
                          </p>
                          {individual.raw_inputs && (
                            <p style={{ margin: 0 }}>
                              Sentiment{' '}
                              {typeof individual.raw_inputs.sentiment_mean === 'number'
                                ? individual.raw_inputs.sentiment_mean.toFixed(2)
                                : '--'}{' '}
                              ({formatDiff(individual.diff?.sentiment_mean ?? 0)}) · Weekly interactions{' '}
                              {Math.round(individual.raw_inputs.interactions_weekly ?? 0).toLocaleString()} (
                              {formatDiff(individual.diff?.interactions_weekly ?? 0)}) · Share rate{' '}
                              {typeof individual.raw_inputs.share_rate === 'number'
                                ? (individual.raw_inputs.share_rate * 100).toFixed(1)
                                : '--'}%
                              ({formatDiff(individual.diff?.share_rate ?? 0)})
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </article>
          );
        })}
        {!messages.length && (
          <div style={{ color: '#9aa7d1', fontSize: '.9rem' }}>
            Waiting for agent packets... ensure the backend WebSocket is live at the configured URL.
          </div>
        )}
      </div>
    </section>
  );
}
