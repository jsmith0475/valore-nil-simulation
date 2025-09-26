import Link from 'next/link';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top, rgba(20, 35, 75, 0.92), rgba(5, 10, 30, 0.95))',
  color: '#e8ecff',
  padding: '3rem 1.25rem 4rem',
};

const sectionStyle: CSSProperties = {
  background: 'rgba(5, 10, 30, 0.78)',
  border: '1px solid rgba(90, 100, 150, 0.35)',
  borderRadius: '18px',
  padding: '1.75rem 2rem',
  display: 'grid',
  gap: '0.85rem',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.92rem',
};

const headerCellStyle: CSSProperties = {
  textTransform: 'uppercase',
  letterSpacing: '.1em',
  fontSize: '.78rem',
  padding: '.65rem .75rem',
  color: '#a5b4fc',
  borderBottom: '1px solid rgba(90, 100, 150, 0.4)',
};

const cellStyle: CSSProperties = {
  padding: '.65rem .75rem',
  borderBottom: '1px solid rgba(90, 100, 150, 0.18)',
  color: '#c7d2fe',
  lineHeight: 1.5,
};

export default function FeedsIntelligencePage() {
  return (
    <main style={containerStyle}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: '1.75rem' }}>
        <header style={{ textAlign: 'center', display: 'grid', gap: '.75rem' }}>
          <h1 style={{ fontSize: '2.15rem', fontWeight: 700 }}>How Live Feeds Drive Agent Intelligence</h1>
          <p style={{ color: '#9aa7d1', maxWidth: 720, margin: '0 auto' }}>
            The emulation layer emits synthetic social, news, performance, community, and compliance events for each athlete. Every feed item is
            translated into agent metrics and then folded into parasocial, authenticity, fairness, and valuation calculations.
          </p>
          <Link
            href="/"
            style={{
              justifySelf: 'center',
              padding: '.55rem 1.3rem',
              borderRadius: '999px',
              border: '1px solid rgba(89, 131, 255, 0.6)',
              background: 'linear-gradient(135deg, rgba(89, 131, 255, 0.35), rgba(25, 211, 255, 0.25))',
              color: '#e8ecff',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Back to Dashboard
          </Link>
        </header>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>Signal Conversion Pipeline</h2>
          <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#c7d2fe', display: 'grid', gap: '.4rem', lineHeight: 1.6 }}>
            <li>
              <strong>Raw narrative capture:</strong> Live Feed entries arrive with sentiment, impact, tags, and timestamps emitted by the
              synthetic engine.
            </li>
            <li>
              <strong>Agent feature mapping:</strong> Each agent watches its themed feeds (e.g., Social Media Analysis reads social spikes,
              Risk &amp; Compliance parses disclosure updates) and converts them into metric deltas such as engagement authenticity, audit risk,
              or trust velocity.
            </li>
            <li>
              <strong>Behavioral calculus:</strong> Updated agent metrics flow into the parasocial Relationship (EI/IF/CR/LI/TC), authenticity
              (C/VA/BC/CS/TS), fairness, and compliance formulas to refresh an athlete’s scores.
            </li>
            <li>
              <strong>Valuation synthesis:</strong> The recalculated scores adjust program valuation projection, scenario uplifts, and the
              agent negotiation stream that surfaces consensus packets.
            </li>
          </ol>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>Feed Themes &amp; Agent Touchpoints</h2>
          <p style={{ color: '#9aa7d1', lineHeight: 1.6 }}>
            This matrix shows how each feed category activates specialized agents and which downstream metrics they refresh.
          </p>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>Feed Category</th>
                <th style={headerCellStyle}>Primary Agents</th>
                <th style={headerCellStyle}>Metric Inputs</th>
                <th style={headerCellStyle}>Score Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={cellStyle}>Social clips &amp; trends</td>
                <td style={cellStyle}>Social Media Analysis · Psychology</td>
                <td style={cellStyle}>Engagement authenticity, sentiment intensity, trust velocity</td>
                <td style={cellStyle}>EI, IF, CR (PSR) · fan identity tie · narrative prompts</td>
              </tr>
              <tr>
                <td style={cellStyle}>Market &amp; news briefs</td>
                <td style={cellStyle}>Market Intelligence · Brand Alignment</td>
                <td style={cellStyle}>Comparable deal alignment, market timing, story resonance</td>
                <td style={cellStyle}>Valuation projection · sponsor velocity · scenario uplift assumptions</td>
              </tr>
              <tr>
                <td style={cellStyle}>Performance trackers</td>
                <td style={cellStyle}>Athletic Performance · Psychology</td>
                <td style={cellStyle}>Stat efficiency, context adjustment, leadership signal</td>
                <td style={cellStyle}>Authenticity (TS, CS) · fairness guardrails for role equity · coach briefing cues</td>
              </tr>
              <tr>
                <td style={cellStyle}>Community signals</td>
                <td style={cellStyle}>Psychological Profile · Brand Alignment</td>
                <td style={cellStyle}>Fan identity tie, values match, trust velocity</td>
                <td style={cellStyle}>Social identity index · activation readiness · donor momentum narratives</td>
              </tr>
              <tr>
                <td style={cellStyle}>Compliance disclosures</td>
                <td style={cellStyle}>Risk &amp; Compliance · Ethics Oversight</td>
                <td style={cellStyle}>Audit risk, regulatory score, fairness drift</td>
                <td style={cellStyle}>Compliance risk · fairness index · bias alerts to negotiation stream</td>
              </tr>
              <tr>
                <td style={cellStyle}>Agent pulse inserts</td>
                <td style={cellStyle}>All agents via orchestrator</td>
                <td style={cellStyle}>Metric deltas broadcast to WebSocket</td>
                <td style={cellStyle}>Triggers UI highlights and recalculated consensus valuations</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style={sectionStyle}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>Why It Matters</h2>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#c7d2fe', display: 'grid', gap: '.35rem', lineHeight: 1.6 }}>
            <li>
              <strong>Traceability:</strong> Stakeholders can trace every valuation move back to the feed items that triggered agent deltas.
            </li>
            <li>
              <strong>Behavioral stress testing:</strong> Synthetic inputs let teams rehearse crisis, surge, or compliance-review scenarios before
              real telemetry is available.
            </li>
            <li>
              <strong>Persona readiness:</strong> Athletic directors, coaches, and compliance officers view the same underlying evidence filtered
              through narratives tailored to their decisions.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
