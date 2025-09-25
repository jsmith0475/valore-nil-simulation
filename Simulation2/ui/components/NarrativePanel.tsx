'use client';

import React, { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

type PersonaKey = 'athletic_director' | 'coach' | 'compliance';

const defaultPrompt = 'Provide a NIL narrative summary.';

export function NarrativePanel({
  persona,
  personaPrompt,
  mode,
}: {
  persona: PersonaKey;
  personaPrompt: string;
  mode: 'simulation' | 'emulation';
}) {
  const personaLabel = persona.replace('_', ' ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [narrative, setNarrative] = useState<string>('');

  useEffect(() => {
    setNarrative('');
    setError(null);
  }, [persona, mode]);

  async function fetchNarrative() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/narratives/story`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: personaPrompt || defaultPrompt, context: { persona, mode } }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate narrative');
      }
      const data = await response.json();
      setNarrative(data.narrative);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        background: 'rgba(15, 20, 40, 0.8)',
        border: '1px solid rgba(90, 100, 150, 0.2)',
        borderRadius: '18px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(2, 6, 23, 0.45)',
        display: 'grid',
        gap: '1.2rem',
      }}
    >
      <header style={{ display: 'grid', gap: '.35rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 600 }}>Narrative Generator Preview</h2>
        <p style={{ color: '#9aa7d1', fontSize: '.95rem' }}>
          Perspective: {personaLabel.toUpperCase()} — {personaPrompt || defaultPrompt}
        </p>
      </header>
      <button
        type="button"
        onClick={fetchNarrative}
        disabled={loading}
        style={{
          borderRadius: '999px',
          padding: '.75rem 1.8rem',
          border: 'none',
          cursor: 'pointer',
          background: loading ? 'rgba(148, 163, 184, 0.4)' : 'linear-gradient(135deg, #5983ff, #19d3ff)',
          color: '#050713',
          fontWeight: 600,
          transition: 'transform 0.2s ease',
        }}
      >
        {loading ? 'Generating…' : 'Generate Demo Narrative'}
      </button>
      {error && <p style={{ color: '#f87171', fontSize: '.9rem' }}>{error}</p>}
      {narrative && (
        <p style={{ color: '#e8ecff', fontSize: '1rem', lineHeight: 1.6 }}>{narrative}</p>
      )}
      {!narrative && !loading && !error && (
        <p style={{ color: '#9aa7d1', fontSize: '.9rem' }}>
          Narrative output will appear here. Configure the OpenAI key via environment variables to enable live GPT output.
        </p>
      )}
    </section>
  );
}
