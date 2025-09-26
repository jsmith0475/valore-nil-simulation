'use client';

import React, { useState } from 'react';

type TabKey = 'dashboard' | 'about' | 'data' | 'synthetic' | 'agents' | 'feeds' | 'howTo' | 'theory';

type Props = {
  renderDashboard: () => React.ReactNode;
  renderAbout: () => React.ReactNode;
  renderData: () => React.ReactNode;
  renderSynthetic: () => React.ReactNode;
  renderAgents: () => React.ReactNode;
  renderFeeds: () => React.ReactNode;
  renderHowTo: () => React.ReactNode;
  renderTheory: () => React.ReactNode;
};

const tabLabels: Record<TabKey, string> = {
  dashboard: 'Experience',
  about: 'About',
  data: 'Data Sources',
  synthetic: 'Synthetic Data',
  agents: 'Agent Signals',
  feeds: 'Live Feeds',
  howTo: 'How to Use',
  theory: 'Science',
};

export function DashboardTabs({
  renderDashboard,
  renderAbout,
  renderData,
  renderSynthetic,
  renderAgents,
  renderFeeds,
  renderHowTo,
  renderTheory,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  return (
    <div style={{ display: 'grid', gap: '1.75rem' }}>
      <nav
        style={{
          display: 'flex',
          gap: '.85rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          background: 'rgba(5, 10, 30, 0.7)',
          border: '1px solid rgba(90, 100, 150, 0.25)',
          borderRadius: '14px',
          padding: '.6rem 1rem',
        }}
      >
        {(Object.entries(tabLabels) as [TabKey, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            style={{
              color: '#e8ecff',
              textDecoration: 'none',
              fontSize: '.9rem',
              padding: '.45rem .9rem',
              borderRadius: '999px',
              border: activeTab === key ? '1px solid rgba(89, 131, 255, 0.65)' : '1px solid rgba(90, 100, 150, 0.35)',
              background: activeTab === key ? 'linear-gradient(135deg, rgba(89, 131, 255, 0.35), rgba(25, 211, 255, 0.25))' : 'rgba(5, 10, 30, 0.8)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {label}
          </button>
        ))}
      </nav>
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'about' && renderAbout()}
      {activeTab === 'data' && renderData()}
      {activeTab === 'synthetic' && renderSynthetic()}
      {activeTab === 'agents' && renderAgents()}
      {activeTab === 'feeds' && renderFeeds()}
      {activeTab === 'howTo' && renderHowTo()}
      {activeTab === 'theory' && renderTheory()}
    </div>
  );
}
