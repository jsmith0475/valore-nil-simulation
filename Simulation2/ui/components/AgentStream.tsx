'use client';

import React, { useEffect, useState } from 'react';

type AgentPacket = {
  type: 'evidence' | 'consensus' | 'insight' | 'bias_alert';
  payload: any;
};

type Status = 'connecting' | 'open' | 'complete' | 'error';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:8000/ws/agents';

export function AgentStream({
  persona,
  programId,
  mode,
}: {
  persona: string;
  programId: string;
  mode: 'simulation' | 'emulation';
}) {
  const [messages, setMessages] = useState<AgentPacket[]>([]);
  const [status, setStatus] = useState<Status>('connecting');

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
        setMessages(prev => [...prev, data]);
      } catch (error) {
        console.warn('Invalid packet', error);
      }
    };

    return () => {
      socket.close();
    };
  }, [programId, mode]);

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
              </div>
              <p style={{ margin: 0, fontSize: '.95rem' }}>
                {packet.type === 'evidence'
                  ? packet.payload.rationale
                  : packet.type === 'consensus'
                  ? `Valuation: $${packet.payload.valuation.toLocaleString()}`
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
